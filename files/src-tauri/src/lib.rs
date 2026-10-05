//! The desktop app: Tauri setup, shared state and the commands the UI can call.
//!
//! A request from the UI goes through these layers (see AGENTS.md):
//! Vue page → Pinia store → `src/api` (invoke) → command (`<feature>/commands.rs`)
//! → service (`<feature>/service.rs`) → repository (`<feature>/repository.rs`) → SQLite (`db`).

mod app_info;
mod db;
mod error;
mod notes;

use std::path::{Path, PathBuf};
use std::sync::Arc;

use tauri::{AppHandle, Manager};

/// File name of the SQLite database in the data folder.
const DATABASE_FILE: &str = "app.sqlite";

pub fn run() {
    tauri::Builder::default()
        .plugin(logging())
        .setup(|app| {
            let data_dir = data_dir(app.handle())?;
            log::info!("data folder: {}", data_dir.display());
            let db = Arc::new(db::Database::open(&data_dir.join(DATABASE_FILE))?);

            app.manage(app_info::DataDir(data_dir));
            app.manage(notes::NotesService::new(notes::NotesRepository::new(db)));

            // The title follows APP_NAME (productName, applied by scripts/tauri.ts).
            if let Some(window) = app.get_webview_window("main") {
                window.set_title(&app.package_info().name)?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app_info::get_app_info,
            notes::commands::list_notes,
            notes::commands::create_note,
            notes::commands::delete_note,
        ])
        .run(tauri::generate_context!())
        .expect("error while running the app");
}

/// Where the app keeps its data. Debug builds (`npm run dev`) use the project's `data/` folder,
/// so development never touches the data of an installed release; release builds use
/// `~/Library/Application Support/<identifier>`.
fn data_dir(app: &AppHandle) -> tauri::Result<PathBuf> {
    if cfg!(debug_assertions) {
        let project = Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("src-tauri is inside the project folder");
        Ok(project.join("data"))
    } else {
        app.path().app_data_dir()
    }
}

/// Logs to the terminal and to `~/Library/Logs/<identifier>/`. Debug builds also log this
/// crate's debug messages.
fn logging() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    let own_level = if cfg!(debug_assertions) {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Info
    };
    tauri_plugin_log::Builder::new()
        .level(log::LevelFilter::Info)
        .level_for("app_lib", own_level)
        .build()
}
