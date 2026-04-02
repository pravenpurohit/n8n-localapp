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

## Directory Structure

```
src/
├── lib/
│   ├── api/              # API client + 7 domain modules
│   ├── core/             # Business logic (parsers, registry, logger)
│   ├── stores/           # 11 Svelte 5 rune-based stores + flow-mapping
│   ├── components/       # canvas/, common/, layout/, modals/, panels/
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Pagination, cache, formatting
├── routes/               # SvelteKit pages (overview, workflows, executions, etc.)
└── static/               # Bundled node registry JSON (14 node types)

src-tauri/src/            # Rust backend (HTTP proxy, .env reader, filesystem)

tests/e2e/                # Playwright E2E tests (6 spec files)
test-data/
├── workflows/            # 10 workflow JSON files (4 base + 6 LLM variants)
└── fixtures/             # 8 sample prompts, step inputs, data table schemas, API key template

scripts/                  # update-node-registry.ts, generate-llm-variants.ts
docs/                     # PROJECT_CONTEXT, TECH_STACK, mock-screens/
```

## Test Data

### Workflow Files (test-data/workflows/)
10 workflow JSON files covering 4 LLM providers:

| Base Workflow | OpenAI | Gemini | Claude | Groq |
|--------------|--------|--------|--------|------|
| W0 Orchestrator | ✓ (no LLM) | — | — | — |
| W1 AI Compiler | ✓ gpt-4o | ✓ gemini-1.5-pro | ✓ claude-sonnet-4 | ✓ llama-3.3-70b |
| W2 Step Executor | ✓ gpt-4o | ✓ gemini-1.5-pro | ✓ claude-sonnet-4 | ✓ llama-3.3-70b |
| W3 Graph Runner | ✓ (no LLM) | — | — | — |

### Sample Prompts (test-data/fixtures/sample-prompts.json)
8 prompts exercising all compilation strategies:

| ID | Strategy | Complexity |
|----|----------|-----------|
| simple-summary | S0 | Trivial single-step |
| code-review | S1 | Single task, prompt improvement |
| research-report | S2 | Sequential multi-section |
| market-analysis | S3 | Fan-out (5 providers) + fan-in |
| minimal-task | S0 | Smoke test |
| full-stress-test | S3 | 10-section monolithic report |
| production-business-diligence | S3 | 4-stage linear pipeline |
| production-business-diligence-6stage | S3 | 6-stage diamond dependency pipeline |

### Other Fixtures
- `sample-step-inputs.json` — Pre-built W2 inputs (bypass W1)
- `expected-data-tables.json` — 3 data table schemas needed by workflows
- `env-keys.example` — API key template for 4 LLM providers

## Testing

### Unit Tests (58 tests, Vitest)
```bash
npm test
```
Covers: workflow parser, expression parser, connection resolver, API client, logger, format utils.

### E2E Visual Tests (Playwright, headed)
```bash
npm run test:visual
```
6 spec files:
1. `01-app-shell` — Sidebar, navigation, theme toggle, Phase 2 stubs
2. `02-overview` — Tabs, workflow list, search, pagination
3. `03-canvas` — Workflow rendering, node selection, node selector panel
4. `04-all-workflows` — Import and render all 10 workflow variants
5. `05-pages` — Screenshot every page (20+ routes)
6. `06-error-states` — Invalid routes, missing workflows

### Prerequisites for E2E Tests
1. n8n running on localhost:5678 (`npx n8n`)
2. `.env` configured with N8N_BASE_URL, N8N_API_KEY
3. LLM API keys in `.env` (OPENAI_API_KEY, GOOGLE_AI_API_KEY, ANTHROPIC_API_KEY, GROQ_API_KEY)
4. LLM credentials created in n8n (one per provider)
5. 3 data tables created in n8n: `compiled_graphs`, `step_results`, `run_results`

### Self-Healing Test Loop
When running E2E tests in self-healing mode:
1. Run `npm run test:visual` (headed, screenshots on)
2. Check `test-results/screenshots/` for visual output
3. Check `test-results/visual-report/` for HTML report
4. Debug failures using screenshots + debug.log
5. Fix source code, re-run
6. Repeat until all tests pass

## How to Run

```bash
# 1. Configure
cp .env.example .env
# Add N8N_BASE_URL, N8N_API_KEY, and LLM provider keys

# 2. Install
npm install
npx playwright install chromium

# 3. Start n8n
npx n8n

# 4. Run the app (for Tauri desktop)
npm run tauri dev

# 5. Run unit tests
npm test

# 6. Run E2E tests (headed, against SvelteKit dev server)
npm run test:visual
```

## Requirements & Spec

Full spec in `.kiro/specs/local-n8n-app/`:
- `requirements.md` — 46 requirements across 3 phases
- `design.md` — Full technical design
- `tasks.md` — Implementation task list (all Phase 1 required tasks complete)

### Phase 1 (implemented): Core features using n8n public API
### Phase 2 (stubs): Enterprise features (12 placeholder pages)
### Phase 3 (deferred): Features requiring internal REST API session auth
