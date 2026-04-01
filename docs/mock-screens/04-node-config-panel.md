# Screen 04: Node Configuration Panel

## Phase: 1 (Free Community Edition)

## Description
Right-side panel that opens when a node is clicked on the canvas. Shows node parameters, credentials, settings, and input/output data. This panel slides in from the right and takes up approximately 40% of the screen width.

## ASCII Wireframe

```
┌─────────────────────────┬──────────────────────────────────┐
│                         │ HTTP Request              [✕]    │
│   Canvas Area           │                                  │
│   (nodes visible        │ ┌──────┐┌────────┐┌─────┐┌────┐ │
│    behind panel)        │ │Params││Settings ││Input││Out │ │
│                         │ └──────┘└────────┘└─────┘└────┘ │
│                         │ ═══════                          │
│                         │                                  │
│                         │ Method                           │
│                         │ ┌──────────────────────────┐     │
│                         │ │ GET                    ▼ │     │
│                         │ └──────────────────────────┘     │
│                         │                                  │
│                         │ URL                              │
│                         │ ┌──────────────────────────┐     │
│                         │ │ https://api.example.com  │     │
│                         │ └──────────────────────────┘     │
│                         │                                  │
│                         │ Authentication                   │
│                         │ ┌──────────────────────────┐     │
│                         │ │ Header Auth           ▼  │     │
│                         │ └──────────────────────────┘     │
│                         │                                  │
│                         │ Credential                       │
│                         │ ┌──────────────────────────┐     │
│                         │ │ My API Key            ▼  │     │
│                         │ │ [+ Create New]            │     │
│                         │ └──────────────────────────┘     │
│                         │                                  │
│                         │ ▶ Send Query Parameters          │
│                         │ ▶ Send Headers                   │
│                         │ ▶ Send Body                      │
│                         │                                  │
│                         │ ┌──────────────────────────┐     │
│                         │ │ Options                ▶ │     │
│                         │ └──────────────────────────┘     │
│                         │                                  │
└─────────────────────────┴──────────────────────────────────┘
```

## Tabs

### Parameters Tab (default)
- Renders dynamic form fields based on node type definition
- Fields include: text inputs, dropdowns, toggles, code editors, JSON editors
- Expression mode toggle (= icon) on each field to switch to {{ }} expression editor
- Credential selector when node requires authentication

### Settings Tab
```
┌──────────────────────────────────┐
│ Settings                         │
│                                  │
│ Notes                            │
│ ┌──────────────────────────┐     │
│ │ Add a note about this    │     │
│ │ node...                  │     │
│ └──────────────────────────┘     │
│                                  │
│ Display name in flow             │
│ ┌──────────────────────────┐     │
│ │ HTTP Request             │     │
│ └──────────────────────────┘     │
│                                  │
│ Retry On Fail        [  toggle]  │
│ Continue On Fail     [  toggle]  │
│ Always Output Data   [  toggle]  │
│ Execute Once         [  toggle]  │
│                                  │
└──────────────────────────────────┘
```

### Input Tab
```
┌──────────────────────────────────┐
│ Input                            │
│                                  │
│ ┌─ Table ─┐ ┌─ JSON ─┐ ┌Schema┐ │
│                                  │
│ [                                │
│   {                              │
│     "name": "John",             │
│     "email": "john@example.com" │
│   }                              │
│ ]                                │
│                                  │
│ 1 item received                  │
└──────────────────────────────────┘
```

### Output Tab
```
┌──────────────────────────────────┐
│ Output                           │
│                                  │
│ ┌─ Table ─┐ ┌─ JSON ─┐ ┌Schema┐ │
│                                  │
│ [                                │
│   {                              │
│     "status": 200,              │
│     "data": { ... }             │
│   }                              │
│ ]                                │
│                                  │
│ 1 item returned                  │
│                                  │
│ ⚠ No execution data yet.        │
│ Execute the workflow to see      │
│ output data.                     │
└──────────────────────────────────┘
```

## Expression Editor (inline)
```
┌──────────────────────────────────┐
│ URL  [=]                         │
│ ┌──────────────────────────┐     │
│ │ {{ $json.baseUrl }}/api  │     │
│ └──────────────────────────┘     │
│ ┌─ Expression Result ──────┐     │
│ │ https://api.example.com  │     │
│ │ /api                     │     │
│ └──────────────────────────┘     │
│ Available data:                  │
│  $json.name                      │
│  $json.email                     │
│  $vars.API_URL                   │
│  $workflow.name                  │
└──────────────────────────────────┘
```

## n8n.com Comparison
- Panel layout matches n8n.com exactly: right-side slide-in panel
- Same 4 tabs: Parameters, Settings, Input, Output
- Same expression editor with {{ }} syntax and autocomplete
- Same credential selector with "Create New" option
- Same collapsible sections for query params, headers, body
- Data views match: Table, JSON, and Schema sub-tabs for Input/Output
