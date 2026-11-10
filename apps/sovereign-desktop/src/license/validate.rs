use anyhow::Result;
use rsa::pkcs1::DecodeRsaPublicKey;
use rsa::pkcs8::DecodePublicKey;
use rsa::pss::VerifyingKey;
use rsa::sha2::Sha256;
use rsa::signature::Verifier;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use sha2::Digest;
use base64::Engine;
use hex;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseInfo {
    pub features: Vec<String>,
    pub seats: u32,
    pub expires_at: Option<DateTime<Utc>>,
    pub hw_fingerprint: String,
    pub issued_at: DateTime<Utc>,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseClaims {
    pub features: Vec<String>,
    pub seats: u32,
    pub expires_at: Option<i64>,
    pub hw_fingerprint: String,
    pub issued_at: i64,
}

pub fn validate_offline(license_pem: &str, _hw_fingerprint: &[u8]) -> Result<LicenseInfo> {
    // Parse the license PEM (contains claims + signature)
    let license = parse_license_pem(license_pem)?;

    // Verify hardware fingerprint matches
    let current_fingerprint = generate_hw_fingerprint()?;
    if current_fingerprint != license.hw_fingerprint {
        anyhow::bail!("Hardware fingerprint mismatch: license bound to different device");
    }

    // Verify signature
    let public_key = include_str!("../assets/public_key.pem");
    verify_signature(&license, public_key)?;

    // Check expiration
    if let Some(expires) = license.expires_at {
        let now = Utc::now();
        if now > expires {
            // Check grace period (7 days)
            let grace_end = expires + chrono::Duration::days(7);
            if now > grace_end {
                anyhow::bail!("License expired on {}", expires.format("%Y-%m-%d"));
            }
            eprintln!("WARNING: License expired, in grace period (ends {})", grace_end.format("%Y-%m-%d"));
        }
    }

    // Check features
    if license.features.is_empty() {
        anyhow::bail!("License has no features enabled");
    }

    eprintln!("License validated successfully: {} features, {} seats", license.features.len(), license.seats);
    Ok(license)
}

fn parse_license_pem(pem: &str) -> Result<LicenseInfo> {
    // License format: base64 encoded JSON + signature separated by "."
    let parts: Vec<&str> = pem.split('.').collect();
    if parts.len() != 2 {
        anyhow::bail!("Invalid license format");
    }

    let claims_b64 = parts[0];
    let signature_b64 = parts[1];

    let engine = base64::engine::general_purpose::STANDARD;
    let claims_json = engine.decode(claims_b64)?;
    let claims: LicenseClaims = serde_json::from_slice(&claims_json)?;

    Ok(LicenseInfo {
        features: claims.features,
        seats: claims.seats,
        expires_at: claims.expires_at.map(|ts| DateTime::from_timestamp(ts, 0).unwrap()),
        hw_fingerprint: claims.hw_fingerprint,
        issued_at: DateTime::from_timestamp(claims.issued_at, 0).unwrap(),
        signature: signature_b64.to_string(),
    })
}

fn verify_signature(license: &LicenseInfo, public_key_pem: &str) -> Result<()> {
    let public_key = DecodeRsaPublicKey::from_pkcs1_pem(public_key_pem)
        .or_else(|_| DecodePublicKey::from_public_key_pem(public_key_pem))?;

    let verifying_key = VerifyingKey::<Sha256>::new(public_key);

    // Reconstruct the signed data (claims)
    let claims = LicenseClaims {
        features: license.features.clone(),
        seats: license.seats,
        expires_at: license.expires_at.map(|dt| dt.timestamp()),
        hw_fingerprint: license.hw_fingerprint.clone(),
        issued_at: license.issued_at.timestamp(),
    };

    let claims_json = serde_json::to_vec(&claims)?;
    let engine = base64::engine::general_purpose::STANDARD;
    let claims_b64 = engine.encode(&claims_json);
    let signed_data = format!("{}.{}", claims_b64, license.signature);

    let signature_bytes = engine.decode(&license.signature)?;

    // Convert Vec<u8> to Signature
    let signature = rsa::pss::Signature::try_from(signature_bytes.as_slice())
        .map_err(|e| anyhow::anyhow!("Invalid signature format: {}", e))?;

    verifying_key.verify(signed_data.as_bytes(), &signature)
        .map_err(|e| anyhow::anyhow!("Signature verification failed: {}", e))
}

pub fn generate_hw_fingerprint() -> Result<String> {
    // TPM 2.0 EKpub + SMBIOS UUID
    let mut components = Vec::new();

    // Try to get TPM EKpub
    if let Ok(tpm_pub) = get_tpm_ekpub() {
        components.push(format!("tpm:{}", hex::encode(&tpm_pub)));
    }

    // Get SMBIOS UUID
    if let Ok(smbios_uuid) = get_smbios_uuid() {
        components.push(format!("smbios:{}", smbios_uuid));
    }

    // Fallback: use machine GUID from registry
    if components.is_empty() {
        if let Ok(machine_guid) = get_machine_guid() {
            components.push(format!("machine:{}", machine_guid));
        }
    }

    let combined = components.join("|");
    let hash = sha2::Sha256::digest(combined.as_bytes());
    Ok(hex::encode(hash))
}

fn get_tpm_ekpub() -> Result<Vec<u8>> {
    // Windows TPM access via TBS (Trusted Platform Module Base Services)
    // This is a simplified version - production would use Tbsi_* APIs
    // For now, return error to fall back to SMBIOS
    anyhow::bail!("TPM access not implemented")
}

fn get_smbios_uuid() -> Result<String> {
    use windows::Win32::System::SystemInformation::{GetSystemFirmwareTable, FIRMWARE_TABLE_PROVIDER};

    unsafe {
        // Get SMBIOS UUID via GetSystemFirmwareTable
        let mut buffer = vec![0u8; 1024];
        let size = GetSystemFirmwareTable(
            FIRMWARE_TABLE_PROVIDER(u32::from_le_bytes(*b"RSMB")), // 'RSMB' = Raw SMBIOS
            0,
            Some(&mut buffer),
        );

        if size == 0 {
            anyhow::bail!("Failed to get SMBIOS table");
        }

        buffer.truncate(size as usize);

        // Parse SMBIOS to find UUID (Type 1 structure)
        // Simplified - in production use proper SMBIOS parser
        if buffer.len() > 0x10 {
            let uuid_bytes = &buffer[0x08..0x18];
            let uuid = format!(
                "{:02x}{:02x}{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}",
                uuid_bytes[3], uuid_bytes[2], uuid_bytes[1], uuid_bytes[0],
                uuid_bytes[5], uuid_bytes[4],
                uuid_bytes[7], uuid_bytes[6],
                uuid_bytes[8], uuid_bytes[9],
                uuid_bytes[10], uuid_bytes[11], uuid_bytes[12], uuid_bytes[13], uuid_bytes[14], uuid_bytes[15]
            );
            return Ok(uuid);
        }

        anyhow::bail!("SMBIOS table too small")
    }
}

fn get_machine_guid() -> Result<String> {
    use winreg::enums::*;
    use winreg::RegKey;

    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let key = hklm.open_subkey(r"SOFTWARE\Microsoft\Cryptography")?;
    let guid: String = key.get_value("MachineGuid")?;
    Ok(guid)
}

pub struct LicenseManager {
    license_path: PathBuf,
    revocation_list: HashSet<String>,
}

impl LicenseManager {
    pub fn new(app_data_dir: PathBuf) -> Self {
        Self {
            license_path: app_data_dir.join("license.pem"),
            revocation_list: HashSet::new(),
        }
    }

    pub fn load_license(&self) -> Result<Option<String>> {
        if self.license_path.exists() {
            let content = fs::read_to_string(&self.license_path)?;
            Ok(Some(content))
        } else {
            Ok(None)
        }
    }

    pub fn save_license(&self, license_pem: &str) -> Result<()> {
        fs::write(&self.license_path, license_pem)?;
        eprintln!("License saved to {:?}", self.license_path);
        Ok(())
    }

    pub fn validate_current(&self) -> Result<LicenseInfo> {
        let license_pem = self.load_license()?
            .ok_or_else(|| anyhow::anyhow!("No license found"))?;

        let hw_fingerprint = generate_hw_fingerprint()?;
        validate_offline(&license_pem, hw_fingerprint.as_bytes())
    }

    pub fn check_revocation(&self, seat_fingerprint: &str) -> bool {
        self.revocation_list.contains(seat_fingerprint)
    }

    pub fn load_revocation_list(&mut self, crl_path: PathBuf) -> Result<()> {
        if crl_path.exists() {
            let content = fs::read_to_string(crl_path)?;
            for line in content.lines() {
                let line = line.trim();
                if !line.is_empty() && !line.starts_with('#') {
                    self.revocation_list.insert(line.to_string());
                }
            }
        }
        Ok(())
    }
}
