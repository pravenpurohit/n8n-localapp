# Screen 07: Credentials Management

## Phase: 1 (Free Community Edition)

## Description
Lists all credentials stored in the n8n instance. Allows creating, editing, testing, and deleting credentials. Accessible from the sidebar or Overview > Credentials tab.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Credentials                                             │
│  n8n │                                                         │
│ ──── │  ┌─────────────────┐              ┌──────────────────┐  │
│      │  │ 🔍 Search...    │              │ + Add Credential │  │
│ Over │  └─────────────────┘              └──────────────────┘  │
│ view │                                                         │
│      │  ┌──────────────────────────────────────────────────┐   │
│ Work │  │  Name                  Type            Created   │   │
│ flows│  ├──────────────────────────────────────────────────┤   │
│      │  │  My GitHub API         GitHub API      Jan 15    │   │
│ Cred │  │  Slack OAuth           Slack OAuth2    Feb 3     │   │
│ entia│  │  Notion API Key        Notion API      Feb 10    │   │
│ ls   │  │  SMTP Credentials      SMTP            Mar 1     │   │
│      │  │  OpenAI API            OpenAI API      Mar 15    │   │
│ ──── │  └──────────────────────────────────────────────────┘   │
│ Sett │                                                         │
│ ings │                                                         │
└──────┴──────────────────────────────────────────────────────────┘
```

## Create/Edit Credential Modal

```
┌──────────────────────────────────────────────────┐
│ Create New Credential                     [✕]    │
│                                                  │
│ Credential Type                                  │
│ ┌──────────────────────────────────────────┐     │
│ │ 🔍 Search credential types...           │     │
│ ├──────────────────────────────────────────┤     │
│ │  GitHub API                              │     │
│ │  Slack OAuth2 API                        │     │
│ │  Notion API                              │     │
│ │  HTTP Basic Auth                         │     │
│ │  HTTP Header Auth                        │     │
│ │  OpenAI API                              │     │
│ │  Google OAuth2 API                       │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ ── After selecting type: ──                      │
│                                                  │
│ Name                                             │
│ ┌──────────────────────────────────────────┐     │
│ │ My GitHub API                            │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ Access Token                                     │
│ ┌──────────────────────────────────────────┐     │
│ │ ghp_••••••••••••••••••••  👁              │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ ┌──────────────┐  ┌──────────────────────┐       │
│ │ Test         │  │ Save                 │       │
│ │ Connection   │  │                      │       │
│ └──────────────┘  └──────────────────────┘       │
│                                                  │
│ ✅ Connection tested successfully!               │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Interactions
- Search filters credentials by name
- Clicking a credential row opens the edit modal
- "Add Credential" opens the create modal with type selector
- Type selector fetches available types from GET /credentials/schema/{type}
- "Test Connection" validates via the n8n API
- Delete shows confirmation dialog

## n8n.com Comparison
- Matches n8n's credentials page layout
- Same searchable type selector when creating
- Same "Test Connection" functionality
- n8n.com shows credential sharing options — we omit this in Phase 1 (Enterprise feature)
- n8n.com shows "Transfer" to move between projects — we include this but it requires Projects (Phase 2)
