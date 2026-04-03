use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

use super::categories::DbState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExecutionHistory {
    pub id: i64,
    pub script_id: i64,
    pub params: String,
    pub exit_code: Option<i64>,
    pub output_summary: Option<String>,
    pub started_at: String,
    pub finished_at: Option<String>,
    pub duration_ms: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParamPreset {
    pub id: i64,
    pub script_id: i64,
    pub name: String,
    pub params: String,
    pub created_at: String,
}

#[tauri::command]
pub fn list_history(db: State<'_, DbState>, script_id: i64) -> Result<Vec<ExecutionHistory>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, script_id, params, exit_code, output_summary, started_at, finished_at, duration_ms FROM execution_history WHERE script_id = ?1 ORDER BY started_at DESC LIMIT 50")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([script_id], |row| {
            Ok(ExecutionHistory {
                id: row.get(0)?,
                script_id: row.get(1)?,
                params: row.get(2)?,
                exit_code: row.get(3)?,
                output_summary: row.get(4)?,
                started_at: row.get(5)?,
                finished_at: row.get(6)?,
                duration_ms: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(rows)
}

#[tauri::command]
pub fn list_presets(db: State<'_, DbState>, script_id: i64) -> Result<Vec<ParamPreset>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, script_id, name, params, created_at FROM param_presets WHERE script_id = ?1 ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([script_id], |row| {
            Ok(ParamPreset {
                id: row.get(0)?,
                script_id: row.get(1)?,
                name: row.get(2)?,
                params: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(rows)
}

#[tauri::command]
pub fn save_preset(
    db: State<'_, DbState>,
    script_id: i64,
    name: String,
    params: std::collections::HashMap<String, String>,
) -> Result<ParamPreset, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let params_json = serde_json::to_string(&params).unwrap_or_default();
    conn.execute(
        "INSERT INTO param_presets (script_id, name, params) VALUES (?1, ?2, ?3)",
        params![script_id, name, params_json],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, script_id, name, params, created_at FROM param_presets WHERE id = ?1",
        [id],
        |row| {
            Ok(ParamPreset {
                id: row.get(0)?,
                script_id: row.get(1)?,
                name: row.get(2)?,
                params: row.get(3)?,
                created_at: row.get(4)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_preset(db: State<'_, DbState>, id: i64) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM param_presets WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
