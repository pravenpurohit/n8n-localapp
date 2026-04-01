# Screen 27: SAML/SSO Settings

## Phase: 2 (Enterprise/Paid — "SSO (SAML, LDAP)" excluded from Community Edition)

## Description
Configure SAML-based Single Sign-On for the n8n instance.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Settings > SSO                         🔒 Enterprise    │
│  n8n │                                                         │
│ ──── │  Enable SSO  [  ○ toggle off ]                          │
│      │                                                         │
│ Sett │  ┌─ n8n Service Provider Info ────────────────────┐     │
│ ings │  │                                                │     │
│      │  │  Redirect URL                                  │     │
│ ├ SAM│  │  https://localhost:5678/rest/sso/saml/acs [📋] │     │
│ │ L  │  │                                                │     │
│      │  │  Entity ID                                     │     │
│      │  │  https://localhost:5678                   [📋] │     │
│      │  └────────────────────────────────────────────────┘     │
│      │                                                         │
│      │  ┌─ Identity Provider Configuration ──────────────┐     │
│      │  │                                                │     │
│      │  │  IdP Metadata URL                              │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ https://idp.example.com/metadata     │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  — Or paste XML metadata: —                    │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │ <EntityDescriptor ...>               │      │     │
│      │  │  │   ...                                │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  │                                                │     │
│      │  │  ┌──────────────────────────────────────┐      │     │
│      │  │  │              Save                    │      │     │
│      │  │  └──────────────────────────────────────┘      │     │
│      │  └────────────────────────────────────────────────┘     │
└──────┴──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Settings > SSO page
- Same Redirect URL and Entity ID display
- Same IdP metadata URL or XML input options
