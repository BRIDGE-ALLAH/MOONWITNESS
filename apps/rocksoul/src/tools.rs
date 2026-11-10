use serde::Serialize;
use serde_json::{json, Value};
use std::time::{Duration, Instant};
use sysinfo::System;

use crate::memory::Memory;

pub const MESH: [(&str, &str); 9] = [
    ("dx", "http://127.0.0.1:3000"),
    ("empire", "http://127.0.0.1:3001"),
    ("moonwitness", "http://127.0.0.1:3002"),
    ("e-isp", "http://127.0.0.1:3003"),
    ("rid", "http://127.0.0.1:3004"),
    ("git-engine", "http://127.0.0.1:3200/api/v1/health"),
    ("arsy", "http://127.0.0.1:4000/health"),
    ("pocketbase", "http://127.0.0.1:8091/api/health"),
    ("legend", "http://127.0.0.1:8092/health"),
];

pub const CODEX_URL: &str = "https://codex.a-l-l-a-h.com/api/codex";
pub const LEGEND_QUERY_URL: &str = "http://127.0.0.1:8092/api/v1/query";
pub const LEGEND_ADMIN_TOKEN: &str =
    "43a5c8d8b0df0ba76ff5f45bd03bbe185c306cde2fe2c4ba7a8244aee87f494d";

const BODY_CAP: usize = 6_000;

#[derive(Serialize, Clone)]
pub struct NodePulse {
    pub id: String,
    pub url: String,
    pub online: bool,
    pub latency_ms: u128,
    pub status: u16,
}

pub fn catalog() -> &'static str {
    "mesh_probe(input: none) -> live health + latency of the 9 sovereign mesh nodes\n\
     codex_dashboard(input: none) -> live KPIs, milestones and open tasks from Sovereign Codex edge\n\
     surrealql_exec(input: SurrealQL query string) -> executes high-operational query against Legend BaaS (:8092)\n\
     system_vitals(input: none) -> CPU, memory, process count of this machine\n\
     memory_recall(input: keyword string) -> past RockSoul runs whose goal or answer match\n\
     http_get(input: absolute http(s) URL) -> status + first 6KB of the response body"
}

pub async fn probe_mesh(client: &reqwest::Client) -> Vec<NodePulse> {
    let probes = MESH.iter().map(|(id, url)| {
        let client = client.clone();
        async move {
            let started = Instant::now();
            let outcome = client
                .get(*url)
                .timeout(Duration::from_millis(1500))
                .send()
                .await;
            let latency_ms = started.elapsed().as_millis();
            match outcome {
                Ok(resp) => NodePulse {
                    id: id.to_string(),
                    url: url.to_string(),
                    online: resp.status().as_u16() < 500,
                    latency_ms,
                    status: resp.status().as_u16(),
                },
                Err(_) => NodePulse {
                    id: id.to_string(),
                    url: url.to_string(),
                    online: false,
                    latency_ms,
                    status: 0,
                },
            }
        }
    });
    futures_join(probes).await
}

async fn futures_join<F, T>(futs: impl Iterator<Item = F>) -> Vec<T>
where
    F: std::future::Future<Output = T> + Send + 'static,
    T: Send + 'static,
{
    let handles: Vec<_> = futs.map(tokio::spawn).collect();
    let mut out = Vec::with_capacity(handles.len());
    for handle in handles {
        if let Ok(value) = handle.await {
            out.push(value);
        }
    }
    out
}

pub fn vitals() -> Value {
    let mut sys = System::new_all();
    sys.refresh_all();
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_cpu();
    json!({
        "cpu_pct": (sys.global_cpu_info().cpu_usage() * 10.0).round() / 10.0,
        "cpu_cores": sys.cpus().len(),
        "mem_used_mb": sys.used_memory() / 1_048_576,
        "mem_total_mb": sys.total_memory() / 1_048_576,
        "processes": sys.processes().len(),
        "host": System::host_name(),
        "os": System::long_os_version(),
        "uptime_s": System::uptime(),
    })
}

