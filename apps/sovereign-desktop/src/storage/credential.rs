use anyhow::Result;
use std::ptr;
use windows::Win32::Security::Credentials::{
    CredWriteW, CredReadW, CredDeleteW, CredEnumerateW, CredFree,
    CRED_TYPE_GENERIC, CREDENTIALW, CRED_PERSIST_LOCAL_MACHINE, CRED_ENUMERATE_FLAGS,
};
use windows::core::PCWSTR;
use windows::core::PWSTR;

const CRED_PREFIX: &str = "SovereignDesktop_";

pub fn store_credential(key: &str, secret: &[u8]) -> Result<()> {
    let full_key = format!("{}{}", CRED_PREFIX, key);
    let wide_key: Vec<u16> = full_key.encode_utf16().chain(std::iter::once(0)).collect();
    let wide_comment: Vec<u16> = "Sovereign Desktop credential".encode_utf16().chain(std::iter::once(0)).collect();

    let mut credential = CREDENTIALW {
        Type: CRED_TYPE_GENERIC,
        TargetName: PWSTR(wide_key.as_ptr() as *mut _),
        Comment: PWSTR(wide_comment.as_ptr() as *mut _),
        CredentialBlobSize: secret.len() as u32,
        CredentialBlob: secret.as_ptr() as *mut _,
        Persist: CRED_PERSIST_LOCAL_MACHINE,
        ..Default::default()
    };

    let result = unsafe { CredWriteW(&credential, 0) };
    if let Err(e) = result {
        anyhow::bail!("Failed to write credential: {:?}", e);
    }

    Ok(())
}

pub fn get_credential(key: &str) -> Result<Vec<u8>> {
    let full_key = format!("{}{}", CRED_PREFIX, key);
    let wide_key: Vec<u16> = full_key.encode_utf16().chain(std::iter::once(0)).collect();

    let mut credential_ptr: *mut CREDENTIALW = ptr::null_mut();
    let result = unsafe { CredReadW(PCWSTR(wide_key.as_ptr()), CRED_TYPE_GENERIC, 0, &mut credential_ptr) };

    if let Err(e) = result {
        anyhow::bail!("Credential not found: {} - {:?}", key, e);
    }

    let credential = unsafe { &*credential_ptr };
    let secret = unsafe {
        std::slice::from_raw_parts(credential.CredentialBlob, credential.CredentialBlobSize as usize).to_vec()
    };

    unsafe { CredFree(credential_ptr as _) };

    Ok(secret)
}

pub fn delete_credential(key: &str) -> Result<()> {
    let full_key = format!("{}{}", CRED_PREFIX, key);
    let wide_key: Vec<u16> = full_key.encode_utf16().chain(std::iter::once(0)).collect();

    let result = unsafe { CredDeleteW(PCWSTR(wide_key.as_ptr()), CRED_TYPE_GENERIC, 0) };
    if let Err(e) = result {
        anyhow::bail!("Failed to delete credential: {:?}", e);
    }

    Ok(())
}

pub fn list_credentials() -> Result<Vec<String>> {
    let filter = format!("{}*", CRED_PREFIX);
    let wide_filter: Vec<u16> = filter.encode_utf16().chain(std::iter::once(0)).collect();

    let mut count: u32 = 0;
    let mut credentials_ptr: *mut *mut CREDENTIALW = ptr::null_mut();

    let result = unsafe { CredEnumerateW(PCWSTR(wide_filter.as_ptr()), CRED_ENUMERATE_FLAGS(0), &mut count, &mut credentials_ptr) };
    if result.is_err() {
        return Ok(vec![]);
    }

    let mut keys = Vec::new();
    for i in 0..count as usize {
        let cred = unsafe { *credentials_ptr.add(i) };
        let target_name = unsafe {
            let len = (*cred).TargetName.0 as usize;
            let slice = std::slice::from_raw_parts((*cred).TargetName.0 as *const u16, len);
            std::ffi::OsString::from_wide(slice)
        };
        if let Some(key_str) = target_name.to_str() {
            if let Some(stripped) = key_str.strip_prefix(CRED_PREFIX) {
                keys.push(stripped.to_string());
            }
        }
    }

    unsafe { CredFree(credentials_ptr as _) };

    Ok(keys)
}
