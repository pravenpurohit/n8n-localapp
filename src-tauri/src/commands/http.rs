use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::AllowedBaseUrl;

#[derive(Deserialize)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub body: Option<serde_json::Value>,
    pub headers: Option<HashMap<String, String>>,
}

#[derive(Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub body: String,
    pub headers: HashMap<String, String>,
}

#[tauri::command]
pub async fn http_request(
    client: tauri::State<'_, reqwest::Client>,
    allowed_base_url: tauri::State<'_, AllowedBaseUrl>,
    request: HttpRequest,
) -> Result<HttpResponse, String> {
    // Security: validate URL is within the allowed base URL
    if !request.url.starts_with(&allowed_base_url.0) {
        return Err(format!(
            "URL not allowed: {}. Only requests to {} are permitted.",
            request.url, allowed_base_url.0
        ));
    }

    let method = request
        .method
        .parse::<reqwest::Method>()
        .map_err(|e| format!("Unsupported HTTP method '{}': {}", request.method, e))?;

    let mut req_builder = client.request(method, &request.url);

    if let Some(headers) = request.headers {
        for (key, value) in headers {
            req_builder = req_builder.header(&key, &value);
        }
    }

    if let Some(body) = request.body {
        req_builder = req_builder.json(&body);
    }

    let response = req_builder.send().await.map_err(|e| e.to_string())?;

    let status = response.status().as_u16();
    let resp_headers: HashMap<String, String> = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();
    let body = response.text().await.map_err(|e| e.to_string())?;

    Ok(HttpResponse {
        status,
        body,
        headers: resp_headers,
    })
}
