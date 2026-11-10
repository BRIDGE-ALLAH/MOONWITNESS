use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::command;
use crate::state::AppState;
use tauri::State;
use surrealdb::sql::{Value, Thing};
use chrono::Utc;
use std::collections::BTreeMap;
use std::os::windows::ffi::OsStrExt;
use windows::Win32::Storage::FileSystem::GetDiskFreeSpaceExW;
use windows::Win32::Foundation::HANDLE;

#[derive(Debug, Serialize, Deserialize)]
pub struct DiagnosticResult {
    pub id: String,
    pub name: String,
    pub status: String, // pass, fail, warn
    pub message: String,
    pub details: Option<serde_json::Value>,
    pub timestamp: String,
    pub duration_ms: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiagnosticsRun {
    pub results: Vec<DiagnosticResult>,
    pub overall: String, // pass, fail, warn
    pub started_at: String,
    pub completed_at: String,
}

#[command]
pub async fn diagnostics_run(
    state: State<'_, AppState>,
) -> Result<DiagnosticsRun, String> {
    let started_at = Utc::now().to_rfc3339();
    let mut results = Vec::new();

    // Check 1: SurrealDB connectivity
    let db_check = check_surrealdb(&state.db).await;
    results.push(db_check);

    // Check 2: Sidecar processes
    let sidecar_check = check_sidecars(&state.sidecar_manager).await;
    results.push(sidecar_check);

    // Check 3: Disk space
    let disk_check = check_disk_space().await;
    results.push(disk_check);

    // Check 4: Memory usage
    let memory_check = check_memory().await;
    results.push(memory_check);

    // Check 5: Network connectivity (to local services)
    let network_check = check_network().await;
    results.push(network_check);

    // Check 6: License validity
    let license_check = check_license().await;
    results.push(license_check);

    // Check 7: Git repositories accessibility
    let git_check = check_git_repos(&state.db).await;
    results.push(git_check);

    let overall = if results.iter().any(|r| r.status == "fail") {
        "fail"
    } else if results.iter().any(|r| r.status == "warn") {
        "warn"
    } else {
        "pass"
    };

    let completed_at = Utc::now().to_rfc3339();

    // Store in database
    let db = &state.db;
    let mut record = BTreeMap::new();
    record.insert("results".to_string(), Value::from(serde_json::to_value(&results).unwrap()));
    record.insert("overall".to_string(), Value::from(overall));
    record.insert("started_at".to_string(), Value::from(started_at.clone()));
    record.insert("completed_at".to_string(), Value::from(completed_at.clone()));
    let _ = db.create("diagnostics_runs").content(Value::from(record)).await;

    Ok(DiagnosticsRun {
        results,
        overall: overall.to_string(),
        started_at,
        completed_at,
    })
}

async fn check_surrealdb(db: &crate::storage::surrealdb::SurrealLocal) -> DiagnosticResult {
    let start = std::time::Instant::now();
    let healthy = crate::storage::surrealdb::health_check(db).await;
    DiagnosticResult {
        id: uuid::Uuid::new_v4().to_string(),
        name: "SurrealDB Connectivity".to_string(),
        status: if healthy { "pass" } else { "fail" }.to_string(),
        message: if healthy { "Database connection OK" } else { "Cannot connect to embedded SurrealDB" }.to_string(),
        details: None,
        timestamp: Utc::now().to_rfc3339(),
        duration_ms: start.elapsed().as_millis() as u64,
    }
}

async fn check_sidecars(sidecar: &crate::sidecar::SidecarManager) -> DiagnosticResult {
    let start = std::time::Instant::now();
    let health = sidecar.get_all_health().await;
    let (healthy, details) = match health {
        Ok(h) => {
            let running = h.values().filter(|(_, pid, _, _)| pid.is_some()).count();
            let total = h.len();
            (running > 0, Some(serde_json::json!({"running": running, "total": total})))
        }
        Err(_) => (false, None),
    };
    DiagnosticResult {
        id: uuid::Uuid::new_v4().to_string(),
        name: "Sidecar Services".to_string(),
        status: if healthy { "pass" } else { "warn" }.to_string(),
        message: if healthy { "Sidecar services running" } else { "No sidecar services running" }.to_string(),
        details,
        timestamp: Utc::now().to_rfc3339(),
        duration_ms: start.elapsed().as_millis() as u64,
    }
}

async fn check_disk_space() -> DiagnosticResult {
    let start = std::time::Instant::now();
    let data_dir = dirs::data_dir().unwrap_or_else(|| std::path::PathBuf::from(".")).join("Sovereign");
    let free_space = get_free_space(&data_dir).unwrap_or(0);
    let free_gb = free_space / (1024 * 1024 * 1024);
    DiagnosticResult {
        id: uuid::Uuid::new_v4().to_string(),
        name: "Disk Space".to_string(),
        status: if free_gb > 5 { "pass" } else if free_gb > 1 { "warn" } else { "fail" }.to_string(),
        message: format!("{} GB free on data volume", free_gb),
        details: Some(serde_json::json!({"free_gb": free_gb})),
        timestamp: Utc::now().to_rfc3339(),
        duration_ms: start.elapsed().as_millis() as u64,
    }
}

async fn check_memory() -> DiagnosticResult {
    let start = std::time::Instant::now();
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();
    let total_mem = sys.total_memory();
    let used_mem = sys.used_memory();
    let free_gb = (total_mem - used_mem) / (1024 * 1024 * 1024);
    DiagnosticResult {
        id: uuid::Uuid::new_v4().to_string(),
        name: "Memory".to_string(),
        status: if free_gb > 2 { "pass" } else if free_gb > 1 { "warn" } else { "fail" }.to_string(),
        message: format!("{} GB free memory", free_gb),
        details: Some(serde_json::json!({"free_gb": free_gb, "total_gb": total_mem / (1024*1024*1024)})),
        timestamp: Utc::now().to_rfc3339(),
        duration_ms: start.elapsed().as_millis() as u64,
    }
}

async fn check_network() -> DiagnosticResult {
    let start = std::time::Instant::now();
    // Check localhost ports
    let ports = [3000, 3001, 3002, 3003, 3004, 3200, 4000, 8091, 8092, 1812];
    let mut reachable = 0;
    for port in ports {
        if std::net::TcpStream::connect(format!("127.0.0.1:{}", port)).is_ok() {
            reachable += 1;
        }
    }
    DiagnosticResult {
        id: uuid::Uuid::new_v4().to_string(),
        name: "Local Network Services".to_string(),
        status: if reachable > 5 { "pass" } else if reachable > 2 { "warn" } else { "fail" }.to_string(),
        message: format!("{}/{} local services reachable", reachable, ports.len()),
        details: Some(serde_json::json!({"reachable": reachable, "total": ports.len()})),
        timestamp: Utc::now().to_rfc3339(),
        duration_ms: start.elapsed().as_millis() as u64,
    }
}

async fn check_license() -> DiagnosticResult {
    let start = std::time::Instant::now();
    let license_valid = crate::license::validate::LicenseManager::new(
        dirs::data_dir().unwrap().join("Sovereign")
    ).validate_current().is_ok();
    DiagnosticResult {
        id: uuid::Uuid::new_v4().to_string(),
        name: "License Validation".to_string(),
        status: if license_valid { "pass" } else { "fail" }.to_string(),
        message: if license_valid { "License valid" } else { "License invalid or missing" }.to_string(),
        details: None,
        timestamp: Utc::now().to_rfc3339(),
        duration_ms: start.elapsed().as_millis() as u64,
    }
}

async fn check_git_repos(db: &crate::storage::surrealdb::SurrealLocal) -> DiagnosticResult {
    let start = std::time::Instant::now();
    let mut result = db.query("SELECT path FROM git_repositories").await;
    let (accessible, total) = match result {
        Ok(mut r) => {
            let paths: Vec<Value> = r.take(0).unwrap_or_default();
            let mut accessible = 0;
            for path_val in &paths {
                if let Some(path_str) = path_val.get("path").and_then(|v| v.as_str()) {
                    if std::path::Path::new(path_str).join(".git").exists() {
                        accessible += 1;
                    }
                }
            }
            (accessible, paths.len())
        }
        Err(_) => (0, 0),
    };
    DiagnosticResult {
        id: uuid::Uuid::new_v4().to_string(),
        name: "Git Repositories".to_string(),
        status: if total == 0 { "pass" } else if accessible == total { "pass" } else if accessible > 0 { "warn" } else { "fail" }.to_string(),
        message: format!("{}/{} git repositories accessible", accessible, total),
        details: Some(serde_json::json!({"accessible": accessible, "total": total})),
        timestamp: Utc::now().to_rfc3339(),
        duration_ms: start.elapsed().as_millis() as u64,
    }
}

fn get_free_space(path: &std::path::Path) -> Option<u64> {
    let wide_path: Vec<u16> = path.as_os_str().encode_utf16().chain(std::iter::once(0)).collect();
    let mut free_bytes: u64 = 0;
    let mut total_bytes: u64 = 0;
    let mut total_free_bytes: u64 = 0;
    let result = unsafe {
        GetDiskFreeSpaceExW(
            windows::core::PCWSTR(wide_path.as_ptr()),
            &mut free_bytes,
            &mut total_bytes,
            &mut total_free_bytes,
        )
    };
    if result.as_bool() {
        Some(free_bytes)
    } else {
        None
    }
}

#[command]
pub async fn diagnostics_history(
    limit: usize,
    state: State<'_, AppState>,
) -> Result<Vec<DiagnosticsRun>, String> {
    let db = &state.db;
    let mut result = db.query("SELECT * FROM diagnostics_runs ORDER BY completed_at DESC LIMIT $limit")
        .bind(("limit", limit as i64))
        .await
        .map_err(|e| e.to_string())?;
    let runs: Vec<DiagnosticsRun> = result.take(0).map_err(|e| e.to_string())?;
    Ok(runs)
}
