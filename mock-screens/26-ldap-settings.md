# Screen 26: LDAP Settings

## Phase: 2 (Enterprise/Paid — "SSO (SAML, LDAP)" excluded from Community Edition)

## Description
Configure LDAP authentication for the n8n instance.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > LDAP                        🔒 Enterprise    │
│  n8n │                                                         │
│ ──── │  Enable LDAP Login  [  ○ toggle off ]                   │
│      │                                                         │
│ Sett │  ┌─ LDAP Configuration ───────────────────────────┐     │
│ ings │  │                                                │     │
│      │  │  Server URL                                    │     │
│ ├ LDA│  │  ┌──────────────────────────────────────┐      │     │
│ │ P  │  │  │ ldap://ldap.example.com:389          │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  Bind DN                                       │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ cn=admin,dc=example,dc=com           │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  Bind Password                                 │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ ••••••••••                           │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  Base DN                                       │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ dc=example,dc=com                    │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  Search Filter                                 │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ (uid={{username}})                    │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  ┌────────────────┐  ┌──────────────────┐      │     │
│      │  │  │ Test Connection│  │ Save Connection  │      │     │
│      │  │  └────────────────┘  └──────────────────┘      │     │
│      │  │                                                │     │
│      │  │  ▶ Sync Settings                               │     │
│      │  └────────────────────────────────────────────────┘     │
└──────┴──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Settings > LDAP page exactly
- Same fields: server URL, bind DN, bind password, base DN, search filter
- Same test connection and save buttons
- Same sync settings section
