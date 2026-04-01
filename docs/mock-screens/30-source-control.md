# Screen 30: Source Control (Git)

## Phase: 2 (Enterprise/Paid — "Version control using Git" excluded from Community Edition)

## Description
Connect the n8n instance to a Git repository for workflow version control.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > Source Control               🔒 Enterprise   │
│  n8n │                                                         │
│ ──── │  ┌─ Git Repository ───────────────────────────────┐     │
│      │  │                                                │     │
│ Sett │  │  Status: 🔴 Not Connected                      │     │
│ ings │  │                                                │     │
│      │  │  Repository URL                                │     │
│ ├ Src│  │  ┌──────────────────────────────────────┐      │     │
│ │Ctrl│  │  │ git@github.com:org/n8n-workflows.git │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  Branch                                        │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ main                              ▼  │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  SSH Key / Auth                                │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ ••••••••••••••••••••••••••••••       │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │           Connect                    │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  └────────────────────────────────────────────────┘     │
│      │                                                         │
│      │  ── After connected: ──                                 │
│      │                                                         │
│      │  ┌──────────────┐  ┌──────────────┐                     │
│      │  │  ↓ Pull      │  │  ↑ Push      │                     │
│      │  └──────────────┘  └──────────────┘                     │
│      │                                                         │
│      │  Last sync: Apr 1, 2026 at 9:00am                       │
└──────┴──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Settings > Source Control page
- Same Git repository configuration fields
- Same Pull/Push buttons after connection
- Same branch selector
