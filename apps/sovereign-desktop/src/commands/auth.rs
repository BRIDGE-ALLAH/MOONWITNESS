use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::command;
use jsonwebtoken::{encode, Header, Algorithm, EncodingKey};
use chrono::{DateTime, Utc, Duration};
use crate::storage::credential::{store_credential, get_credential};
use crate::license::validate::{validate_offline, generate_hw_fingerprint, LicenseManager, LicenseInfo};
use crate::sync::engine::SyncEngine;
use crate::storage::surrealdb::init_surrealdb;
use ring::rand::SecureRandom;
use base64::Engine;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthToken {
    pub token: String,
    pub expires_at: DateTime<Utc>,
    pub user: UserInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserInfo {
    pub id: String,
    pub name: String,
    pub role: String, // developer, platform, network, support, customer
    pub tenant_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub name: String,
    pub role: String,
    pub tenant_id: Option<String>,
    pub exp: usize,
    pub iat: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WindowsHelloChallenge {
    pub challenge: String,
    pub relying_party_id: String,
    pub relying_party_name: String,
    pub user_id: String,
    pub user_name: String,
    pub user_display_name: String,
}

#[command]
pub async fn auth_windows_hello() -> Result<AuthToken, String> {
    // Generate challenge for WebAuthn - simplified for now
    let mut challenge_bytes = vec![0u8; 32];
    ring::rand::SystemRandom::new().fill(&mut challenge_bytes).map_err(|e| e.to_string())?;

    let engine = base64::engine::general_purpose::STANDARD;
    let challenge_b64 = engine.encode(&challenge_bytes);

    Ok(AuthToken {
        token: challenge_b64,
        expires_at: Utc::now() + Duration::minutes(5),
        user: UserInfo {
            id: "pending".to_string(),
            name: "Windows Hello".to_string(),
            role: "pending".to_string(),
            tenant_id: None,
        },
    })
}

#[command]
pub async fn auth_windows_hello_verify(
    credential: String,
    challenge: String,
) -> Result<AuthToken, String> {
    // Simplified WebAuthn verification - in production use proper webauthn-rs verification
    let _ = credential;
    let _ = challenge;

    // Get stored credential for user
    let _stored_cred = get_credential("webauthn:default")
        .map_err(|e| e.to_string())?;

    // Generate JWT
    let jwt = generate_jwt(UserInfo {
        id: "user-1".to_string(),
        name: "Windows User".to_string(),
        role: "developer".to_string(),
        tenant_id: None,
    }).map_err(|e| e.to_string())?;

    Ok(AuthToken {
        token: jwt,
        expires_at: Utc::now() + Duration::minutes(15),
        user: UserInfo {
            id: "user-1".to_string(),
            name: "Windows User".to_string(),
            role: "developer".to_string(),
            tenant_id: None,
        },
    })
}

#[command]
pub async fn auth_pat(pat: String) -> Result<AuthToken, String> {
    // Verify PAT via git-engine
    // For now, store and generate JWT
    store_credential("pat:default", pat.as_bytes())
        .map_err(|e| e.to_string())?;

    let jwt = generate_jwt(UserInfo {
        id: "pat-user".to_string(),
        name: "PAT User".to_string(),
        role: "developer".to_string(),
        tenant_id: None,
    }).map_err(|e| e.to_string())?;

    Ok(AuthToken {
        token: jwt,
        expires_at: Utc::now() + Duration::minutes(15),
        user: UserInfo {
            id: "pat-user".to_string(),
            name: "PAT User".to_string(),
            role: "developer".to_string(),
            tenant_id: None,
        },
    })
}

#[command]
pub async fn get_jwt() -> Result<String, String> {
    // Return cached JWT if valid, else generate new
    // Simplified - in production check cache
    let jwt = generate_jwt(UserInfo {
        id: "user-1".to_string(),
        name: "Windows User".to_string(),
        role: "developer".to_string(),
        tenant_id: None,
    }).map_err(|e| e.to_string())?;

    Ok(jwt)
}

/// Internal function to get JWT for use by other command modules
pub async fn get_jwt_internal(_state: &crate::state::AppState) -> Result<String, String> {
    let jwt = generate_jwt(UserInfo {
        id: "user-1".to_string(),
        name: "Windows User".to_string(),
        role: "developer".to_string(),
        tenant_id: None,
    }).map_err(|e| e.to_string())?;

    Ok(jwt)
}

#[command]
pub async fn verify_license() -> Result<LicenseInfo, String> {
    let hw_fingerprint = generate_hw_fingerprint().map_err(|e| e.to_string())?;
    let license_manager = LicenseManager::new(dirs::data_dir().unwrap().join("Sovereign"));

    let license_pem = license_manager.load_license()
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "No license found".to_string())?;

    let license = validate_offline(&license_pem, hw_fingerprint.as_bytes())
        .map_err(|e| e.to_string())?;

    Ok(license)
}

#[command]
pub async fn refresh_token() -> Result<AuthToken, String> {
    // Check if WebAuthn credential cached and < 90 days
    if let Ok(_cred) = get_credential("webauthn:default") {
        // Check timestamp
        let jwt = generate_jwt(UserInfo {
            id: "user-1".to_string(),
            name: "Windows User".to_string(),
            role: "developer".to_string(),
            tenant_id: None,
        }).map_err(|e| e.to_string())?;

        return Ok(AuthToken {
            token: jwt,
            expires_at: Utc::now() + Duration::minutes(15),
            user: UserInfo {
                id: "user-1".to_string(),
                name: "Windows User".to_string(),
                role: "developer".to_string(),
                tenant_id: None,
            },
        });
    }

    Err("No cached WebAuthn credential".to_string())
}

fn generate_jwt(user: UserInfo) -> Result<String> {
    let claims = Claims {
        sub: user.id,
        name: user.name,
        role: user.role,
        tenant_id: user.tenant_id,
        exp: (Utc::now() + Duration::minutes(15)).timestamp() as usize,
        iat: Utc::now().timestamp() as usize,
    };

    // Get signing key from Credential Manager
    let key_bytes = get_credential("jwt_signing_key")
        .unwrap_or_else(|_| {
            // Generate new key if not exists
            let key = ring::rand::SystemRandom::new();
            let mut bytes = vec![0u8; 32];
            key.fill(&mut bytes).unwrap();
            let _ = store_credential("jwt_signing_key", &bytes);
            bytes
        });

    let encoding_key = EncodingKey::from_rsa_pem(&key_bytes)
        .map_err(|e| anyhow::anyhow!("Invalid signing key: {}", e))?;

    encode(&Header::new(Algorithm::RS256), &claims, &encoding_key)
        .map_err(|e| anyhow::anyhow!("JWT encoding failed: {}", e))
}

#[command]
pub async fn init_app() -> Result<AppInitResult, String> {
    let data_dir = dirs::data_dir()
        .ok_or_else(|| "Could not find data directory".to_string())?
        .join("Sovereign");

    // Initialize embedded SurrealDB
    let db = init_surrealdb(data_dir.clone())
        .await
        .map_err(|e| e.to_string())?;

    // Initialize sync engine
    let _sync_engine = SyncEngine::new(db.clone());

    // Check license
    let license_valid = crate::license::validate::LicenseManager::new(data_dir).validate_current().is_ok();

    Ok(AppInitResult {
        database_ready: true,
        license_valid,
        sync_engine_ready: true,
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInitResult {
    pub database_ready: bool,
    pub license_valid: bool,
    pub sync_engine_ready: bool,
    pub version: String,
}
