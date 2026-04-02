use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

const MAX_LOG_SIZE: u64 = 10 * 1024 * 1024; // 10 MB

/// Safe base directory for user file operations (exports, etc.).
/// Defaults to the current working directory. In production, this should
/// be the Tauri app data directory.
fn safe_base_dir() -> Result<PathBuf, String> {
    std::env::current_dir().map_err(|e| format!("Cannot determine base directory: {}", e))
}

/// Validate that a path resolves to within the allowed base directory.
/// Prevents path traversal attacks (e.g. "../../etc/passwd").
fn validate_path(user_path: &str) -> Result<PathBuf, String> {
    let base = safe_base_dir()?;
    let requested = base.join(user_path);
    let canonical = requested
        .canonicalize()
        .or_else(|_| {
            // File may not exist yet (write_file). Canonicalize the parent instead.
            if let Some(parent) = requested.parent() {
                fs::create_dir_all(parent).ok();
                parent.canonicalize().map(|p| p.join(requested.file_name().unwrap_or_default()))
            } else {
                Err(std::io::Error::new(std::io::ErrorKind::NotFound, "invalid path"))
            }
        })
        .map_err(|e| format!("Invalid path '{}': {}", user_path, e))?;

    let canonical_base = base.canonicalize().map_err(|e| format!("Cannot resolve base dir: {}", e))?;
    if !canonical.starts_with(&canonical_base) {
        return Err(format!(
            "Path '{}' is outside the allowed directory. Only paths within the app directory are permitted.",
            user_path
        ));
    }
    Ok(canonical)
}

#[tauri::command]
pub fn append_log(entry: String) -> Result<(), String> {
    let path = PathBuf::from("debug.log");

    // Rotate if the log file exceeds 10 MB
    if path.exists() {
        let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
        if metadata.len() >= MAX_LOG_SIZE {
            let rotated = PathBuf::from("debug.log.1");
            fs::rename(&path, &rotated).map_err(|e| {
                format!("Failed to rotate debug.log: {}", e)
            })?;
        }
    }

    let mut file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| format!("Failed to open debug.log: {}", e))?;

    writeln!(file, "{}", entry)
        .map_err(|e| format!("Failed to write to debug.log: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    let safe_path = validate_path(&path)?;
    fs::write(&safe_path, content)
        .map_err(|e| format!("Failed to write file '{}': {}", path, e))
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    let safe_path = validate_path(&path)?;
    fs::read_to_string(&safe_path)
        .map_err(|e| format!("Failed to read file '{}': {}", path, e))
}
