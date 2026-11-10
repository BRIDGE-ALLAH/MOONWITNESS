#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod agent;
mod memory;
mod tools;

use memory::{LlmConfig, Memory, RunRecord};
use serde_json::Value;
use tauri::{Emitter, Manager, State};
use tokio::sync::Mutex;

struct Core {
    client: reqwest::Client,
    memory: Memory,
    config: Mutex<LlmConfig>,
    busy: Mutex<()>,
}

#[tauri::command]
async fn agent_run(
    goal: String,
    app: tauri::AppHandle,
    core: State<'_, Core>,
) -> Result<RunRecord, String> {
    let goal = goal.trim().to_string();
    if goal.is_empty() {
        return Err("goal is empty".into());
    }
    let _guard = core
        .busy
        .try_lock()
        .map_err(|_| "an agent run is already in flight".to_string())?;
    let config = core.config.lock().await.clone();
    let emitter = app.clone();
    let record = agent::run(&core.client, &core.memory, &config, &goal, move |step| {
        let _ = emitter.emit("agent-step", step);
    })
    .await;
    core.memory.append(&record).map_err(|e| e.to_string())?;
    Ok(record)
}

#[tauri::command]
async fn mesh_pulse(core: State<'_, Core>) -> Result<Vec<tools::NodePulse>, String> {
    Ok(tools::probe_mesh(&core.client).await)
}

#[tauri::command]
async fn system_vitals() -> Result<Value, String> {
    tokio::task::spawn_blocking(tools::vitals)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn run_history(core: State<'_, Core>) -> Vec<RunRecord> {
    core.memory.history(30)
}

#[tauri::command]
async fn config_get(core: State<'_, Core>) -> Result<LlmConfig, String> {
    Ok(core.config.lock().await.clone())
}

#[tauri::command]
async fn config_set(config: LlmConfig, core: State<'_, Core>) -> Result<LlmConfig, String> {
    if !(config.base_url.starts_with("http://") || config.base_url.starts_with("https://")) {
        return Err("base_url must be http(s)".into());
    }
    if config.model.trim().is_empty() {
        return Err("model is required".into());
    }
    let sanitized = LlmConfig {
        max_steps: config.max_steps.clamp(1, 24),
        ..config
    };
    core.memory
        .save_config(&sanitized)
        .map_err(|e| e.to_string())?;
    *core.config.lock().await = sanitized.clone();
    Ok(sanitized)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let root = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| dirs::data_dir().unwrap_or_default().join("RockSoul"));
            let memory = Memory::open(root)?;
            let config = memory.load_config();
            app.manage(Core {
                client: reqwest::Client::builder().user_agent("rocksoul/0.1").build()?,
                memory,
                config: Mutex::new(config),
                busy: Mutex::new(()),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            agent_run,
            mesh_pulse,
            system_vitals,
            run_history,
            config_get,
            config_set
        ])
        .run(tauri::generate_context!())
        .expect("rocksoul failed to boot");
}
