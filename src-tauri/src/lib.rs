mod commands;

use commands::{env, fs, http};

/// Wrapper holding the allowed n8n base URL for HTTP request validation.
pub struct AllowedBaseUrl(pub String);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(reqwest::Client::new())
        .setup(|app| {
            // Read .env config during setup to initialise AllowedBaseUrl state
            let config = env::read_env_config_standalone().map_err(|e| {
                eprintln!("Failed to read .env config: {}", e);
                Box::<dyn std::error::Error>::from(e)
            })?;
            app.manage(AllowedBaseUrl(config.n8n_base_url));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            http::http_request,
            env::read_env_config,
            fs::append_log,
            fs::write_file,
            fs::read_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
