use anyhow::Result;
use std::path::PathBuf;
use surrealdb::Surreal;
use surrealdb::engine::local::Db;
use surrealdb::opt::auth::Root;
use std::sync::Arc;
use tracing::{info, warn};

pub type SurrealLocal = Arc<Surreal<Db>>;

pub async fn init_surrealdb(data_dir: PathBuf) -> Result<SurrealLocal> {
    // Ensure data directory exists
    std::fs::create_dir_all(&data_dir)?;

    let db_path = data_dir.join("sovereign.db");
    info!("Opening embedded SurrealDB at: {}", db_path.display());

    let db = Surreal::new(Db::new(db_path).map_err(|e| anyhow::anyhow!("Failed to create DB: {}", e))?);
    db.signin(Root {
        username: "root",
        password: "root",
    }).await?;

    // Configure database
    db.use_ns("sovereign").use_db("desktop").await?;

    // Run migrations
    run_migrations(&db).await?;

    // Enable live queries
    db.set_strict(true).await?;

    info!("Embedded SurrealDB initialized successfully");
    Ok(Arc::new(db))
}

async fn run_migrations(db: &Surreal<Db>) -> Result<()> {
    // Migration 001: Core tables
    let migrations = vec![
        // Sync operations table for CRDT/event sourcing
        r#"
        DEFINE TABLE IF NOT EXISTS sync_operations SCHEMAFULL;
        DEFINE FIELD IF NOT EXISTS id ON sync_operations TYPE record<sync_operations>;
        DEFINE FIELD IF NOT EXISTS table_name ON sync_operations TYPE string;
        DEFINE FIELD IF NOT EXISTS record_id ON sync_operations TYPE string;
        DEFINE FIELD IF NOT EXISTS operation ON sync_operations TYPE string; // insert, update, delete
        DEFINE FIELD IF NOT EXISTS data ON sync_operations TYPE object;
        DEFINE FIELD IF NOT EXISTS crdt_type ON sync_operations TYPE string; // lww, orset, rga
        DEFINE FIELD IF NOT EXISTS timestamp ON sync_operations TYPE datetime;
        DEFINE FIELD IF NOT EXISTS actor_id ON sync_operations TYPE string;
        DEFINE FIELD IF NOT EXISTS synced ON sync_operations TYPE bool DEFAULT false;
        DEFINE FIELD IF NOT EXISTS version ON sync_operations TYPE int DEFAULT 0;
        DEFINE INDEX IF NOT EXISTS idx_sync_table_record ON sync_operations (table_name, record_id);
        DEFINE INDEX IF NOT EXISTS idx_sync_synced ON sync_operations (synced);
        "#,
        // Git repositories table
        r#"
        DEFINE TABLE IF NOT EXISTS git_repositories SCHEMAFULL;
        DEFINE FIELD IF NOT EXISTS id ON git_repositories TYPE record<git_repositories>;
        DEFINE FIELD IF NOT EXISTS name ON git_repositories TYPE string;
        DEFINE FIELD IF NOT EXISTS path ON git_repositories TYPE string;
        DEFINE FIELD IF NOT EXISTS remote_url ON git_repositories TYPE option<string>;
        DEFINE FIELD IF NOT EXISTS branch ON git_repositories TYPE string DEFAULT "main";
        DEFINE FIELD IF NOT EXISTS last_fetched ON git_repositories TYPE option<datetime>;
        DEFINE INDEX IF NOT EXISTS idx_git_path ON git_repositories (path) UNIQUE;
        "#,
        // Service config table
        r#"
        DEFINE TABLE IF NOT EXISTS service_config SCHEMAFULL;
        DEFINE FIELD IF NOT EXISTS id ON service_config TYPE record<service_config>;
        DEFINE FIELD IF NOT EXISTS name ON service_config TYPE string;
        DEFINE FIELD IF NOT EXISTS enabled ON service_config TYPE bool DEFAULT true;
        DEFINE FIELD IF NOT EXISTS config ON service_config TYPE object;
        DEFINE FIELD IF NOT EXISTS port ON service_config TYPE option<int>;
        DEFINE INDEX IF NOT EXISTS idx_service_name ON service_config (name) UNIQUE;
        "#,
        // Tenant table
        r#"
        DEFINE TABLE IF NOT EXISTS tenants SCHEMAFULL;
        DEFINE FIELD IF NOT EXISTS id ON tenants TYPE record<tenants>;
        DEFINE FIELD IF NOT EXISTS name ON tenants TYPE string;
        DEFINE FIELD IF NOT EXISTS slug ON tenants TYPE string;
        DEFINE FIELD IF NOT EXISTS plan ON tenants TYPE string DEFAULT "free";
        DEFINE FIELD IF NOT EXISTS api_keys ON tenants TYPE array<record<api_keys>>;
        DEFINE FIELD IF NOT EXISTS usage ON tenants TYPE object;
        DEFINE FIELD IF NOT EXISTS created_at ON tenants TYPE datetime DEFAULT time::now();
        DEFINE INDEX IF NOT EXISTS idx_tenant_slug ON tenants (slug) UNIQUE;
        "#,
        // API keys table
        r#"
        DEFINE TABLE IF NOT EXISTS api_keys SCHEMAFULL;
        DEFINE FIELD IF NOT EXISTS id ON api_keys TYPE record<api_keys>;
        DEFINE FIELD IF NOT EXISTS tenant_id ON api_keys TYPE record<tenants>;
        DEFINE FIELD IF NOT EXISTS name ON api_keys TYPE string;
        DEFINE FIELD IF NOT EXISTS key_hash ON api_keys TYPE string;
        DEFINE FIELD IF NOT EXISTS permissions ON api_keys TYPE array<string>;
        DEFINE FIELD IF NOT EXISTS expires_at ON api_keys TYPE option<datetime>;
        DEFINE FIELD IF NOT EXISTS last_used ON api_keys TYPE option<datetime>;
        DEFINE FIELD IF NOT EXISTS created_at ON api_keys TYPE datetime DEFAULT time::now();
        DEFINE INDEX IF NOT EXISTS idx_api_key_tenant ON api_keys (tenant_id);
        "#,
        // PPPoE sessions table
        r#"
        DEFINE TABLE IF NOT EXISTS pppoe_sessions SCHEMAFULL;
        DEFINE FIELD IF NOT EXISTS id ON pppoe_sessions TYPE record<pppoe_sessions>;
        DEFINE FIELD IF NOT EXISTS session_id ON pppoe_sessions TYPE string;
        DEFINE FIELD IF NOT EXISTS nas_ip ON pppoe_sessions TYPE string;
        DEFINE FIELD IF NOT EXISTS username ON pppoe_sessions TYPE string;
        DEFINE FIELD IF NOT EXISTS assigned_ip ON pppoe_sessions TYPE option<string>;
        DEFINE FIELD IF NOT EXISTS status ON pppoe_sessions TYPE string; // connecting, active, disconnected
        DEFINE FIELD IF NOT EXISTS bytes_in ON pppoe_sessions TYPE int DEFAULT 0;
        DEFINE FIELD IF NOT EXISTS bytes_out ON pppoe_sessions TYPE int DEFAULT 0;
        DEFINE FIELD IF NOT EXISTS started_at ON pppoe_sessions TYPE datetime;
        DEFINE FIELD IF NOT EXISTS ended_at ON pppoe_sessions TYPE option<datetime>;
        DEFINE INDEX IF NOT EXISTS idx_pppoe_session ON pppoe_sessions (session_id) UNIQUE;
        DEFINE INDEX IF NOT EXISTS idx_pppoe_nas ON pppoe_sessions (nas_ip);
        DEFINE INDEX IF NOT EXISTS idx_pppoe_user ON pppoe_sessions (username);
        "#,
        // RADIUS logs table
        r#"
        DEFINE TABLE IF NOT EXISTS radius_logs SCHEMAFULL;
        DEFINE FIELD IF NOT EXISTS id ON radius_logs TYPE record<radius_logs>;
        DEFINE FIELD IF NOT EXISTS nas_ip ON radius_logs TYPE string;
        DEFINE FIELD IF NOT EXISTS username ON radius_logs TYPE string;
        DEFINE FIELD IF NOT EXISTS packet_type ON radius_logs TYPE string; // Access-Request, Access-Accept, Access-Reject, Access-Challenge
        DEFINE FIELD IF NOT EXISTS attributes ON radius_logs TYPE object;
        DEFINE FIELD IF NOT EXISTS timestamp ON radius_logs TYPE datetime DEFAULT time::now();
        DEFINE INDEX IF NOT EXISTS idx_radius_nas ON radius_logs (nas_ip);
        DEFINE INDEX IF NOT EXISTS idx_radius_user ON radius_logs (username);
        DEFINE INDEX IF NOT EXISTS idx_radius_time ON radius_logs (timestamp);
        "#,
        // Settings table
        r#"
        DEFINE TABLE IF NOT EXISTS settings SCHEMAFULL;
        DEFINE FIELD IF NOT EXISTS id ON settings TYPE record<settings>;
        DEFINE FIELD IF NOT EXISTS key ON settings TYPE string;
        DEFINE FIELD IF NOT EXISTS value ON settings TYPE object;
        DEFINE INDEX IF NOT EXISTS idx_settings_key ON settings (key) UNIQUE;
        "#,
        // License table
        r#"
        DEFINE TABLE IF NOT EXISTS license SCHEMAFULL;
        DEFINE FIELD IF NOT EXISTS id ON license TYPE record<license>;
        DEFINE FIELD IF NOT EXISTS license_pem ON license TYPE string;
        DEFINE FIELD IF NOT EXISTS features ON license TYPE array<string>;
        DEFINE FIELD IF NOT EXISTS seats ON license TYPE int;
        DEFINE FIELD IF NOT EXISTS expires_at ON license TYPE option<datetime>;
        DEFINE FIELD IF NOT EXISTS hw_fingerprint ON license TYPE string;
        DEFINE FIELD IF NOT EXISTS validated_at ON license TYPE datetime DEFAULT time::now();
        "#,
    ];

    for migration in migrations {
        db.query(migration).await?;
    }

    info!("All migrations applied successfully");
    Ok(())
}

pub async fn health_check(db: &SurrealLocal) -> bool {
    match db.query("SELECT 1 as health").await {
        Ok(mut resp) => {
            if let Ok(Some(_)) = resp.take::<Option<surrealdb::sql::Value>>(0) {
                return true;
            }
        }
        Err(e) => {
            warn!("SurrealDB health check failed: {}", e);
        }
    }
    false
}
