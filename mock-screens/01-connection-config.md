# Screen 01: .env Error Screen

## Phase: 1 (Free Community Edition)

## Description
No login screen exists. The app reads credentials from `.env` and boots straight to Overview. This screen only appears when `.env` is missing or invalid.

## ASCII Wireframe

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ┌──────────┐                          │
│                    │  n8n     │                          │
│                    │  logo    │                          │
│                    └──────────┘                          │
│                                                         │
│              ⚠️  Connection Error                        │
│                                                         │
│   ┌─────────────────────────────────────────────┐       │
│   │                                             │       │
│   │  ❌ N8N_API_KEY: (not set)                  │       │
│   │  ❌ N8N_BASE_URL: http://localhost:5678     │       │
│   │     Error: Connection refused               │       │
│   │                                             │       │
│   │  1. Start n8n: npx n8n                      │       │
│   │  2. Generate API key in Settings > n8n API  │       │
│   │  3. Add it to .env (see .env.example)       │       │
│   │                                             │       │
│   └─────────────────────────────────────────────┘       │
│                                                         │
│            ┌──────────────────────┐                     │
│            │     Retry            │                     │
│            └──────────────────────┘                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- n8n.com has email/password login — we skip this entirely
- This error screen is unique to the local app
