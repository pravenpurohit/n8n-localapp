# Screen 22: Variables Management

## Phase: 2 (Enterprise/Paid — "Custom Variables" excluded from Community Edition)

## Description
Manage instance-level key-value variables accessible in workflows via $vars.key_name syntax.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Variables                              🔒 Enterprise    │
│  n8n │                                                         │
│ ──── │  ┌─────────────────────────────────────────────────┐    │
│      │  │ ℹ️  Variables are accessible in workflows via   │    │
│ Var  │  │ the $vars.key_name syntax.                      │    │
│ iable│  └─────────────────────────────────────────────────┘    │
│ s    │                                                         │
│      │  ┌──────────────────┐                                   │
│      │  │ + Create Variable│                                   │
│      │  └──────────────────┘                                   │
│      │                                                         │
│      │  ┌──────────────────────────────────────────────────┐   │
│      │  │  Key              Value                 Actions  │   │
│      │  ├──────────────────────────────────────────────────┤   │
│      │  │  API_ENDPOINT     https://api.example.com [✏️][🗑]│   │
│      │  │  ENVIRONMENT      production              [✏️][🗑]│   │
│      │  │  SLACK_CHANNEL    #alerts                 [✏️][🗑]│   │
│      │  └──────────────────────────────────────────────────┘   │
└──────┴──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Variables page exactly
- Same key-value table layout
- Same $vars syntax reference
- Requires Pro/Enterprise plan on n8n.com — same restriction applies here
