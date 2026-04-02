use std::fs;
use std::io::Write;
use std::path::PathBuf;

const MAX_LOG_SIZE: u64 = 10 * 1024 * 1024; // 10 MB

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
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file '{}': {}", path, e))
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file '{}': {}", path, e))
}
