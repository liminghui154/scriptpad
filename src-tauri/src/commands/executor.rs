use std::collections::HashMap;
use std::sync::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Emitter, State};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

use super::categories::DbState;

static RUNNING_PROCESSES: std::sync::LazyLock<Mutex<HashMap<i64, u32>>> =
    std::sync::LazyLock::new(|| Mutex::new(HashMap::new()));

#[derive(Clone, Serialize)]
struct ScriptOutputEvent {
    execution_id: i64,
    stream: String,
    data: String,
}

#[derive(Clone, Serialize)]
struct ExecutionCompleteEvent {
    execution_id: i64,
    exit_code: i32,
    duration_ms: i64,
}

#[tauri::command]
pub async fn execute_script(
    app: AppHandle,
    db: State<'_, DbState>,
    script_id: i64,
    params: HashMap<String, String>,
) -> Result<i64, String> {
    // Get script info
    let (shell, content, file_path, script_type, working_dir) = {
        let conn = db.lock().map_err(|e| e.to_string())?;
        let row = conn.query_row(
            "SELECT shell, content, file_path, script_type, working_dir FROM scripts WHERE id = ?1",
            [script_id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, Option<String>>(1)?,
                    row.get::<_, Option<String>>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, Option<String>>(4)?,
                ))
            },
        ).map_err(|e| e.to_string())?;
        row
    };

    // Insert execution record
    let execution_id = {
        let conn = db.lock().map_err(|e| e.to_string())?;
        let params_json = serde_json::to_string(&params).unwrap_or_default();
        conn.execute(
            "INSERT INTO execution_history (script_id, params) VALUES (?1, ?2)",
            rusqlite::params![script_id, params_json],
        ).map_err(|e| e.to_string())?;
        conn.last_insert_rowid()
    };

    let start = std::time::Instant::now();

    // Build the command
    let script_content = if script_type == "inline" {
        content.unwrap_or_default()
    } else {
        file_path.clone().unwrap_or_default()
    };

    // Substitute params into script content
    let mut resolved = script_content.clone();
    for (key, value) in &params {
        resolved = resolved.replace(&format!("${{{}}}", key), value);
        resolved = resolved.replace(&format!("${}", key), value);
    }

    let mut cmd = Command::new(&shell);
    if script_type == "inline" {
        cmd.arg("-c").arg(&resolved);
    } else {
        cmd.arg(&resolved);
    }

    if let Some(ref wd) = working_dir {
        cmd.current_dir(wd);
    }

    // Set env vars from params
    for (key, value) in &params {
        cmd.env(key, value);
    }

    cmd.stdout(std::process::Stdio::piped());
    cmd.stderr(std::process::Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| e.to_string())?;

    // Store PID for stop functionality
    if let Some(pid) = child.id() {
        if let Ok(mut procs) = RUNNING_PROCESSES.lock() {
            procs.insert(execution_id, pid);
        }
    }

    let stdout = child.stdout.take();
    let stderr = child.stderr.take();

    let app_clone = app.clone();
    let eid = execution_id;

    // Stream stdout
    if let Some(stdout) = stdout {
        let app_out = app_clone.clone();
        tokio::spawn(async move {
            let reader = BufReader::new(stdout);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let _ = app_out.emit("script-output", ScriptOutputEvent {
                    execution_id: eid,
                    stream: "stdout".to_string(),
                    data: line,
                });
            }
        });
    }

    // Stream stderr
    if let Some(stderr) = stderr {
        let app_err = app_clone.clone();
        tokio::spawn(async move {
            let reader = BufReader::new(stderr);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let _ = app_err.emit("script-output", ScriptOutputEvent {
                    execution_id: eid,
                    stream: "stderr".to_string(),
                    data: line,
                });
            }
        });
    }

    // Wait for completion in background
    let db_clone = db.inner().clone();
    let app_complete = app.clone();
    tokio::spawn(async move {
        let status = child.wait().await;
        let duration_ms = start.elapsed().as_millis() as i64;
        let exit_code = status.map(|s| s.code().unwrap_or(-1)).unwrap_or(-1);

        // Remove from running processes
        if let Ok(mut procs) = RUNNING_PROCESSES.lock() {
            procs.remove(&eid);
        }

        // Update execution history
        if let Ok(conn) = db_clone.lock() {
            let _: Result<usize, _> = conn.execute(
                "UPDATE execution_history SET exit_code = ?1, finished_at = CURRENT_TIMESTAMP, duration_ms = ?2 WHERE id = ?3",
                rusqlite::params![exit_code, duration_ms, eid],
            );
        }

        let _ = app_complete.emit("execution-complete", ExecutionCompleteEvent {
            execution_id: eid,
            exit_code,
            duration_ms,
        });
    });

    Ok(execution_id)
}

#[tauri::command]
pub fn stop_execution(execution_id: i64) -> Result<(), String> {
    let pid = {
        let procs = RUNNING_PROCESSES.lock().map_err(|e| e.to_string())?;
        procs.get(&execution_id).copied()
    };

    if let Some(pid) = pid {
        unsafe {
            libc::kill(pid as i32, libc::SIGTERM);
        }
        Ok(())
    } else {
        Err("Process not found or already finished".to_string())
    }
}
