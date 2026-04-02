use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub n8n_base_url: String,
    pub n8n_api_key: String,
    pub debug: bool,
}

/// Locate the .env file: try the Tauri resource directory first, then fall back
/// to the current working directory.
fn find_env_file(app_handle: Option<&tauri::AppHandle>) -> Result<PathBuf, String> {
    // Try resource dir if an app handle is available
    if let Some(handle) = app_handle {
        let resource_path = handle
            .path()
            .resource_dir()
            .ok()
            .map(|d| d.join(".env"));
        if let Some(ref p) = resource_path {
            if p.exists() {
                return Ok(p.clone());
            }
        }
    }

    // Fallback: current working directory
    let cwd_path = std::env::current_dir()
        .map_err(|e| format!("Cannot determine current directory: {}", e))?
        .join(".env");

    if cwd_path.exists() {
        return Ok(cwd_path);
    }

    Err(
        "Configuration file .env not found. \
         Please create a .env file with N8N_BASE_URL and N8N_API_KEY. \
         See .env.example for the expected format."
            .to_string(),
    )
}

/// Parse a .env file into key-value pairs (simple KEY=VALUE per line).
fn parse_env_file(path: &PathBuf) -> Result<std::collections::HashMap<String, String>, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read .env file at {}: {}", path.display(), e))?;

    let mut map = std::collections::HashMap::new();
    for line in content.lines() {
        let trimmed = line.trim();
        // Skip empty lines and comments
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        if let Some((key, value)) = trimmed.split_once('=') {
            let key = key.trim().to_string();
            // Strip surrounding quotes from value
            let value = value.trim();
            let value = if (value.starts_with('"') && value.ends_with('"'))
                || (value.starts_with('\'') && value.ends_with('\''))
            {
                value[1..value.len() - 1].to_string()
            } else {
                value.to_string()
            };
            map.insert(key, value);
        }
    }
    Ok(map)
}

#[tauri::command]
pub fn read_env_config(app_handle: tauri::AppHandle) -> Result<AppConfig, String> {
    let env_path = find_env_file(Some(&app_handle))?;
    let vars = parse_env_file(&env_path)?;

    let base_url = vars
        .get("N8N_BASE_URL")
        .filter(|v| !v.is_empty())
        .ok_or_else(|| {
            "N8N_BASE_URL is missing from .env file. \
             Please add N8N_BASE_URL=http://localhost:5678 to your .env file."
                .to_string()
        })?
        .clone();

    let api_key = vars
        .get("N8N_API_KEY")
        .filter(|v| !v.is_empty())
        .ok_or_else(|| {
            "N8N_API_KEY is missing or empty in .env file. \
             Please add your n8n API key to the .env file."
                .to_string()
        })?
        .clone();

    let debug = vars
        .get("DEBUG")
        .map(|v| v.to_lowercase() == "true")
        .unwrap_or(false);

    Ok(AppConfig {
        n8n_base_url: base_url,
        n8n_api_key: api_key,
        debug,
    })
}

/// Standalone helper used by lib.rs setup (no Tauri command context).
pub fn read_env_config_standalone() -> Result<AppConfig, String> {
    let env_path = find_env_file(None)?;
    let vars = parse_env_file(&env_path)?;

    let base_url = vars
        .get("N8N_BASE_URL")
        .filter(|v| !v.is_empty())
        .ok_or_else(|| "N8N_BASE_URL is missing from .env file.".to_string())?
        .clone();

    let api_key = vars
        .get("N8N_API_KEY")
        .filter(|v| !v.is_empty())
        .ok_or_else(|| "N8N_API_KEY is missing or empty in .env file.".to_string())?
        .clone();

    let debug = vars
        .get("DEBUG")
        .map(|v| v.to_lowercase() == "true")
        .unwrap_or(false);

    Ok(AppConfig {
        n8n_base_url: base_url,
        n8n_api_key: api_key,
        debug,
    })
}
