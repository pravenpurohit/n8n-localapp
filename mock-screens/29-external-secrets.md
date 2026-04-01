# Screen 29: External Secrets

## Phase: 2 (Enterprise/Paid — "External secrets" excluded from Community Edition)

## Description
Configure external secret providers like AWS Secrets Manager for use in workflows.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > External Secrets            🔒 Enterprise    │
│  n8n │                                                         │
│ ──── │  ┌─ AWS Secrets Manager ──────────────────────────┐     │
│      │  │                                                │     │
│ Sett │  │  Status: ✅ Connected                          │     │
│ ings │  │                                                │     │
│      │  │  Access Key ID                                 │     │
│ ├ Ext│  │  ┌──────────────────────────────────────┐      │     │
│ │Sec │  │  │ AKIA••••••••••••••••                 │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  Secret Access Key                             │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ ••••••••••••••••••••••••••••••       │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  Region                                        │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ us-east-1                         ▼  │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  ┌────────────────┐  ┌──────────────────┐      │     │
│      │  │  │ Test Connection│  │ Save             │      │     │
│      │  │  └────────────────┘  └──────────────────┘      │     │
│      │  └────────────────────────────────────────────────┘     │
└──────┴──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Settings > External Secrets page
- Same AWS Secrets Manager configuration fields
- Same test connection functionality
