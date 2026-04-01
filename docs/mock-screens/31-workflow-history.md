# Screen 31: Workflow History

## Phase: 2 (Enterprise/Paid — Workflow history requires paid plan)

## Description
View and restore previous versions of a workflow. Accessed from the History button in the Canvas editor top bar.

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ ┌─ Top Bar ──────────────────────────────────────────────┐   │
│ │ ◀ My Workflow ✏️  [tags]        │Save│Publish│History●│   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌─ Version List ──────┬─ Canvas Preview ─────────────────┐   │
│ │                     │                                  │   │
│ │  Current Version    │  ┌──────────┐    ┌──────────┐   │   │
│ │  Apr 1, 9:30am      │  │ Schedule │───▶│  HTTP    │   │   │
│ │  "Added Slack node"  │  │ Trigger  │    │ Request  │──┐│   │
│ │  ─────────────────  │  └──────────┘    └──────────┘  ││   │
│ │                     │                    ┌──────────┐ ││   │
│ │  ● Version 3        │                    │  Slack   │◀┘│   │
│ │  Mar 31, 4:00pm     │                    │ Message  │  │   │
│ │  "Changed HTTP URL"  │                    └──────────┘  │   │
│ │  ─────────────────  │                                  │   │
│ │                     │                                  │   │
│ │  ○ Version 2        │                                  │   │
│ │  Mar 30, 2:00pm     │                                  │   │
│ │  "Added error flow"  │                                  │   │
│ │  ─────────────────  │                                  │   │
│ │                     │                                  │   │
│ │  ○ Version 1        │                                  │   │
│ │  Mar 29, 10:00am    │                                  │   │
│ │  "Initial version"   │                                  │   │
│ │                     │                                  │   │
│ │  ┌──────────────┐   │                                  │   │
│ │  │   Restore    │   │                                  │   │
│ │  └──────────────┘   │                                  │   │
│ └─────────────────────┴──────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's workflow history feature
- Same version list with timestamps and descriptions
- Same canvas preview of selected version
- Same restore functionality
- n8n.com also shows visual diff — we include this as a comparison view
