use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::command;
use crate::state::AppState;
use tauri::State;
use surrealdb::sql::{Value, Object, Thing};
use chrono::Utc;
use ring::rand::SecureRandom;
use base64::Engine;

#[derive(Debug, Serialize, Deserialize)]
pub struct Tenant {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub plan: String,
    pub usage: serde_json::Value,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKey {
    pub id: String,
    pub tenant_id: String,
    pub name: String,
    pub key_hash: String,
    pub permissions: Vec<String>,
    pub expires_at: Option<String>,
    pub last_used: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TenantUsage {
    pub tenant_id: String,
    pub api_calls: i64,
    pub storage_mb: i64,
    pub bandwidth_gb: i64,
    pub active_sessions: i64,
}

#[command]
pub async fn tenant_list(
    state: State<'_, AppState>,
) -> Result<Vec<Tenant>, String> {
    let db = &state.db;
    let mut result = db.query("SELECT * FROM tenants ORDER BY created_at DESC").await.map_err(|e| e.to_string())?;
    let tenants: Vec<Tenant> = result.take(0).map_err(|e| e.to_string())?;
    Ok(tenants)
}

#[command]
pub async fn tenant_create(
    name: String,
    slug: String,
    plan: String,
    state: State<'_, AppState>,
) -> Result<Tenant, String> {
    let db = &state.db;
    let record = surrealdb::sql::Object::from_iter(vec![
        ("name".to_string(), Value::from(name.clone())),
        ("slug".to_string(), Value::from(slug.clone())),
        ("plan".to_string(), Value::from(plan.clone())),
        ("usage".to_string(), Value::from(serde_json::json!({"api_calls": 0, "storage_mb": 0, "bandwidth_gb": 0}))),
        ("created_at".to_string(), Value::from(Utc::now().to_rfc3339())),
    ]);
    let created: Vec<Value> = db.create("tenants").content(Value::from(record)).await.map_err(|e| e.to_string())?;
    let tenant = created.first().ok_or_else(|| "No tenant created".to_string())?;
    Ok(Tenant {
        id: tenant.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or_default(),
        name,
        slug,
        plan,
        usage: serde_json::json!({"api_calls": 0, "storage_mb": 0, "bandwidth_gb": 0}),
        created_at: Utc::now().to_rfc3339(),
    })
}

#[command]
pub async fn tenant_update(
    id: String,
    name: Option<String>,
    plan: Option<String>,
    state: State<'_, AppState>,
) -> Result<Tenant, String> {
    let db = &state.db;
    let thing: Thing = format!("tenants:{}", id).parse().map_err(|e| e.to_string())?;
    let mut data = Object::new();
    if let Some(n) = name { data.insert("name".to_string(), Value::from(n)); }
    if let Some(p) = plan { data.insert("plan".to_string(), Value::from(p)); }
    let updated: Option<Value> = db.update(thing).content(Value::from(data)).await.map_err(|e| e.to_string())?;
    let tenant = updated.ok_or_else(|| "Tenant not found".to_string())?;
    Ok(Tenant {
        id: tenant.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or_default(),
        name: tenant.get("name").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or_default(),
        slug: tenant.get("slug").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or_default(),
        plan: tenant.get("plan").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or_default(),
        usage: serde_json::to_value(tenant.get("usage")).unwrap_or(serde_json::json!({})),
        created_at: tenant.get("created_at").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or_default(),
    })
}

#[command]
pub async fn tenant_delete(
    id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let db = &state.db;
    let thing: Thing = format!("tenants:{}", id).parse().map_err(|e| e.to_string())?;
    let _: Option<Value> = db.delete(thing).await.map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn tenant_usage(
    id: String,
    state: State<'_, AppState>,
) -> Result<TenantUsage, String> {
    let db = &state.db;
    let thing: Thing = format!("tenants:{}", id).parse().map_err(|e| e.to_string())?;
    let tenant: Option<Value> = db.select(thing).await.map_err(|e| e.to_string())?;
    let tenant = tenant.ok_or_else(|| "Tenant not found".to_string())?;
    let usage = tenant.get("usage").cloned().unwrap_or(Value::Null);
    Ok(TenantUsage {
        tenant_id: id,
        api_calls: usage.get("api_calls").and_then(|v| v.as_int()).unwrap_or(0),
        storage_mb: usage.get("storage_mb").and_then(|v| v.as_int()).unwrap_or(0),
        bandwidth_gb: usage.get("bandwidth_gb").and_then(|v| v.as_int()).unwrap_or(0),
        active_sessions: 0,
    })
}

#[command]
pub async fn api_key_create(
    tenant_id: String,
    name: String,
    permissions: Vec<String>,
    expires_days: Option<i64>,
    state: State<'_, AppState>,
) -> Result<ApiKey, String> {
    let db = &state.db;
    // Generate random key
    let mut key_bytes = vec![0u8; 32];
    ring::rand::SystemRandom::new().fill(&mut key_bytes).map_err(|e| e.to_string())?;
    let engine = base64::engine::general_purpose::URL_SAFE_NO_PAD;
    let api_key = format!("sk_{}", engine.encode(&key_bytes));
    let key_hash = format!("sha256:{}", hex::encode(sha2::Sha256::digest(api_key.as_bytes())));

    let expires_at = expires_days.map(|days| Utc::now() + chrono::Duration::days(days));

    let record = surrealdb::sql::Object::from_iter(vec![
        ("tenant_id".to_string(), Value::from(format!("tenants:{}", tenant_id))),
        ("name".to_string(), Value::from(name.clone())),
        ("key_hash".to_string(), Value::from(key_hash.clone())),
        ("permissions".to_string(), Value::from(permissions.clone())),
        ("expires_at".to_string(), expires_at.map(|dt| Value::from(dt.to_rfc3339())).unwrap_or(Value::Null)),
        ("last_used".to_string(), Value::Null),
        ("created_at".to_string(), Value::from(Utc::now().to_rfc3339())),
    ]);
    let created: Vec<Value> = db.create("api_keys").content(Value::from(record)).await.map_err(|e| e.to_string())?;
    let key = created.first().ok_or_else(|| "No API key created".to_string())?;
    Ok(ApiKey {
        id: key.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or_default(),
        tenant_id,
        name,
        key_hash,
        permissions,
        expires_at: expires_at.map(|dt| dt.to_rfc3339()),
        last_used: None,
        created_at: Utc::now().to_rfc3339(),
    })
}

#[command]
pub async fn api_key_list(
    tenant_id: String,
    state: State<'_, AppState>,
) -> Result<Vec<ApiKey>, String> {
    let db = &state.db;
    let mut result = db.query("SELECT * FROM api_keys WHERE tenant_id = $tenant_id ORDER BY created_at DESC")
        .bind(("tenant_id", format!("tenants:{}", tenant_id)))
        .await
        .map_err(|e| e.to_string())?;
    let keys: Vec<ApiKey> = result.take(0).map_err(|e| e.to_string())?;
    Ok(keys)
}

#[command]
pub async fn api_key_revoke(
    id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let db = &state.db;
    let thing: Thing = format!("api_keys:{}", id).parse().map_err(|e| e.to_string())?;
    let _: Option<Value> = db.delete(thing).await.map_err(|e| e.to_string())?;
    Ok(true)
}
