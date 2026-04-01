# Screen 21: Error and Offline States

## Phase: 1 (Free Community Edition)

## Description
Error states shown when the n8n instance is unreachable or the API key is invalid.

## Connection Lost Banner

```
┌──────────────────────────────────────────────────────────┐
│ ┌─ Connection Lost ─────────────────────────────────┐    │
│ │ ⚠️  Cannot reach n8n at localhost:5678             │    │
│ │    Retrying in 8s...                [Retry Now]   │    │
│ └───────────────────────────────────────────────────┘    │
│                                                          │
│  (app continues in read-only mode with cached data)      │
└──────────────────────────────────────────────────────────┘
```

## API Error Toast

```
┌──────────────────────────────────────────────────┐
│ ❌ API Error: 500 Internal Server Error   [✕]    │
│ Failed to save workflow "My Workflow"            │
│ [Retry]  [Dismiss]                               │
└──────────────────────────────────────────────────┘
```

## Invalid API Key

```
┌──────────────────────────────────────────────────┐
│ 🔒 401 Unauthorized                              │
│ Your API key is invalid. Check your .env file.   │
│ [Open .env.example]                              │
└──────────────────────────────────────────────────┘
```

## n8n.com Comparison
- These states are unique to the local app (n8n.com is the server itself)
- Toast notification style matches n8n's general notification pattern
