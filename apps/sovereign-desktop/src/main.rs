use anyhow::Result;
use tauri::Manager;
use std::path::PathBuf;
use std::sync::Arc;
use tracing::{info, error};
use tracing_subscriber::{fmt, EnvFilter};

mod sidecar;
mod commands;
mod storage;
mod sync;
mod license;
mod state;

use sidecar::SidecarManager;
use storage::surrealdb::init_surrealdb;
use sync::engine::SyncEngine;
use commands::auth::{init_app, AppInitResult};
use state::AppState;

pub fn run() {
    // Initialize tracing
    fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_target(false)
        .init();

    info!("Starting Sovereign Desktop v{}", env!("CARGO_PKG_VERSION"));

    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();

            // Get data directory
            let data_dir = std::env::var("SOVEREIGN_DATA_DIR")
                .map(PathBuf::from)
                .unwrap_or_else(|_| {
                    std::env::current_dir()
                        .unwrap_or_else(|_| PathBuf::from("."))
                        .join(".data")
                })
                .join("Sovereign");

            // Initialize sidecar manager
            let bin_path = data_dir.join("bin");
            std::fs::create_dir_all(&bin_path)?;
            let sidecar_manager = Arc::new(SidecarManager::new(bin_path));

            // Initialize embedded SurrealDB
            let db = tauri::async_runtime::block_on(init_surrealdb(data_dir.clone()))?;

            // Initialize sync engine
            let sync_engine = Arc::new(SyncEngine::new(db.clone()));

            // Store state
            let state = Arc::new(AppState {
                sidecar_manager: sidecar_manager.clone(),
                db: db.clone(),
                sync_engine: sync_engine.clone(),
            });

            handle.manage(state);

            // Initialize app (check license, etc.)
            let init_result = tauri::async_runtime::block_on(init_app())?;

            if !init_result.license_valid {
                // Show license entry screen
                info!("License not valid, showing license entry");
            }

            // Start sync engine
            tauri::async_runtime::spawn(async move {
                sync_engine.start().await;
            });

            // Start sidecar health monitoring
            let sidecar_manager_clone = sidecar_manager.clone();
            tauri::async_runtime::spawn(async move {
                let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
                loop {
                    interval.tick().await;
                    let _ = sidecar_manager_clone.get_all_health().await;
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Auth commands
            commands::auth::auth_windows_hello,
            commands::auth::auth_windows_hello_verify,
            commands::auth::auth_pat,
            commands::auth::get_jwt,
            commands::auth::verify_license,
            commands::auth::refresh_token,
            commands::auth::init_app,
            // Git commands
            commands::git::git_repo_init,
            commands::git::git_repo_open,
            commands::git::git_repo_list,
            commands::git::git_repo_remove,
            commands::git::git_commit_create,
            commands::git::git_branch_list,
            commands::git::git_branch_create,
            commands::git::git_branch_delete,
            commands::git::git_status,
            commands::git::git_diff,
            commands::git::git_log,
            commands::git::git_remote_list,
            commands::git::git_remote_add,
            commands::git::git_remote_remove,
            commands::git::git_fetch,
            commands::git::git_pull,
            commands::git::git_push,
            commands::git::git_stash_list,
            commands::git::git_stash_create,
            commands::git::git_stash_pop,
            commands::git::git_stash_drop,
            // Mesh commands
            commands::mesh::mesh_status,
            commands::mesh::mesh_start,
            commands::mesh::mesh_stop,
            commands::mesh::mesh_restart,
            commands::mesh::mesh_logs,
            commands::mesh::mesh_health,
            // SurrealDB commands
            commands::surreal::surreal_query,
            commands::surreal::surreal_create,
            commands::surreal::surreal_read,
            commands::surreal::surreal_update,
            commands::surreal::surreal_delete,
            commands::surreal::surreal_health,
            // PPPoE commands
            commands::pppoe::pppoe_list,
            commands::pppoe::pppoe_create,
            commands::pppoe::pppoe_delete,
            commands::pppoe::pppoe_stats,
            // Tenant commands
            commands::tenant::tenant_list,
            commands::tenant::tenant_create,
            commands::tenant::tenant_update,
            commands::tenant::tenant_delete,
            commands::tenant::tenant_usage,
            commands::tenant::api_key_create,
            commands::tenant::api_key_list,
            commands::tenant::api_key_revoke,
            // Diagnostics commands
            commands::diagnostics::diagnostics_run,
            commands::diagnostics::diagnostics_history,
            // Settings commands
            commands::settings::settings_get,
            commands::settings::settings_set,
            commands::settings::settings_list,
        ])
        .run(tauri::generate_context!())
        .expect("Error running Tauri application");
}

fn main() {
    run();
}
