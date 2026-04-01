# Screen 12: Workflow Settings Modal

## Phase: 1 (Free Community Edition)

## Description
Modal dialog accessed from the Canvas editor's three-dot menu > Settings. Configures workflow-level behavior including execution order, error handling, timeouts, and time saved estimates.

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────┐
│ Workflow Settings                                 [✕]    │
│                                                          │
│ Execution Order                                          │
│ ┌──────────────────────────────────────────────────┐     │
│ │ v1 (recommended)                              ▼  │     │
│ └──────────────────────────────────────────────────┘     │
│                                                          │
│ Error Workflow                                           │
│ ┌──────────────────────────────────────────────────┐     │
│ │ Select error workflow...                      ▼  │     │
│ └──────────────────────────────────────────────────┘     │
│                                                          │
│ This workflow can be called by                           │
│ ┌──────────────────────────────────────────────────┐     │
│ │ Everyone                                      ▼  │     │
│ └──────────────────────────────────────────────────┘     │
│                                                          │
│ Timezone                                                 │
│ ┌──────────────────────────────────────────────────┐     │
│ │ America/New_York (EDT)                        ▼  │     │
│ └──────────────────────────────────────────────────┘     │
│                                                          │
│ Save failed production executions    [  ● toggle on  ]   │
│ Save successful production executions[  ● toggle on  ]   │
│ Save manual executions               [  ● toggle on  ]   │
│ Save execution progress              [  ○ toggle off ]   │
│                                                          │
│ Timeout Workflow                     [  ○ toggle off ]   │
│ ┌──────────────────────────────────────────────────┐     │
│ │ Timeout after: [  ] hours [  ] min [  ] sec      │     │
│ └──────────────────────────────────────────────────┘     │
│                                                          │
│ Estimated time saved                                     │
│ ┌──────────────────────────────────────────────────┐     │
│ │ Fixed                                         ▼  │     │
│ └──────────────────────────────────────────────────┘     │
│ Minutes saved per execution: [ 5 ]                       │
│                                                          │
│ ┌──────────────────────────────────────────────────┐     │
│ │                    Save                          │     │
│ └──────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Workflow Settings modal exactly
- Same fields: execution order, error workflow, callable-by, timezone
- Same toggles for save execution options
- Same timeout configuration
- Same "Estimated time saved" with Fixed/Dynamic options
- n8n.com added "Dynamic" time saved with Time Saved nodes — we support both
