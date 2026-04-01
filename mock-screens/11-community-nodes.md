# Screen 11: Community Nodes Settings

## Phase: 3 (Requires Internal REST API)

## Description
Install/uninstall community nodes from npm. This feature is free on Community Edition but has no public API endpoint — requires session auth via `/rest/` endpoints.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > Community Nodes             🔒 Phase 3       │
│  n8n │                                                         │
│ ──── │  ┌─────────────────────────────────────────────────┐    │
│      │  │ 🔒 Community node management requires session   │    │
│ Sett │  │ authentication (not available via API key).      │    │
│ ings │  │                                                 │    │
│      │  │ Manage community nodes at:                      │    │
│      │  │ http://localhost:5678/settings/community-nodes   │    │
│      │  └─────────────────────────────────────────────────┘    │
└──────┴──────────────────────────────────────────────────────────┘
```

## Full UI (when Phase 3 is implemented)

```
┌──────────────────────────────────────────────────────────┐
│  Settings > Community Nodes                              │
│                                                          │
│  ⚠️  Community nodes are not verified by n8n.            │
│                                                          │
│  ┌──────────────────┐                                    │
│  │ + Install Node   │                                    │
│  └──────────────────┘                                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Package              Version  Status   Actions  │    │
│  ├──────────────────────────────────────────────────┤    │
│  │  n8n-nodes-puppeteer  1.2.0    ✅ OK   [Uninstall]│   │
│  │  n8n-nodes-redis      2.0.3    ⚠️      [Uninstall]│   │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Settings > Community Nodes page (when Phase 3 implemented)
- Phase 1 shows a redirect to the n8n web UI instead
