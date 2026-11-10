use anyhow::Result;
use crate::storage::surrealdb::{SurrealLocal, health_check};
use crate::sync::crdt::{CrdtValue, ConflictResolver, CrdtType};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{interval, Duration};
use tracing::{info, warn, error};
use url::Url;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncOperation {
    pub id: String,
    pub table_name: String,
    pub record_id: String,
    pub operation: String,
    pub data: serde_json::Value,
    pub crdt_type: CrdtType,
    pub timestamp: DateTime<Utc>,
    pub actor_id: String,
    pub synced: bool,
    pub version: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncConfig {
    pub remote_url: Url,
    pub auth_token: String,
    pub sync_interval_seconds: u64,
    pub max_retries: u32,
    pub tables_to_sync: Vec<String>,
    pub sync_direction: SyncDirection,
    pub bandwidth_limit_kbps: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SyncDirection {
    PushOnly,
    PullOnly,
    Bidirectional,
}

pub struct SyncEngine {
    local_db: SurrealLocal,
    config: Arc<RwLock<Option<SyncConfig>>>,
    client: Client,
    actor_id: String,
    running: Arc<RwLock<bool>>,
}

impl SyncEngine {
    pub fn new(local_db: SurrealLocal) -> Self {
        let actor_id = uuid::Uuid::new_v4().to_string();
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .unwrap();

        Self {
            local_db,
            config: Arc::new(RwLock::new(None)),
            client,
            actor_id,
            running: Arc::new(RwLock::new(false)),
        }
    }

    pub async fn configure(&self, config: SyncConfig) {
        *self.config.write().await = Some(config);
    }

    pub async fn is_running(&self) -> bool {
        *self.running.read().await
    }

    pub async fn start(&self) {
        *self.running.write().await = true;
        info!("Sync engine started");

        let mut interval = interval(Duration::from_secs(30));
        loop {
            interval.tick().await;

            if !*self.running.read().await {
                break;
            }

            if let Err(e) = self.reconcile().await {
                warn!("Sync reconciliation failed: {}", e);
            }
        }
    }

    pub async fn stop(&self) {
        *self.running.write().await = false;
        info!("Sync engine stopped");
    }

    async fn reconcile(&self) -> Result<()> {
        let config = self.config.read().await;
        let Some(config) = config.as_ref() else {
            return Ok(());
        };

        // Push local changes
        if config.sync_direction == SyncDirection::PushOnly || config.sync_direction == SyncDirection::Bidirectional {
            self.push_local_changes(&config).await?;
        }

        // Pull remote changes
        if config.sync_direction == SyncDirection::PullOnly || config.sync_direction == SyncDirection::Bidirectional {
            self.pull_remote_changes(&config).await?;
        }

        Ok(())
    }

    async fn push_local_changes(&self, config: &SyncConfig) -> Result<()> {
        // Query pending sync operations
        let query = r#"
            SELECT * FROM sync_operations 
            WHERE synced = false 
            AND table_name IN $tables
            ORDER BY timestamp ASC 
            LIMIT 100
        "#;

        let mut resp = self.local_db
            .query(query)
            .bind(("tables", config.tables_to_sync.clone()))
            .await?;

        let operations: Vec<SyncOperation> = resp.take(0).unwrap_or_default();

        for op in operations {
            if let Err(e) = self.push_operation(&op, config).await {
                warn!("Failed to push operation {}: {}", op.id, e);
                continue;
            }

            // Mark as synced
            self.local_db
                .query("UPDATE $id SET synced = true, version = version + 1")
                .bind(("id", op.id.clone()))
                .await?;
        }

        Ok(())
    }

    async fn push_operation(&self, op: &SyncOperation, config: &SyncConfig) -> Result<()> {
        let url = config.remote_url.join(&format!("/api/v1/sync/{}/{}", op.table_name, op.record_id))?;

        let crdt_value = CrdtValue::from_operation(op)?;

        let resp = self.client
            .post(url)
            .bearer_auth(&config.auth_token)
            .json(&crdt_value)
            .send()
            .await?;

        if !resp.status().is_success() {
            anyhow::bail!("Push failed: {}", resp.status());
        }

        info!("Pushed operation {} to remote", op.id);
        Ok(())
    }

    async fn pull_remote_changes(&self, config: &SyncConfig) -> Result<()> {
        // Get last sync timestamp per table
        for table in &config.tables_to_sync {
            let last_sync = self.get_last_sync_time(table).await?;

            let url = config.remote_url.join(&format!("/api/v1/sync/{}?since={}", table, last_sync))?;

            let resp = self.client
                .get(url)
                .bearer_auth(&config.auth_token)
                .send()
                .await?;

            if !resp.status().is_success() {
                warn!("Pull failed for table {}: {}", table, resp.status());
                continue;
            }

            let remote_ops: Vec<SyncOperation> = resp.json().await?;

            for remote_op in remote_ops {
                self.apply_remote_operation(&remote_op).await?;
            }

            self.update_last_sync_time(table, Utc::now()).await?;
        }

        Ok(())
    }

    async fn get_last_sync_time(&self, table: &str) -> Result<String> {
        let query = "SELECT value FROM settings WHERE key = $key";
        let mut resp = self.local_db
            .query(query)
            .bind(("key", format!("last_sync_{}", table)))
            .await?;

        let value: Option<serde_json::Value> = resp.take(0).unwrap_or_default();
        Ok(value.map(|v| v.to_string()).unwrap_or_else(|| "1970-01-01T00:00:00Z".to_string()))
    }

    async fn update_last_sync_time(&self, table: &str, time: DateTime<Utc>) -> Result<()> {
        let query = "UPSERT settings SET key = $key, value = $value";
        self.local_db
            .query(query)
            .bind(("key", format!("last_sync_{}", table)))
            .bind(("value", time.to_rfc3339()))
            .await?;
        Ok(())
    }

    async fn apply_remote_operation(&self, remote_op: &SyncOperation) -> Result<()> {
        // Get local version
        let query = "SELECT * FROM sync_operations WHERE table_name = $table AND record_id = $record";
        let mut resp = self.local_db
            .query(query)
            .bind(("table", remote_op.table_name.clone()))
            .bind(("record", remote_op.record_id.clone()))
            .await?;

        let local_op: Option<SyncOperation> = resp.take(0).unwrap_or_default();

        let merged = match local_op {
            Some(local) => {
                let local_crdt = CrdtValue::from_operation(&local)?;
                let remote_crdt = CrdtValue::from_operation(remote_op)?;
                ConflictResolver::resolve(local_crdt, remote_crdt, remote_op.crdt_type.clone())?
            }
            None => CrdtValue::from_operation(remote_op)?,
        };

        // Apply merged result to local table
        self.apply_crdt_to_table(&remote_op.table_name, &remote_op.record_id, &merged).await?;

        // Update sync_operations
        let upsert_query = r#"
            UPSERT sync_operations SET 
                table_name = $table,
                record_id = $record,
                operation = $op,
                data = $data,
                crdt_type = $crdt_type,
                timestamp = $timestamp,
                actor_id = $actor,
                synced = true,
                version = version + 1
        "#;

        self.local_db
            .query(upsert_query)
            .bind(("table", remote_op.table_name.clone()))
            .bind(("record", remote_op.record_id.clone()))
            .bind(("op", remote_op.operation.clone()))
            .bind(("data", merged.to_json()?))
            .bind(("crdt_type", format!("{:?}", remote_op.crdt_type)))
            .bind(("timestamp", remote_op.timestamp))
            .bind(("actor", self.actor_id.clone()))
            .await?;

        Ok(())
    }

    async fn apply_crdt_to_table(&self, table: &str, record_id: &str, crdt: &CrdtValue) -> Result<()> {
        let query = format!("UPDATE {} SET data = $data WHERE id = $id", table);
        self.local_db
            .query(query)
            .bind(("id", record_id.to_string()))
            .bind(("data", crdt.to_json()?))
            .await?;
        Ok(())
    }
}

impl CrdtValue {
    fn from_operation(op: &SyncOperation) -> Result<Self> {
        match op.crdt_type {
            CrdtType::LwwRegister => {
                let lww: crate::sync::crdt::LwwRegister<serde_json::Value> = serde_json::from_value(op.data.clone())?;
                Ok(CrdtValue::Lww(lww))
            }
            CrdtType::OrSet => {
                let orset: crate::sync::crdt::OrSet = serde_json::from_value(op.data.clone())?;
                Ok(CrdtValue::OrSet(orset))
            }
            CrdtType::Rga => {
                let rga: crate::sync::crdt::Rga = serde_json::from_value(op.data.clone())?;
                Ok(CrdtValue::Rga(rga))
            }
        }
    }

    fn to_json(&self) -> Result<serde_json::Value> {
        Ok(serde_json::to_value(self)?)
    }
}
