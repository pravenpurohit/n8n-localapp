# Screen 16: Security Audit

## Phase: 1 (Free Community Edition)

## Description
Run a security audit on the n8n instance to identify vulnerabilities and misconfigurations. Uses POST /api/v1/audit endpoint.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > Security Audit                               │
│  n8n │                                                         │
│ ──── │  ┌──────────────────┐                                   │
│      │  │ 🔍 Run Audit     │                                   │
│ Sett │  └──────────────────┘                                   │
│ ings │                                                         │
│      │  Last audit: Apr 1, 2026 at 9:30am                      │
│      │                                                         │
│      │  ┌─ Audit Results ────────────────────────────────┐     │
│      │  │                                                │     │
│      │  │  🔴 Credentials Risk (2 issues)                │     │
│      │  │  ├─ 3 unused credentials found                 │     │
│      │  │  │  Recommendation: Remove unused credentials  │     │
│      │  │  ├─ 1 credential with weak encryption          │     │
│      │  │  │  Recommendation: Rotate credential          │     │
│      │  │  │                                             │     │
│      │  │  🟡 Nodes Risk (1 issue)                       │     │
│      │  │  ├─ 2 community nodes installed                │     │
│      │  │  │  Recommendation: Verify node sources        │     │
│      │  │  │                                             │     │
│      │  │  🟢 Instance Risk (0 issues)                   │     │
│      │  │  ├─ All webhooks are protected ✅               │     │
│      │  │  │                                             │     │
│      │  │  🟢 Database Risk (0 issues)                   │     │
│      │  │  ├─ No SQL injection risks found ✅             │     │
│      │  │  │                                             │     │
│      │  │  🟢 Filesystem Risk (0 issues)                 │     │
│      │  │  ├─ No file access risks found ✅               │     │
│      │  │                                                │     │
│      │  └────────────────────────────────────────────────┘     │
└──────┴──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Uses the same POST /api/v1/audit endpoint available on all self-hosted instances
- Same risk categories: Credentials, Nodes, Instance, Database, Filesystem
- Same color-coded severity levels
- n8n.com may show this in a different location — we place it under Settings
