# n8n Local App

A desktop application for n8n workflow automation, built with Tauri 2 + Svelte 5 + Svelte Flow. Connects to a self-hosted n8n instance via API key.

## Setup

```bash
cp .env.example .env          # Add N8N_BASE_URL, N8N_API_KEY, LLM keys
npm install
npx playwright install chromium
npx n8n                        # Start n8n on localhost:5678
npm run tauri dev              # Launch the desktop app
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | SvelteKit dev server (localhost:5173) |
| `npm run tauri dev` | Tauri desktop app (dev mode) |
| `npm run tauri build` | Build distributable desktop app |
| `npm test` | Unit tests — 58 tests (Vitest) |
| `npm run test:visual` | E2E visual tests — headed (Playwright) |
| `npm run generate-llm-variants` | Regenerate LLM workflow variants |
| `npm run update-node-registry` | Fetch node types from n8n instance |

## Project Structure

```
src/lib/          — API client, stores, components, core logic, types, utils
src/routes/       — SvelteKit pages (20+ routes)
src-tauri/        — Rust backend (HTTP proxy, .env reader, filesystem)
tests/e2e/        — Playwright E2E tests (6 spec files)
test-data/        — 10 workflow files, 8 sample prompts, fixtures
docs/             — PROJECT_CONTEXT, TECH_STACK, mock-screens
```

## Documentation

- [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) — Architecture, test data, how to run E2E tests
- [docs/TECH_STACK.md](docs/TECH_STACK.md) — Technology stack rationale
- [docs/mock-screens/](docs/mock-screens/) — 33 ASCII wireframe mockups
- [.kiro/specs/local-n8n-app/](.kiro/specs/local-n8n-app/) — Requirements, design, task list
