# Screen 33: AI Assistant Panel

## Phase: 2 (Enterprise/Paid — AI Assistant is a paid Cloud/Enterprise feature)

## Description
Right-side chat panel for getting AI-powered help with workflow building and troubleshooting. Accessed from the "Ask Assistant" button on the canvas.

## ASCII Wireframe

```
┌─────────────────────────┬──────────────────────────────────┐
│                         │ 🤖 AI Assistant           [✕]    │
│   Canvas Area           │                                  │
│                         │ ┌────────────────────────────┐   │
│                         │ │ 👤 How do I send an email  │   │
│                         │ │    when a webhook is       │   │
│                         │ │    triggered?              │   │
│                         │ └────────────────────────────┘   │
│                         │                                  │
│                         │ ┌────────────────────────────┐   │
│                         │ │ 🤖 To send an email when   │   │
│                         │ │ a webhook fires:           │   │
│                         │ │                            │   │
│                         │ │ 1. Add a Webhook trigger   │   │
│                         │ │ 2. Connect it to a Send    │   │
│                         │ │    Email node              │   │
│                         │ │ 3. Configure the email     │   │
│                         │ │    node with recipient,    │   │
│                         │ │    subject, and body       │   │
│                         │ │                            │   │
│                         │ │ You can use expressions    │   │
│                         │ │ like {{ $json.email }}     │   │
│                         │ │ to reference webhook data. │   │
│                         │ └────────────────────────────┘   │
│                         │                                  │
│                         │ ┌────────────────────────────┐   │
│                         │ │ Ask a question...      [➤] │   │
│                         │ └────────────────────────────┘   │
└─────────────────────────┴──────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's "Ask Assistant" panel
- Same right-side chat interface
- Same conversational Q&A format
- n8n.com's AI Assistant is powered by their backend — our app would need to proxy through the n8n instance or use a local LLM
- Available on paid Cloud plans and Enterprise
