use anyhow::Result;
use std::path::PathBuf;
use surrealdb::Surreal;
use surrealdb::engine::local::{Db, Mem};
use std::sync::Arc;
use tracing::info;

pub type SurrealLocal = Arc<Surreal<Db>>;

pub async fn init_surrealdb(data_dir: PathBuf) -> Result<SurrealLocal> {
    std::fs::create_dir_all(&data_dir)?;
    info!("Initializing embedded SurrealDB memory engine");

    let db = Surreal::new::<Mem>(()).await?;
    db.use_ns("sovereign").use_db("desktop").await?;

    info!("Embedded SurrealDB initialized successfully");
    Ok(Arc::new(db))
}

pub async fn health_check(_db: &Surreal<Db>) -> Result<bool> {
    Ok(true)
}
