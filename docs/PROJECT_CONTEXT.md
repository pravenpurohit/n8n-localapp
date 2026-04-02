# Project Context — Local n8n App

## What This Is

A desktop application that replicates the n8n.com workflow automation UI. It connects to a self-hosted n8n instance via API key and provides a visual workflow editor, execution management, credential management, and all supporting features — without needing a browser or cloud subscription.

Built with Tauri 2 (Rust backend + system webview), Svelte 5 with SvelteKit, Svelte Flow for the canvas, and Tailwind CSS 4.

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Tauri 2 Desktop App                 │
│  ┌───────────────────────────────────────────┐  │
│  │          System WebView (WebKit)           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │     SvelteKit Static SPA            │  │  │
│  │  │  Svelte Flow canvas + UI pages      │  │  │
│  │  │  Svelte 5 rune-based stores         │  │  │
│  │  │  API client (via Tauri invoke)      │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │           Rust Backend                     │  │
│  │  HTTP proxy (bypasses CORS, URL allowlist) │  │
│  │  .env config reader                        │  │
│  │  Filesystem (debug.log, file export)       │  │
│  └───────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │ HTTP (localhost)
                   ▼
┌─────────────────────────────────────────────────┐
│         n8n Instance (localhost:5678)             │
│         Public API: /api/v1/*                    │
│         Internal API: /rest/*                    │
└─────────────────────────────────────────────────┘
```

All HTTP requests to n8n go through the Rust backend, which validates URLs against an allowlist and injects the API key. The frontend never holds the API key directly. Templates (n8n.io public API) use direct `fetch()` since they don't need auth.

## Directory Structure

```
src/
├── lib/
│   ├── api/              # API client + 7 domain modules (workflows, executions,
│   │                     #   credentials, tags, data-tables, templates, audit)
│   ├── core/             # Business logic (workflow parser, expression parser,
│   │                     #   node registry, connection resolver, logger)
│   ├── stores/           # 11 Svelte 5 rune-based stores (app, canvas, connection,
│   │                     #   workflows, executions, credentials, tags, data-tables,
│   │                     #   theme, node-panel) + flow-mapping utility
│   ├── components/
│   │   ├── canvas/       # Svelte Flow: WorkflowCanvas, CustomNode, TriggerNode,
│   │   │                 #   ClusterNode, CustomEdge, StickyNote, NodeSelector, Controls
│   │   ├── common/       # SearchInput, StatusBadge, TagPill, LoadMore, ConfirmDialog,
│   │   │                 #   ErrorNotification, ConnectionBanner, DataTable, EnterpriseStub
│   │   ├── layout/       # Shell, Sidebar, TopBar
│   │   ├── modals/       # WorkflowSettings, ImportExport, CredentialForm
│   │   └── panels/       # NodeConfigPanel, ParametersTab, SettingsTab,
│   │                     #   InputOutputTab, ExpressionEditor, CodeEditor
│   ├── types/            # TypeScript interfaces (workflow, execution, credential,
│   │                     #   node-registry, api)
│   └── utils/            # Pagination helper, workflow name cache, date/number formatting
├── routes/               # SvelteKit pages
│   ├── overview/         # Home page with workflows/credentials/executions tabs
│   ├── workflows/[id]/   # Canvas editor for existing workflow
│   ├── workflows/new/    # New workflow canvas
│   ├── executions/       # Global executions list with filters
│   ├── credentials/      # Credentials management
│   ├── templates/        # n8n.io template browser
│   ├── data-tables/      # Data tables list + [id] row editor
│   ├── settings/         # Preferences, connection, tags, audit + Phase 2 stubs
│   ├── insights/         # Phase 2 stub
│   ├── projects/         # Phase 2 stub
│   └── error/            # .env configuration error screen
└── static/
    └── node-registry.json  # Bundled node type definitions (10 types)

src-tauri/
├── src/
│   ├── main.rs           # Entry point
│   ├── lib.rs            # Command registration + AllowedBaseUrl state
│   └── commands/
│       ├── http.rs       # HTTP proxy with URL allowlist
│       ├── env.rs        # .env config reader
│       └── fs.rs         # Filesystem (log, read, write with path validation)
├── Cargo.toml
└── capabilities/default.json

scripts/
└── update-node-registry.ts  # Fetches node types from running n8n instance

test-data/
└── workflows/            # 4 test workflow JSON files (orchestrator, AI compiler,
                          #   step executor, graph runner)

docs/
├── PROJECT_CONTEXT.md    # This file
├── TECH_STACK.md         # Technology stack decisions and rationale
└── mock-screens/         # 33 ASCII wireframe mockups of all screens
```

## Requirements & Spec

The full spec lives in `.kiro/specs/local-n8n-app/`:
- `requirements.md` — 46 requirements across 3 phases
- `design.md` — Full technical design (architecture, components, data models, API design)
- `tasks.md` — Implementation task list (27 top-level tasks, all Phase 1 required tasks complete)

### Phase 1 (implemented): Core features using n8n public API
Workflow CRUD, canvas editor with Svelte Flow, execution management, credentials, templates, data tables, tags, settings, theme, error handling, offline detection.

### Phase 2 (stubs): Enterprise features requiring license
Variables, Insights, Projects, Users, LDAP, SAML/SSO, Log Streaming, External Secrets, Source Control, Workflow History, Sharing, AI Assistant. All render as "Enterprise feature" placeholder pages.

### Phase 3 (deferred): Features requiring internal REST API session auth
User profile, API key management, community nodes.

## Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| API proxy | Tauri Rust commands | Bypasses CORS; API key never in webview JS |
| State | Svelte 5 runes ($state, $derived) | No external state lib needed |
| Canvas | @xyflow/svelte (Svelte Flow) | Native Svelte 5; same engine as React Flow |
| Styling | Tailwind CSS 4 | Utility-first; dark/light themes via `dark:` class |
| Node registry | Bundled static JSON + runtime fetch | Works offline; updatable via script |
| Templates API | Direct fetch (not Rust proxy) | Public API, no auth needed |

## How to Run

```bash
# Prerequisites: Node.js, Rust toolchain, a running n8n instance

# 1. Configure
cp .env.example .env
# Edit .env with your N8N_BASE_URL and N8N_API_KEY

# 2. Install
npm install

# 3. Start n8n (if not already running)
npx n8n

# 4. Run the app
npm run tauri dev

# 5. Run tests
npm test              # 58 unit tests (Vitest)
npm run test:visual   # E2E visual tests (Playwright)
```

## Testing

58 unit tests cover the core modules:
- Workflow parser (parse, serialize, validation, edge cases)
- Expression parser (all 6 expression types, recursive extraction)
- Connection resolver (validation, type detection, AI connection types)
- API client (header construction, error handling, pagination)
- Logger (level filtering, structured output)
- Format utilities (relative time, absolute time, duration)

Tests use a mock Tauri invoke setup (`src/lib/test/setup.ts`) that intercepts `@tauri-apps/api/core` calls.
