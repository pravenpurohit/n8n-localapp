# Screen 15: Workflow Import/Export

## Phase: 1 (Free Community Edition)

## Description
Import and export workflows as JSON files. Export is available from the workflow's three-dot menu. Import is available from the Overview page.

## ASCII Wireframe — Export (from workflow menu)

```
┌──────────────────────────────────────────────────┐
│ ⋯ Workflow Menu                                  │
│ ├─────────────────────────────────────────────┐  │
│ │  Settings                                   │  │
│ │  Duplicate                                  │  │
│ │  ──────────────────────────────────────     │  │
│ │  📥 Import from File...                     │  │
│ │  📤 Export as JSON                          │  │
│ │  📤 Export as URL                           │  │
│ │  ──────────────────────────────────────     │  │
│ │  🗑 Delete                                  │  │
│ └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

## Import Dialog

```
┌──────────────────────────────────────────────────┐
│ Import Workflow                            [✕]   │
│                                                  │
│ ┌────────────────────────────────────────────┐   │
│ │                                            │   │
│ │     📁 Drop a JSON file here               │   │
│ │        or click to browse                  │   │
│ │                                            │   │
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ── Or paste JSON: ──                             │
│ ┌────────────────────────────────────────────┐   │
│ │ {                                          │   │
│ │   "name": "My Workflow",                   │   │
│ │   "nodes": [...],                          │   │
│ │   "connections": {...}                     │   │
│ │ }                                          │   │
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ┌──────────────────────────────────────────┐     │
│ │              Import                      │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ ✅ Workflow "My Workflow" imported successfully!  │
│ ❌ Invalid JSON: missing "nodes" property        │
└──────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's import/export functionality
- Same JSON format for workflow definitions
- n8n.com supports import via file upload and URL — we support both
- Same validation of JSON structure before import
