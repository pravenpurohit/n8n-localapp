# Screen 09: Local App Settings (Theme Only)

## Phase: 1 (Free Community Edition)

## Description
Local-only settings screen. Theme selection and read-only connection info. Profile editing and password change are Phase 3 (require internal REST API).

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > App Preferences                              │
│  n8n │                                                         │
│ ──── │  ┌─ Theme ────────────────────────────────────────┐     │
│      │  │  ○ Light   ● Dark   ○ System Default           │     │
│ Sett │  └────────────────────────────────────────────────┘     │
│ ings │                                                         │
│      │  ┌─ Connection Info (read-only) ──────────────────┐     │
│      │  │  Instance: http://localhost:5678                │     │
│      │  │  Status:   ✅ Connected                        │     │
│      │  └────────────────────────────────────────────────┘     │
│      │                                                         │
│      │  ┌─ Profile (Phase 3) ────────────────────────────┐     │
│      │  │  🔒 Profile editing requires session auth.     │     │
│      │  │  Edit your profile at http://localhost:5678     │     │
│      │  └────────────────────────────────────────────────┘     │
└──────┴──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- n8n.com has full profile editing — we defer that to Phase 3
- Theme selector matches n8n.com (light/dark/system)
