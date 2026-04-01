# Screen 03: Workflow Canvas Editor

## Phase: 1 (Free Community Edition)

## Description
The core screen of the application. A visual node-based editor where users build workflows by placing nodes on a canvas and connecting them. This is the most complex screen and the heart of the n8n experience.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │ ┌─ Top Bar ──────────────────────────────────────────┐   │
│  n8n │ │ ◀ My Workflow Name ✏️  [+ Add Tag]  │Save│Publish│  │   │
│      │ │                                     │Share│History│  │   │
│ ──── │ └────────────────────────────────────────────────────┘   │
│      │ ┌─ Tab Bar ──────────────────────────────────────────┐   │
│ Over │ │  [Editor]  [Executions]                            │   │
│ view │ └────────────────────────────────────────────────────┘   │
│      │                                                         │
│ Work │  ┌─────────────────────────────────────────────────┐    │
│ flows│  │  · · · · · · · · · · · · · · · · · · · · · · · │    │
│      │  │  · · · · · · · · · · · · · · · · · · · · · · · │    │
│ Temp │  │  ·  ┌──────────┐     ┌──────────┐  · · · · · · │    │
│ lates│  │  ·  │ Schedule │────▶│  HTTP    │  · · · · · · │    │
│      │  │  ·  │ Trigger  │     │ Request  │──┐ · · · · · │    │
│ Cred │  │  ·  └──────────┘     └──────────┘  │ · · · · · │    │
│ entia│  │  · · · · · · · · · · · · · · · · · │ · · · · · │    │
│ ls   │  │  · · · · · · · · · ┌──────────┐   │ · · · · · │    │
│      │  │  · · · · · · · · · │  Slack   │◀──┘ · · · · · │    │
│ Exec │  │  · · · · · · · · · │ Message  │  · · · · · · · │    │
│ ution│  │  · · · · · · · · · └──────────┘  · · · · · · · │    │
│ s    │  │  · · · · · · · · · · · · · · · · · · · · · · · │    │
│      │  │  · · · · · · · · · · · · · · · · · · · · · · · │    │
│ ──── │  │                                                 │    │
│ Sett │  │  [🔍][+][-][↺][⊞]          [▶ Execute Workflow] │    │
│ ings │  └─────────────────────────────────────────────────┘    │
│      │                                          [📝][+][🤖]    │
└──────┴──────────────────────────────────────────────────────────┘
```

## Components

### Top Bar
| Component | Description |
|-----------|-------------|
| Back arrow (◀) | Returns to Overview |
| Workflow Name | Editable inline text field |
| + Add Tag | Opens tag selector dropdown |
| Save | Saves current workflow state via PUT /workflows/{id} |
| Publish/Activate | Toggles workflow active state via POST /workflows/{id}/activate |
| Share | Opens sharing dialog (Phase 2 — shows "Enterprise" badge in Phase 1) |
| History | Opens version history (Phase 2 — shows "Enterprise" badge in Phase 1) |

### Tab Bar
| Tab | Description |
|-----|-------------|
| Editor | Shows the canvas (default) |
| Executions | Shows workflow-level execution history |

### Canvas Area
- Gray dotted grid background (matches n8n exactly)
- Nodes rendered as rounded rectangles with icon + name
- Connection lines with directional arrows between nodes
- Nodes are draggable, connections are draggable from output ports to input ports

### Canvas Controls (Bottom Left)
| Icon | Action |
|------|--------|
| 🔍 | Zoom to fit |
| + | Zoom in |
| - | Zoom out |
| ↺ | Reset zoom |
| ⊞ | Tidy up nodes |

### Action Buttons (Bottom Right)
| Icon | Action |
|------|--------|
| 📝 | Add sticky note |
| + | Add node (opens node panel) |
| 🤖 | Ask AI Assistant (Phase 2) |

### Execute Workflow Button
- Green button at bottom right of canvas
- Triggers POST to execute the workflow
- Shows progress spinners on each node during execution
- Shows ✅ or ❌ on each node after completion

## Node Hover Actions
```
         ┌──────────┐
    [▶][⏻][🗑][⋯]  │
         │ Schedule │
         │ Trigger  │──▶
         └──────────┘
```
- ▶ Execute this node only
- ⏻ Activate/Deactivate node
- 🗑 Delete node
- ⋯ More options (duplicate, copy, disable, pin data, etc.)

## Empty State
```
┌─────────────────────────────────────┐
│                                     │
│     ┌─────────────────────┐         │
│     │  + Add first step   │         │
│     │                     │         │
│     │  Click to add a     │         │
│     │  trigger node       │         │
│     └─────────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

## n8n.com Comparison
- Canvas layout matches n8n.com exactly: gray dotted grid, same control positions
- Top bar matches: name, tags, save, publish, share, history
- Node rendering matches: rounded rectangles with icons
- Connection lines match: directional arrows between output/input ports
- Zoom controls match: same 5 controls in bottom-left
- Execute button matches: same position and behavior
- n8n.com has "Ask Assistant" button — we show it but mark as Enterprise in Phase 1
