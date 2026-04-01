# Screen 19: Code Node Editor

## Phase: 1 (Free Community Edition)

## Description
Code editor within the Code node's configuration panel. Supports JavaScript and Python with syntax highlighting, line numbers, and output display.

## ASCII Wireframe

```
┌──────────────────────────────────────────────────┐
│ Code                                      [✕]    │
│                                                  │
│ ┌──────┐┌────────┐┌─────┐┌──────┐               │
│ │Params││Settings ││Input││Output│               │
│ └──────┘└────────┘└─────┘└──────┘               │
│ ═══════                                          │
│                                                  │
│ Language: [JavaScript ▼] [Python]                │
│                                                  │
│ Mode: [Run Once for All Items ▼]                 │
│                                                  │
│ ┌─ Code Editor ──────────────────────────────┐   │
│ │  1 │ // Process all items                  │   │
│ │  2 │ for (const item of $input.all()) {    │   │
│ │  3 │   item.json.processed = true;         │   │
│ │  4 │   item.json.timestamp =               │   │
│ │  5 │     new Date().toISOString();         │   │
│ │  6 │ }                                     │   │
│ │  7 │                                       │   │
│ │  8 │ return $input.all();                  │   │
│ │  9 │                                       │   │
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ┌─ Output ───────────────────────────────────┐   │
│ │ [                                          │   │
│ │   {                                        │   │
│ │     "processed": true,                     │   │
│ │     "timestamp": "2026-04-01T09:30:00Z"   │   │
│ │   }                                        │   │
│ │ ]                                          │   │
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ── Or on error: ──                               │
│ ┌─ Error ────────────────────────────────────┐   │
│ │ ❌ ReferenceError: foo is not defined      │   │
│ │    at line 3, column 5                     │   │
│ └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Code node editor exactly
- Same language toggle (JavaScript/Python)
- Same mode selector (Run Once for All Items / Run Once for Each Item)
- Same Monaco-based code editor with syntax highlighting and line numbers
- Same output/error display below the editor
- Available data references ($input, $json, $node, etc.) match n8n
