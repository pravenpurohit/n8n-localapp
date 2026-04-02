# n8n Local App

A desktop application for n8n workflow automation, built with Tauri 2 + Svelte 5 + Svelte Flow. Connects to a self-hosted n8n instance via API key — no cloud subscription required.

## Setup

1. Copy `.env.example` to `.env` and add your n8n instance URL and API key
2. Start your local n8n instance: `npx n8n`
3. `npm install`
4. `npm run tauri dev`

## Project Structure

```
src/
├── lib/
│   ├── api/            # API client + domain modules
│   ├── core/           # Business logic (parsers, registry, logger)
│   ├── stores/         # Svelte 5 rune-based stores
│   ├── components/     # UI components (canvas, common, layout, panels, modals)
│   ├── types/          # TypeScript interfaces
│   └── utils/          # Pagination, caching, formatting
├── routes/             # SvelteKit pages
└── static/             # Bundled node registry JSON
src-tauri/              # Tauri Rust backend (HTTP proxy, .env reader, filesystem)
test-data/workflows/    # Test workflow JSON files
docs/                   # Project docs, tech stack, mock screens
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start SvelteKit dev server |
| `npm run tauri dev` | Start Tauri desktop app (dev mode) |
| `npm run tauri build` | Build distributable desktop app |
| `npm test` | Run unit tests (Vitest, 58 tests) |
| `npm run test:visual` | Run visual E2E tests (Playwright) |
| `npm run update-node-registry` | Fetch node types from running n8n instance |

## Documentation

- `docs/PROJECT_CONTEXT.md` — Architecture, directory structure, design decisions
- `docs/TECH_STACK.md` — Technology stack rationale
- `docs/mock-screens/` — 33 ASCII wireframe mockups
- `.kiro/specs/local-n8n-app/` — Requirements, design, and task list
