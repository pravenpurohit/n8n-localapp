# Screen 32: Sharing Dialog

## Phase: 2 (Enterprise/Paid — "Sharing (workflows, credentials)" excluded from Community Edition)

## Description
Share workflows with other users and assign role-based permissions. Accessed from the Share button in the Canvas editor top bar.

## ASCII Wireframe

```
┌──────────────────────────────────────────────────┐
│ Share "My Workflow"                        [✕]   │
│                                                  │
│ ┌──────────────────────────────────────────┐     │
│ │ 🔍 Add people by name or email...       │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ ┌─ People with access ──────────────────────┐    │
│ │                                           │    │
│ │  👤 John Doe (you)                        │    │
│ │     Owner                                 │    │
│ │                                           │    │
│ │  👤 Jane Smith              [Editor  ▼]   │    │
│ │     jane@example.com        [Remove]      │    │
│ │                                           │    │
│ │  👤 Bob Wilson              [Viewer  ▼]   │    │
│ │     bob@example.com         [Remove]      │    │
│ │                                           │    │
│ └───────────────────────────────────────────┘    │
│                                                  │
│ ┌──────────────────────────────────────────┐     │
│ │              Save                        │     │
│ └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's sharing dialog
- Same people search and role assignment
- Same role options: Editor, Viewer
- Requires Starter plan minimum on n8n.com
