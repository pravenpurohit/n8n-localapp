# Screen 17: Left Sidebar Navigation

## Phase: 1 (Free Community Edition)

## Description
Persistent left sidebar on all screens. Collapsible to icon-only mode.

## ASCII Wireframe — Expanded

```
┌──────────────────────┐
│  n8n Local App       │
│  localhost:5678  ✅   │
│  ─────────────────── │
│  📊 Overview         │
│  ─────────────────── │
│  📁 Workflows        │
│  🔑 Credentials      │
│  📋 Templates        │
│  📊 Data Tables      │
│  ─────────────────── │
│  📂 Projects    🔒   │
│  📊 Variables   🔒   │
│  📈 Insights    🔒   │
│  ─────────────────── │
│                      │
│  ─────────────────── │
│  ⚙️  Settings        │
│  ◀ Collapse          │
└──────────────────────┘
```

## Navigation Items

| Icon | Label | Phase |
|------|-------|-------|
| 📊 | Overview | 1 |
| 📁 | Workflows | 1 |
| 🔑 | Credentials | 1 |
| 📋 | Templates | 1 |
| 📊 | Data Tables | 1 |
| 📂 | Projects | 2 (🔒) |
| 📊 | Variables | 2 (🔒) |
| 📈 | Insights | 2 (🔒) |
| ⚙️ | Settings | 1 (theme, connection status) |

## n8n.com Comparison
- Matches n8n's sidebar layout
- 🔒 badge on Enterprise-only items is unique to our app
- No "Admin Panel" (that's Cloud-only on n8n.com)
