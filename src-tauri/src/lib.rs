mod commands;

use commands::categories::DbState;
use rusqlite::Connection;
use std::sync::{Arc, Mutex};
use tauri::Manager;

fn init_db(app_dir: &std::path::Path) -> Result<Connection, rusqlite::Error> {
    std::fs::create_dir_all(app_dir).ok();
    let db_path = app_dir.join("scriptpad.db");
    let conn = Connection::open(db_path)?;
    conn.execute_batch(include_str!("../migrations/001_init.sql"))?;
    Ok(conn)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let app_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");
            let conn = init_db(&app_dir).expect("failed to init database");
            app.manage(Arc::new(Mutex::new(conn)) as DbState);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::categories::list_categories,
            commands::categories::create_category,
            commands::categories::delete_category,
            commands::scripts::list_scripts,
            commands::scripts::get_script,
            commands::scripts::create_script,
            commands::scripts::update_script,
            commands::scripts::delete_script,
            commands::scripts::read_file_content,
            commands::executor::execute_script,
            commands::executor::stop_execution,
            commands::history::list_history,
            commands::history::list_presets,
            commands::history::save_preset,
            commands::history::delete_preset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
