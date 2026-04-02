---
inclusion: auto
---

# Session Context — What To Do Next

## Quick Start for New Session

When the user says "run the visual tests" or "start testing" or "continue":

1. Read `docs/PROJECT_CONTEXT.md` for full architecture and test data overview
2. Follow the steps below

## Current State

- All Phase 1 code is implemented (tasks 1-27 complete)
- 58 unit tests passing (Vitest)
- Mega review done, all findings fixed
- 10 test workflow files (4 base + 6 LLM variants for Gemini/Claude/Groq)
- 8 sample prompts (S0 through S3 diamond-dependency)
- Playwright E2E test suite ready (6 spec files in tests/e2e/)
- API keys configured in .env (OpenAI, Gemini, Anthropic, Groq)
- Git: all committed and pushed to main

## Next Step: Run Headed Playwright E2E Tests in Self-Healing Mode

### Prerequisites (user must do)
1. Start n8n: `npx n8n` (must be running on localhost:5678)
2. Install Playwright browsers if not done: `npx playwright install chromium`

### What to Run
```bash
npm run test:visual
```
This runs Playwright in headed mode against the SvelteKit dev server (auto-started).

### Self-Healing Loop
1. Run `npm run test:visual`
2. When tests fail:
   - Check `test-results/screenshots/` for visual output
   - Check `test-results/visual-report/index.html` for HTML report
   - Read the Playwright error output for stack traces
   - Read `debug.log` if it exists for app-level errors
3. Diagnose the root cause from screenshots + errors
4. Fix the source code (components, stores, pages, or test files)
5. Re-run `npm run test:visual`
6. Repeat until all 6 spec files pass
7. Commit after each successful fix cycle

### Key Files for Debugging
| File | Purpose |
|------|---------|
| `tests/e2e/helpers.ts` | n8n API helpers, screenshot utility |
| `tests/e2e/01-app-shell.spec.ts` | Sidebar, nav, theme |
| `tests/e2e/02-overview.spec.ts` | Overview tabs, search |
| `tests/e2e/03-canvas.spec.ts` | Canvas rendering, node interaction |
| `tests/e2e/04-all-workflows.spec.ts` | All 10 workflow variants |
| `tests/e2e/05-pages.spec.ts` | Every page screenshot |
| `tests/e2e/06-error-states.spec.ts` | Error handling |
| `playwright.config.ts` | Test config (headed, screenshots on) |
| `src/routes/+layout.svelte` | Root layout with app init |
| `src/lib/stores/app.svelte.ts` | App initialization |
| `src/lib/stores/canvas.svelte.ts` | Canvas state |
| `src/lib/stores/flow-mapping.ts` | Node/edge mapping (recently fixed) |

### Common Issues to Expect
- **App init fails**: The SvelteKit dev server doesn't have Tauri — `invoke()` calls will fail. Tests may need the app to handle missing Tauri gracefully, or tests need to mock the API layer.
- **n8n not running**: Tests import workflows via n8n API. If n8n is down, import fails.
- **Svelte Flow render timing**: Canvas tests need `waitForTimeout` after navigation for Svelte Flow to render nodes.
- **Node selectors**: Svelte Flow nodes may not have predictable test IDs. May need to add `data-testid` attributes.

### Important: Tauri vs Dev Server
The E2E tests run against the SvelteKit dev server (localhost:5173), NOT the Tauri app. This means:
- Tauri `invoke()` calls won't work in the browser
- The app needs a fallback for when Tauri is not available
- Either: mock the Tauri API at the test level, OR add browser-compatible fallbacks in the stores

This is likely the FIRST thing that will need fixing. The app currently assumes Tauri is always available. For E2E testing against the dev server, we need to handle the case where `@tauri-apps/api/core` is not available.

### Do NOT Use Sub-Agents
Do all work directly. No invokeSubAgent calls. Use fsWrite, strReplace, executeBash, readFile, etc.
