# Screen 24: Projects Management

## Phase: 2 (Enterprise/Paid — "Projects" excluded from Community Edition)

## Description
Organize workflows and credentials into projects with role-based access control.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Projects                               🔒 Enterprise    │
│  n8n │                                                         │
│ ──── │  ┌──────────────────┐                                   │
│      │  │ + Create Project │                                   │
│ Proj │  └──────────────────┘                                   │
│ ects │                                                         │
│      │  ┌──────────────────────────────────────────────────┐   │
│      │  │  📁 Marketing Automation                         │   │
│      │  │     5 workflows  |  3 credentials  |  2 members  │   │
│      │  ├──────────────────────────────────────────────────┤   │
│      │  │  📁 DevOps Monitoring                            │   │
│      │  │     8 workflows  |  5 credentials  |  4 members  │   │
│      │  ├──────────────────────────────────────────────────┤   │
│      │  │  📁 Sales Pipeline                               │   │
│      │  │     3 workflows  |  2 credentials  |  1 member   │   │
│      │  └──────────────────────────────────────────────────┘   │
└──────┴──────────────────────────────────────────────────────────┘
```

## Project Detail View

```
┌──────────────────────────────────────────────────────────┐
│ Marketing Automation                      [⚙️ Settings]  │
│                                                          │
│ ┌──────────┐ ┌──────────┐                                │
│ │Workflows │ │Credentials│                               │
│ └──────────┘ └──────────┘                                │
│ ═══════════                                              │
│                                                          │
│ ┌──────────────────────────────────────────────────┐     │
│ │  Email Campaign     🟢 Active    [email]         │     │
│ │  Lead Scoring       🔴 Inactive  [leads]         │     │
│ │  Newsletter Send    🟢 Active    [newsletter]    │     │
│ └──────────────────────────────────────────────────┘     │
│                                                          │
│ Members:                                                 │
│  👤 John (project:admin)                                 │
│  👤 Jane (project:editor)                                │
└──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Projects feature
- Same project list with workflow/credential counts
- Same role-based access: project:admin, project:editor, project:viewer
- Requires Enterprise plan on n8n.com
