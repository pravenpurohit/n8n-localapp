# Screen 06: Workflow-Level Executions

## Phase: 1 (Free Community Edition)

## Description
Accessed via the "Executions" tab within the Workflow Canvas Editor. Shows execution history for the specific workflow being edited. Allows debugging by overlaying execution data on the canvas.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │ ┌─ Top Bar ──────────────────────────────────────────┐   │
│  n8n │ │ ◀ Data Sync ✏️  [sync]       │Save│Publish│History│   │
│      │ └────────────────────────────────────────────────────┘   │
│ ──── │ ┌─ Tab Bar ──────────────────────────────────────────┐   │
│      │ │  [Editor]  [Executions ●]                          │   │
│ Over │ └────────────────────────────────────────────────────┘   │
│ view │                                                         │
│      │  ┌─ Execution List (left panel) ─┬─ Canvas Preview ──┐  │
│ Work │  │                               │                    │  │
│ flows│  │  #1041 ❌ Apr 1, 9:00am       │  ┌──────────┐     │  │
│      │  │  Duration: 0.8s               │  │ Schedule │     │  │
│ Temp │  │  ─────────────────────        │  │ Trigger ✅│──┐  │  │
│ lates│  │  #1038 ✅ Mar 31, 11pm        │  └──────────┘  │  │  │
│      │  │  Duration: 0.5s               │       ┌────────┘  │  │
│ Cred │  │  ─────────────────────        │       ▼           │  │
│ entia│  │  #1036 ❌ Mar 31, 9pm         │  ┌──────────┐    │  │
│ ls   │  │  Duration: 1.2s               │  │  HTTP    │    │  │
│      │  │  ─────────────────────        │  │ Request❌│──┐ │  │
│ Exec │  │  #1033 ✅ Mar 31, 8pm         │  └──────────┘  │ │  │
│ ution│  │  Duration: 0.9s               │       ┌────────┘ │  │
│ s    │  │                               │       ▼          │  │
│      │  │                               │  ┌──────────┐   │  │
│ ──── │  │                               │  │  Slack   │   │  │
│ Sett │  │                               │  │ Message⏭│   │  │
│ ings │  │  [📋 Copy to Editor]          │  └──────────┘   │  │
│      │  │  [🔄 Re-run]                  │                   │  │
│      │  └───────────────────────────────┴───────────────────┘  │
└──────┴──────────────────────────────────────────────────────────┘
```

## Components

| Component | Description |
|-----------|-------------|
| Execution List | Left panel showing past executions with status, timestamp, duration |
| Canvas Preview | Right panel showing the workflow with execution status overlaid on nodes |
| Copy to Editor | Loads the execution's workflow state into the editor for debugging |
| Re-run | Re-executes with the same input data |

## Interactions
- Clicking an execution in the left list updates the canvas preview with that execution's data
- Node status icons (✅❌⏭) overlay on each node
- Clicking a node in the preview shows its input/output data
- "Copy to Editor" switches to the Editor tab with the execution data pinned
- "Re-run" triggers a new execution via the API

## n8n.com Comparison
- Matches n8n's workflow-level executions tab exactly
- Same split layout: execution list on left, canvas preview on right
- Same "Copy to Editor" and debug functionality
- n8n.com calls it "Debug" — we match this terminology
