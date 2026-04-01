# Screen 10: Connection Status

## Phase: 1 (read-only) / Phase 3 (full key management)

## Description
Read-only connection status display. Shows whether the API key from `.env` is valid. Full API key create/delete is Phase 3.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > Connection                                   │
│  n8n │                                                         │
│ ──── │  ┌─ Status ───────────────────────────────────────┐     │
│      │  │  Instance:  http://localhost:5678  ✅ Connected │     │
│ Sett │  │  API Key:   ••••••••••••••pQ_M    ✅ Valid      │     │
│ ings │  │  n8n Ver:   2.14.2                             │     │
│      │  │                                                │     │
│      │  │  ┌────────────────┐                            │     │
│      │  │  │ Test Connection│                            │     │
│      │  │  └────────────────┘                            │     │
│      │  │                                                │     │
│      │  │  ℹ️  Edit .env to change credentials.          │     │
│      │  └────────────────────────────────────────────────┘     │
│      │                                                         │
│      │  ┌─ API Key Management (Phase 3) ─────────────────┐     │
│      │  │  🔒 Create/delete keys requires session auth.  │     │
│      │  │  Manage keys at http://localhost:5678/settings  │     │
│      │  └────────────────────────────────────────────────┘     │
└──────┴──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- n8n.com has full key create/delete UI — we show read-only status in Phase 1
- Full management deferred to Phase 3 (internal REST API)