async fn codex(client: &reqwest::Client) -> Result<Value, String> {
    let dash: Value = client
        .get(CODEX_URL)
        .timeout(Duration::from_secs(8))
        .send()
        .await
        .map_err(|e| format!("codex unreachable: {e}"))?
        .json()
        .await
        .map_err(|e| format!("codex payload invalid: {e}"))?;
    let open_tasks: Vec<Value> = dash["tasks"]
        .as_array()
        .map(|tasks| {
            tasks
                .iter()
                .filter(|t| t["status"] != "done")
                .take(10)
                .map(|t| json!({"id": t["id"], "title": t["title"], "status": t["status"], "progressPct": t["progressPct"]}))
                .collect()
        })
        .unwrap_or_default();
    Ok(json!({ "version": dash["version"], "kpis": dash["kpis"], "open_tasks": open_tasks }))
}

async fn http_get(client: &reqwest::Client, url: &str) -> Result<Value, String> {
    let url = url.trim().trim_matches('"');
    if !(url.starts_with("http://") || url.starts_with("https://")) {
        return Err("http_get requires an absolute http(s) URL".into());
    }
    let resp = client
        .get(url)
        .timeout(Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let status = resp.status().as_u16();
    let body = resp.text().await.map_err(|e| e.to_string())?;
    let clipped: String = body.chars().take(BODY_CAP).collect();
    Ok(json!({ "status": status, "body": clipped, "truncated": body.len() > clipped.len() }))
}

async fn surrealql(client: &reqwest::Client, query: &str) -> Result<Value, String> {
    let clean_query = query.trim().trim_matches('"');
    let resp = client
        .post(LEGEND_QUERY_URL)
        .header("Authorization", format!("Bearer {LEGEND_ADMIN_TOKEN}"))
        .header("Content-Type", "application/json")
        .json(&json!({ "query": clean_query }))
        .timeout(Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Legend :8092 unreachable: {e}"))?;
    let status = resp.status();
    let body: Value = resp
        .json()
        .await
        .map_err(|e| format!("SurrealQL response invalid: {e}"))?;
    if !status.is_success() {
        return Err(format!("SurrealQL HTTP {status}: {body}"));
    }
    Ok(body)
}

async fn surrealql(client: &reqwest::Client, query: &str) -> Result<Value, String> {
    let clean_query = query.trim().trim_matches('"');
    let resp = client
        .post(LEGEND_QUERY_URL)
        .header("Authorization", format!("Bearer {LEGEND_ADMIN_TOKEN}"))
        .header("Content-Type", "application/json")
        .json(&json!({ "query": clean_query }))
        .timeout(Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Legend :8092 unreachable: {e}"))?;
    let status = resp.status();
    let body: Value = resp.json().await.map_err(|e| format!("SurrealQL response invalid: {e}"))?;
    if !status.is_success() {
        return Err(format!("SurrealQL HTTP {status}: {body}"));
    }
    Ok(body)
}

pub async fn execute(
    client: &reqwest::Client,
    memory: &Memory,
    tool: &str,
    input: &str,
) -> Result<Value, String> {
    match tool {
        "mesh_probe" => {
            let pulses = probe_mesh(client).await;
            let online = pulses.iter().filter(|p| p.online).count();
            Ok(json!({ "online": online, "total": pulses.len(), "nodes": pulses }))
        }
        "codex_dashboard" => codex(client).await,
        "surrealql_exec" => surrealql(client, input).await,
        "system_vitals" => tokio::task::spawn_blocking(vitals)
            .await
            .map_err(|e| e.to_string()),
        "memory_recall" => Ok(json!(memory.recall(input, 5))),
        "http_get" => http_get(client, input).await,
        unknown => Err(format!("unknown tool `{unknown}`")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio;
    #[tokio::test]
    async fn test_surrealql_exec() {
        let client = reqwest::Client::new();
        let memory = Memory::open(std::env::temp_dir().join("rocksoul-test-surreal")).expect("mem");
        let query = "SELECT count() FROM pppoe_sessions";
        let result = execute(&client, &memory, "surrealql_exec", query).await;
        assert!(result.is_ok(), "surrealql_exec failed: {:?}", result.err());
        let value = result.unwrap();
        assert!(value.is_object() || value.is_array(), "unexpected result type");
    }
}
