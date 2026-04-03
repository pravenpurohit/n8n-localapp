# Feature Gap Analysis — n8n App vs n8n.com

Comparison of our local app against the real n8n editor features.

## Legend
- ✅ Implemented and working
- ⚠️ Partially implemented
- ❌ Not implemented
- 🔒 Phase 2/3 (intentionally deferred)

---

## Canvas Editor

| Feature | Status | Notes |
|---------|--------|-------|
| Drag-and-drop nodes | ✅ | Via Svelte Flow |
| Node connections (edges) | ✅ | Main + AI connection types |
| Custom node rendering (3 types) | ✅ | CustomNode, TriggerNode, ClusterNode |
| Zoom/pan/fit controls | ✅ | CanvasControls component |
| Node selector panel | ✅ | Search + categories |
| Sticky notes | ✅ | Editable text annotations |
| Dotted grid background | ✅ | Via Svelte Flow Background |
| Execute workflow | ✅ | Via internal REST API |
| Execution status on nodes | ✅ | Green ✓ / Red ✗ / Running ⟳ |
| **Minimap** | ❌ | n8n has a minimap for large workflows |
| **Undo/Redo** | ❌ | Keyboard shortcuts registered but no state history |
| **Copy/Paste nodes** | ❌ | Shortcuts registered but no clipboard logic |
| **Duplicate node** | ❌ | Ctrl+D registered but not implemented |
| **Select all** | ❌ | Ctrl+A registered but not implemented |
| **Execute single node** | ❌ | n8n can run just one node, not the whole workflow |
| **Pin data / mock data** | ❌ | n8n lets you pin output data for testing |
| **Drag node from selector to canvas** | ❌ | Click adds to center; no drag-to-position |
| **Node disable/enable toggle** | ⚠️ | Data stored but no UI toggle button |
| **Autosave** | ❌ | n8n autosaves every 2 seconds |
| **Command palette (Ctrl+K)** | ❌ | n8n has a command palette for quick actions |

## Node Configuration Panel

| Feature | Status | Notes |
|---------|--------|-------|
| Parameters tab (dynamic form) | ✅ | Renders based on node registry |
| Settings tab (retry, continue on fail) | ✅ | 4 toggles |
| Input/Output tabs | ⚠️ | Shows data after execution, but only JSON — no Schema/Table view |
| Expression editor | ✅ | Basic autocomplete |
| Code editor | ✅ | Textarea with line numbers |
| **Schema view** | ❌ | n8n shows output as a navigable schema tree |
| **Table view** | ❌ | n8n shows output as a spreadsheet-like table |
| **Binary data tab** | ❌ | n8n shows binary files (PDFs, images) with preview |
| **File upload for binary input** | ❌ | No file picker in parameter forms |
| **Collection/FixedCollection editors** | ❌ | Expandable field groups not rendered |
| **Credential selector dropdown** | ❌ | No way to pick existing credentials in node config |
| **Expression mode toggle per field** | ❌ | Can't switch between fixed value and expression |
| **Live expression preview** | ❌ | No resolved value preview |
| **Conditional field visibility** | ⚠️ | displayOptions.show implemented but not tested |

## Execution & Debugging

| Feature | Status | Notes |
|---------|--------|-------|
| Execute full workflow | ✅ | Via internal REST API |
| Execution polling with status | ✅ | Exponential backoff |
| Execution history (global) | ✅ | Executions page with filters |
| Execution history (per-workflow) | ✅ | Executions tab on canvas page |
| Error notifications | ✅ | Classified by error type |
| **Execute single node** | ❌ | n8n can test individual nodes |
| **Step-through execution** | ❌ | n8n can pause between nodes |
| **Execution data overlay on canvas** | ❌ | n8n shows I/O data inline on each node |
| **Copy to Editor from past execution** | ❌ | Req 6 AC#3 — not implemented |
| **Re-run past execution** | ❌ | Req 6 AC#4 — not implemented |
| **Debug in Editor** | ❌ | n8n can pin failed execution data for debugging |
| **Execution retry** | ⚠️ | API function exists but no UI button on canvas |

## Workflow Management

| Feature | Status | Notes |
|---------|--------|-------|
| List workflows | ✅ | With search and tag filter |
| Create new workflow | ✅ | Empty canvas with "Add first step" |
| Save workflow | ✅ | With optimistic concurrency (versionId) |
| Delete workflow | ⚠️ | API function exists, no UI confirmation in overview |
| Activate/Deactivate | ✅ | Toggle in TopBar |
| Import JSON | ✅ | Via ImportExport modal |
| Export JSON | ✅ | Download as file |
| Workflow settings modal | ✅ | Execution order, error workflow, timeouts |
| Tags | ✅ | CRUD + filter |
| **Workflow sharing** | 🔒 | Phase 2 stub |
| **Workflow history/versions** | 🔒 | Phase 2 stub |
| **Workflow notes/description** | ❌ | n8n has a workflow description field |
| **Bulk operations** | ❌ | n8n can bulk delete/activate workflows |

## Data Display

| Feature | Status | Notes |
|---------|--------|-------|
| JSON view of node output | ✅ | In I/O tabs |
| **Schema view** | ❌ | Tree-structured view of output fields |
| **Table view** | ❌ | Spreadsheet-like view of output items |
| **Binary data preview** | ❌ | Image/PDF/file preview |
| **Data pinning** | ❌ | Pin output for testing without re-executing |
| **Output item count** | ❌ | n8n shows "3 items" badge on each node |
| **Inline data preview on canvas** | ❌ | n8n shows small data preview on node hover |

## Other Pages

| Feature | Status | Notes |
|---------|--------|-------|
| Overview with tabs | ✅ | Workflows, Credentials, Executions |
| Credentials list | ✅ | With create form |
| Templates browser | ⚠️ | Fetches from n8n.io but crashes in test browser |
| Data tables | ✅ | List + row editor |
| Settings (theme, connection, tags, audit) | ✅ | All working |
| Phase 2 enterprise stubs | ✅ | 12 placeholder pages |
| **Credential test connection** | ❌ | Button exists in form but not wired |
| **Credential edit mode** | ❌ | Can create but not edit existing credentials |
| **Credential delete** | ❌ | No delete button in UI |

---

## Priority Recommendations

### Must-have for usable product (P0)
1. **Schema/Table view for node output** — Users need to see execution results in a readable format, not just raw JSON
2. **Execute single node** — Essential for debugging; running the whole workflow every time is impractical
3. **Credential selector in node config** — Without this, users can't assign credentials to nodes from the app
4. **Collection/FixedCollection parameter editors** — Many n8n nodes use these; without them, complex nodes are unconfigurable

### Important for workflow development (P1)
5. **Undo/Redo with state history** — Currently registered as shortcuts but no implementation
6. **Copy/Paste/Duplicate nodes** — Same — shortcuts exist but no logic
7. **Pin data for testing** — Critical for iterative workflow development
8. **Expression mode toggle** — Can't switch between fixed values and expressions
9. **Minimap** — Svelte Flow supports this natively, just needs to be added

### Nice-to-have (P2)
10. **Autosave** — n8n autosaves every 2s
11. **Command palette** — Quick access to actions
12. **Inline data preview on canvas** — Shows output count/preview on nodes
13. **Drag-to-position from node selector** — Currently click-to-add-at-center only
14. **Workflow description field** — Metadata for documentation
