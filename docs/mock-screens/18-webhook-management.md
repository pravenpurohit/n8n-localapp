# Screen 18: Webhook Management

## Phase: 1 (Free Community Edition)

## Description
Webhook URLs are displayed within the Webhook Trigger node's configuration panel. Shows test and production URLs with copy-to-clipboard functionality.

## ASCII Wireframe (inside Node Config Panel)

```
┌──────────────────────────────────────────────────┐
│ Webhook                                   [✕]    │
│                                                  │
│ ┌──────┐┌────────┐┌─────┐┌──────┐               │
│ │Params││Settings ││Input││Output│               │
│ └──────┘└────────┘└─────┘└──────┘               │
│ ═══════                                          │
│                                                  │
│ Webhook URLs                                     │
│ ┌────────────────────────────────────────────┐   │
│ │ Test URL:                                  │   │
│ │ http://localhost:5678/webhook-test/abc123   │   │
│ │                                    [📋]    │   │
│ ├────────────────────────────────────────────┤   │
│ │ Production URL:                            │   │
│ │ http://localhost:5678/webhook/abc123        │   │
│ │                                    [📋]    │   │
│ └────────────────────────────────────────────┘   │
│                                                  │
│ HTTP Method                                      │
│ ┌──────────────────────────────────────────┐     │
│ │ POST                                  ▼  │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ Path                                             │
│ ┌──────────────────────────────────────────┐     │
│ │ /my-webhook                              │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ Authentication                                   │
│ ┌──────────────────────────────────────────┐     │
│ │ None                                  ▼  │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
│ Response Mode                                    │
│ ┌──────────────────────────────────────────┐     │
│ │ When Last Node Finishes              ▼   │     │
│ └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Webhook node configuration exactly
- Same test vs production URL display
- Same HTTP method, path, authentication, and response mode options
- Same copy-to-clipboard buttons
