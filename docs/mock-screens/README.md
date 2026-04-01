# Local n8n App — Mock Screens

This folder contains ASCII wireframe mockups and detailed screen descriptions for every screen in the Local n8n App. Each file describes the layout, components, interactions, and how it maps to the actual n8n.com web interface.

## Phase 1 Screens (Free Community Edition Public API via API Key)

| # | Screen | File | Req # |
|---|--------|------|-------|
| 1 | .env Error Screen | [01-connection-config.md](01-connection-config.md) | 1 |
| 2 | Overview / Home Page | [02-overview-home.md](02-overview-home.md) | 2 |
| 3 | Workflow Canvas Editor | [03-workflow-canvas.md](03-workflow-canvas.md) | 3, 36, 37 |
| 4 | Node Configuration Panel | [04-node-config-panel.md](04-node-config-panel.md) | 4, 31, 32, 33 |
| 5 | Global Executions Page | [05-global-executions.md](05-global-executions.md) | 5 |
| 6 | Workflow-Level Executions | [06-workflow-executions.md](06-workflow-executions.md) | 6 |
| 7 | Credentials Management | [07-credentials.md](07-credentials.md) | 7 |
| 8 | Templates Page | [08-templates.md](08-templates.md) | 8 |
| 9 | App Settings (theme + connection info) | [09-personal-settings.md](09-personal-settings.md) | 12, 14 |
| 10 | Workflow Settings Modal | [12-workflow-settings-modal.md](12-workflow-settings-modal.md) | 21 |
| 11 | Tags Management | [13-tags-management.md](13-tags-management.md) | 23 |
| 12 | Data Tables | [14-data-tables.md](14-data-tables.md) | 24 |
| 13 | Workflow Import/Export | [15-import-export.md](15-import-export.md) | 25 |
| 14 | Security Audit | [16-security-audit.md](16-security-audit.md) | 26 |
| 15 | Left Sidebar Navigation | [17-sidebar-navigation.md](17-sidebar-navigation.md) | 29 |
| 16 | Error/Offline States | [21-error-offline-states.md](21-error-offline-states.md) | 34 |

Note: Screens for Webhook Management (Req 31), Code Node Editor (Req 32), and AI/LangChain Nodes (Req 33) are sub-screens within the Node Configuration Panel (screen 4). Responsive Layout & Theming (Req 30) and Mock Screens doc (Req 35) are cross-cutting concerns, not standalone screens.

## Phase 2 Screens (Enterprise/Paid Features)

| # | Screen | File | Req # |
|---|--------|------|-------|
| 17 | Variables Management | [22-variables-management.md](22-variables-management.md) | 9 |
| 18 | Insights Dashboard | [23-insights-dashboard.md](23-insights-dashboard.md) | 10 |
| 19 | Projects Management | [24-projects-management.md](24-projects-management.md) | 11 |
| 20 | Users Management | [25-users-management.md](25-users-management.md) | 13 |
| 21 | LDAP Settings | [26-ldap-settings.md](26-ldap-settings.md) | 15 |
| 22 | SAML/SSO Settings | [27-saml-sso-settings.md](27-saml-sso-settings.md) | 16 |
| 23 | Log Streaming | [28-log-streaming.md](28-log-streaming.md) | 17 |
| 24 | External Secrets | [29-external-secrets.md](29-external-secrets.md) | 18 |
| 25 | Source Control (Git) | [30-source-control.md](30-source-control.md) | 20 |
| 26 | Workflow History | [31-workflow-history.md](31-workflow-history.md) | 22 |
| 27 | Sharing Dialog | [32-sharing-dialog.md](32-sharing-dialog.md) | 27 |
| 28 | AI Assistant Panel | [33-ai-assistant.md](33-ai-assistant.md) | 28 |

## Phase 3 Screens (Free but requires Internal REST API / Session Auth)

These features are free on Community Edition but cannot be accessed via the public API key. They require email/password session login to the internal `/rest/` API.

| # | Screen | File | Req # | Why Not API Key |
|---|--------|------|-------|-----------------|
| 29 | Personal Settings (profile/password) | [09-personal-settings.md](09-personal-settings.md) | 12 | Profile update uses /rest/ only |
| 30 | API Keys Management | [10-connection-status.md](10-connection-status.md) | 14 | Key create/delete uses /rest/api-keys |
| 31 | Community Nodes | [11-community-nodes.md](11-community-nodes.md) | 19 | Install/uninstall uses /rest/ only |

Note: Phase 1 includes simplified versions of screens 29 and 30 (theme-only settings and read-only connection status) within screen 9.
