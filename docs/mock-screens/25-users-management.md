# Screen 25: Users Management

## Phase: 2 (Enterprise/Paid — User management API is Enterprise feature)

## Description
Manage user accounts, invite new users, and assign global roles.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > Users                       🔒 Enterprise    │
│  n8n │                                                         │
│ ──── │  ┌──────────────────┐                                   │
│      │  │ + Invite User    │                                   │
│ Sett │  └──────────────────┘                                   │
│ ings │                                                         │
│      │  ┌──────────────────────────────────────────────────┐   │
│ ├ Use│  │  Name          Email              Role    Actions│   │
│ │ rs │  ├──────────────────────────────────────────────────┤   │
│      │  │  John Doe      john@example.com   Owner   [⋯]   │   │
│      │  │  Jane Smith    jane@example.com   Admin   [⋯]   │   │
│      │  │  Bob Wilson    bob@example.com    Member  [⋯]   │   │
│      │  │  Alice Chen    alice@example.com  Member  [⋯]   │   │
│      │  └──────────────────────────────────────────────────┘   │
│      │                                                         │
│      │  Allow manual login  [  ● toggle on  ]                  │
└──────┴──────────────────────────────────────────────────────────┘
```

## Invite User Modal

```
┌──────────────────────────────────────────────────┐
│ Invite User                               [✕]   │
│                                                  │
│ Email                                            │
│ ┌──────────────────────────────────────────┐     │
│ │ newuser@example.com                      │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ Role                                             │
│ ┌──────────────────────────────────────────┐     │
│ │ global:member                         ▼  │     │
│ └──────────────────────────────────────────┘     │
│ Options: global:owner, global:admin, global:member│
│                                                  │
│ ┌──────────────────────────────────────────┐     │
│ │              Send Invite                 │     │
│ └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Settings > Users page
- Same user table with name, email, role
- Same invite flow with email and role selection
- Same role options: global:owner, global:admin, global:member
