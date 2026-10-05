//! `get_app_info`: facts about the running app for the UI.

use std::path::PathBuf;

use serde::Serialize;
use tauri::{AppHandle, State};

use crate::error::AppResult;

/// The data folder chosen at start (see `data_dir` in lib.rs), kept as managed state.
pub struct DataDir(pub PathBuf);

/// Mirrored by `AppInfo` in src/api/app.ts.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    /// productName, i.e. APP_NAME from .env.
    pub name: String,
    pub version: String,
    pub identifier: String,
    pub debug: bool,
    pub data_dir: String,
}

#[tauri::command]
pub async fn get_app_info(app: AppHandle, data_dir: State<'_, DataDir>) -> AppResult<AppInfo> {
    let package = app.package_info();
    Ok(AppInfo {
        name: package.name.clone(),
        version: package.version.to_string(),
        identifier: app.config().identifier.clone(),
        debug: cfg!(debug_assertions),
        data_dir: data_dir.0.display().to_string(),
    })
}
