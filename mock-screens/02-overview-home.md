# Screen 02: Overview / Home Page

## Phase: 1 (Free Community Edition)

## Description
The main landing page after login. Shows a tabbed view of all workflows, credentials, and executions. Matches n8n's "Overview" page accessible from the left sidebar.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Overview                                    [user@n8n] │
│  n8n │                                                         │
│      │  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│ ──── │  │Workflows │ │Credentials│ │Executions│                │
│      │  └──────────┘ └──────────┘ └──────────┘                │
│ Over │  ═══════════                                            │
│ view │                                                         │
│      │  ┌─────────────────┐  ┌──────────┐  ┌──────────────┐   │
│ Work │  │ 🔍 Search...    │  │ + Create  │  │ Filter: Tags │   │
│ flows│  └─────────────────┘  │ Workflow  │  │ ▼            │   │
│      │                       └──────────┘  └──────────────┘   │
│ Temp │                                                         │
│ lates│  ┌──────────────────────────────────────────────────┐   │
│      │  │ ☐  Name              Status   Tags    Updated    │   │
│ Cred │  ├──────────────────────────────────────────────────┤   │
│ entia│  │ ☐  Email Notifier    🟢 Active  [email] 2h ago  │   │
│ ls   │  │ ☐  Data Sync         🔴 Inactive [sync] 1d ago  │   │
│      │  │ ☐  Slack Bot         🟢 Active  [bot]  3d ago   │   │
│ Var  │  │ ☐  Report Generator  🔴 Inactive [rpt]  1w ago  │   │
│ iable│  │ ☐  API Monitor       🟢 Active  [api]  2w ago   │   │
│ s    │  ├──────────────────────────────────────────────────┤   │
│      │  │              Showing 5 of 23 workflows           │   │
│ Insi │  │         ◀ 1  2  3  4  5 ▶                       │   │
│ ghts │  └──────────────────────────────────────────────────┘   │
│      │                                                         │
│ Proj │                                                         │
│ ects │                                                         │
│      │                                                         │
│ ──── │                                                         │
│ Sett │                                                         │
│ ings │                                                         │
└──────┴──────────────────────────────────────────────────────────┘
```

## Tabs Detail

### Workflows Tab (default)
| Column | Description |
|--------|-------------|
| Checkbox | Bulk selection for actions |
| Name | Workflow name (clickable → opens Canvas editor) |
| Status | Green dot = Active, Red dot = Inactive |
| Tags | Colored tag pills |
| Updated | Relative timestamp (e.g., "2h ago") |

### Credentials Tab
| Column | Description |
|--------|-------------|
| Name | Credential name |
| Type | Credential type (e.g., "GitHub API", "Slack OAuth") |
| Created | Date created |

### Executions Tab
| Column | Description |
|--------|-------------|
| Workflow | Workflow name |
| Started At | Timestamp |
| Status | Success ✅ / Failed ❌ / Running ⏳ / Waiting ⏸ |
| ID | Execution ID |

## Interactions
- Tab switching loads data from respective API endpoints
- Search filters the current tab's list in real-time
- "Create Workflow" navigates to empty Canvas editor
- Clicking a workflow row opens the Canvas editor for that workflow
- Tag filter dropdown shows all available tags with checkboxes
- Bulk select enables "Delete" and "Activate/Deactivate" actions

## n8n.com Comparison
- Matches n8n's Overview page layout exactly
- n8n.com shows the same three tabs: Workflows, Credentials, Executions
- n8n.com includes a "Personal" project section in sidebar — our app shows all workflows from the connected instance
- Tag filtering and search work identically
