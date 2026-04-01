# Screen 28: Log Streaming

## Phase: 2 (Enterprise/Paid — "Log streaming" excluded from Community Edition)

## Description
Configure destinations for streaming n8n event logs to external monitoring systems.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > Log Streaming               🔒 Enterprise    │
│  n8n │                                                         │
│ ──── │  ┌──────────────────────┐                               │
│      │  │ + Add Destination    │                               │
│ Sett │  └──────────────────────┘                               │
│ ings │                                                         │
│      │  ┌──────────────────────────────────────────────────┐   │
│ ├ Log│  │  📡 Syslog Server                                │   │
│ │Strm│  │     syslog.example.com:514  |  ✅ Active         │   │
│      │  │     Events: workflow.*, node.error                │   │
│      │  ├──────────────────────────────────────────────────┤   │
│      │  │  📡 Webhook Destination                          │   │
│      │  │     https://logs.example.com/n8n  |  ✅ Active   │   │
│      │  │     Events: All                                  │   │
│      │  └──────────────────────────────────────────────────┘   │
└──────┴──────────────────────────────────────────────────────────┘
```

## Add Destination Modal

```
┌──────────────────────────────────────────────────┐
│ New Event Destination                     [✕]    │
│                                                  │
│ Destination Type                                 │
│ ┌──────────────────────────────────────────┐     │
│ │ Syslog                                ▼  │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ Host                                             │
│ ┌──────────────────────────────────────────┐     │
│ │ syslog.example.com                       │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ Port                                             │
│ ┌──────────────────────────────────────────┐     │
│ │ 514                                      │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ Events to stream:                                │
│ ☑ Workflow started                               │
│ ☑ Workflow completed                             │
│ ☑ Workflow failed                                │
│ ☑ Node error                                     │
│ ☐ Node started                                   │
│ ☐ Node completed                                 │
│ ☑ User login                                     │
│                                                  │
│ ┌──────────────────────────────────────────┐     │
│ │              Save                        │     │
│ └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Settings > Log Streaming page
- Same destination type selection
- Same event selection checkboxes
