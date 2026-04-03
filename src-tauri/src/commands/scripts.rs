use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

use super::categories::DbState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Script {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub script_type: String,
    pub file_path: Option<String>,
    pub content: Option<String>,
    pub shell: String,
    pub working_dir: Option<String>,
    pub category_id: Option<i64>,
    pub tags: String,
    pub params_schema: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateScript {
    pub name: String,
    pub description: Option<String>,
    pub script_type: String,
    pub file_path: Option<String>,
    pub content: Option<String>,
    pub shell: Option<String>,
    pub working_dir: Option<String>,
    pub category_id: Option<i64>,
    pub tags: Option<String>,
    pub params_schema: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateScript {
    pub name: Option<String>,
    pub description: Option<String>,
    pub script_type: Option<String>,
    pub file_path: Option<String>,
    pub content: Option<String>,
    pub shell: Option<String>,
    pub working_dir: Option<String>,
    pub category_id: Option<i64>,
    pub tags: Option<String>,
    pub params_schema: Option<String>,
}

fn row_to_script(row: &rusqlite::Row) -> rusqlite::Result<Script> {
    Ok(Script {
        id: row.get(0)?,
        name: row.get(1)?,
        description: row.get(2)?,
        script_type: row.get(3)?,
        file_path: row.get(4)?,
        content: row.get(5)?,
        shell: row.get(6)?,
        working_dir: row.get(7)?,
        category_id: row.get(8)?,
        tags: row.get(9)?,
        params_schema: row.get(10)?,
        created_at: row.get(11)?,
        updated_at: row.get(12)?,
    })
}

const SELECT_FIELDS: &str = "id, name, description, script_type, file_path, content, shell, working_dir, category_id, tags, params_schema, created_at, updated_at";

#[tauri::command]
pub fn list_scripts(
    db: State<'_, DbState>,
    category_id: Option<i64>,
    search: Option<String>,
) -> Result<Vec<Script>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    let mut sql = format!("SELECT {} FROM scripts WHERE 1=1", SELECT_FIELDS);
    let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    // category_id = 1 means "全部", don't filter
    if let Some(cid) = category_id {
        if cid != 1 {
            sql.push_str(" AND category_id = ?");
            param_values.push(Box::new(cid));
        }
    }
    if let Some(ref s) = search {
        if !s.is_empty() {
            sql.push_str(" AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)");
            let pattern = format!("%{}%", s);
            param_values.push(Box::new(pattern.clone()));
            param_values.push(Box::new(pattern.clone()));
            param_values.push(Box::new(pattern));
        }
    }
    sql.push_str(" ORDER BY updated_at DESC");

    let params_ref: Vec<&dyn rusqlite::types::ToSql> = param_values.iter().map(|p| p.as_ref()).collect();
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(params_ref.as_slice(), row_to_script)
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(rows)
}

#[tauri::command]
pub fn get_script(db: State<'_, DbState>, id: i64) -> Result<Script, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let sql = format!("SELECT {} FROM scripts WHERE id = ?1", SELECT_FIELDS);
    conn.query_row(&sql, [id], row_to_script)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_script(db: State<'_, DbState>, script: CreateScript) -> Result<Script, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO scripts (name, description, script_type, file_path, content, shell, working_dir, category_id, tags, params_schema) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            script.name,
            script.description.unwrap_or_default(),
            script.script_type,
            script.file_path,
            script.content,
            script.shell.unwrap_or_else(|| "/bin/bash".to_string()),
            script.working_dir,
            script.category_id,
            script.tags.unwrap_or_else(|| "[]".to_string()),
            script.params_schema.unwrap_or_else(|| "[]".to_string()),
        ],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    let sql = format!("SELECT {} FROM scripts WHERE id = ?1", SELECT_FIELDS);
    conn.query_row(&sql, [id], row_to_script)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_script(db: State<'_, DbState>, id: i64, script: UpdateScript) -> Result<Script, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    let mut sets: Vec<String> = Vec::new();
    let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    macro_rules! maybe_set {
        ($field:ident, $col:expr) => {
            if let Some(ref val) = script.$field {
                sets.push(format!("{} = ?", $col));
                param_values.push(Box::new(val.clone()));
            }
        };
    }

    maybe_set!(name, "name");
    maybe_set!(description, "description");
    maybe_set!(script_type, "script_type");
    maybe_set!(file_path, "file_path");
    maybe_set!(content, "content");
    maybe_set!(shell, "shell");
    maybe_set!(working_dir, "working_dir");
    maybe_set!(tags, "tags");
    maybe_set!(params_schema, "params_schema");

    if let Some(cid) = script.category_id {
        sets.push("category_id = ?".to_string());
        param_values.push(Box::new(cid));
    }

    if sets.is_empty() {
        let sql = format!("SELECT {} FROM scripts WHERE id = ?1", SELECT_FIELDS);
        return conn.query_row(&sql, [id], row_to_script).map_err(|e| e.to_string());
    }

    sets.push("updated_at = CURRENT_TIMESTAMP".to_string());
    let sql = format!("UPDATE scripts SET {} WHERE id = ?", sets.join(", "));
    param_values.push(Box::new(id));

    let params_ref: Vec<&dyn rusqlite::types::ToSql> = param_values.iter().map(|p| p.as_ref()).collect();
    conn.execute(&sql, params_ref.as_slice()).map_err(|e| e.to_string())?;

    let sql = format!("SELECT {} FROM scripts WHERE id = ?1", SELECT_FIELDS);
    conn.query_row(&sql, [id], row_to_script).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_script(db: State<'_, DbState>, id: i64) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM scripts WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("无法读取文件 {}: {}", path, e))
}
