# n8n Local App

A local desktop application for n8n workflow automation, built with Tauri 2 + Svelte 5 + Svelte Flow. Connects to a self-hosted n8n instance via API key — no cloud subscription required.

## Setup

1. Copy `.env.example` to `.env` and add your n8n API key
2. Start your local n8n instance: `npx n8n`
3. `npm install`
4. `npm run tauri dev`

## Project Structure

```
├── .env.example          # Environment config template
├── .kiro/specs/          # Requirements and spec documents
├── docs/                 # Project documentation
│   ├── TECH_STACK.md     # Technology stack decisions
│   ├── mock-screens/     # ASCII wireframe mockups (33 screens)
│   └── mega-review-results.md
├── src/                  # Application source (Svelte + TypeScript)
│   ├── lib/              # Shared modules
│   │   ├── api/          # n8n API client
│   │   ├── stores/       # Svelte state stores
│   │   ├── components/   # Reusable UI components
│   │   └── utils/        # Parsers, formatters, helpers
│   └── routes/           # SvelteKit pages
├── src-tauri/            # Tauri Rust backend
├── test-data/            # Test fixtures
│   ├── workflows/        # n8n workflow JSON files
│   └── baselines/        # Visual test baseline screenshots
└── tests/                # Test suites
    ├── unit/             # Vitest unit tests
    └── e2e/              # Playwright visual/E2E tests
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start SvelteKit dev server |
| `npm run tauri dev` | Start Tauri desktop app (dev) |
| `npm run tauri build` | Build distributable desktop app |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:visual` | Run visual E2E tests (Playwright) |
| `npm run test:update-baselines` | Update visual test baselines |
