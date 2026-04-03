use rusqlite::Connection;
use std::sync::{Arc, Mutex};
use tauri::State;
use serde::{Deserialize, Serialize};

pub type DbState = Arc<Mutex<Connection>>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub icon: String,
    pub sort_order: i64,
    pub created_at: String,
}

#[tauri::command]
pub fn list_categories(db: State<'_, DbState>) -> Result<Vec<Category>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, icon, sort_order, created_at FROM categories ORDER BY sort_order")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                icon: row.get(2)?,
                sort_order: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(rows)
}

#[tauri::command]
pub fn create_category(db: State<'_, DbState>, name: String, icon: String) -> Result<Category, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO categories (name, icon, sort_order) VALUES (?1, ?2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories))",
        rusqlite::params![name, icon],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    let cat = conn
        .query_row(
            "SELECT id, name, icon, sort_order, created_at FROM categories WHERE id = ?1",
            [id],
            |row| {
                Ok(Category {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    icon: row.get(2)?,
                    sort_order: row.get(3)?,
                    created_at: row.get(4)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;
    Ok(cat)
}

#[tauri::command]
pub fn delete_category(db: State<'_, DbState>, id: i64) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    // 将该分类下的脚本移到未分类
    conn.execute(
        "UPDATE scripts SET category_id = NULL WHERE category_id = ?1",
        [id],
    ).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM categories WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
