# Project Context & Recovery State

Last updated: 2026-04-02

## What This Project Is

A local desktop app (Tauri 2 + Svelte 5 + Svelte Flow) that replicates the n8n.com workflow automation UI. Connects to a self-hosted n8n instance via API key. No cloud subscription needed.

## Repository

- GitHub: https://github.com/pravenpurohit/n8n-localapp
- Branch: main (all work committed and pushed)
- Owner: pravenpurohit (pravenpurohit@gmail.com)

## Current State: Requirements Complete, Design & Tasks Not Started

### What's Done

1. **Requirements document** (46 requirements, 3 phases): `.kiro/specs/local-n8n-app/requirements.md`
   - Phase 1: 31 requirements — free n8n Community Edition public API (`/api/v1/*` via API key)
   - Phase 2: 12 requirements — Enterprise/paid features (LDAP, SAML, Projects, Variables, etc.)
   - Phase 3: 3 requirements — free features requiring internal REST API session auth

2. **Tech stack decided** (`docs/TECH_STACK.md`):
   - Svelte 5 + SvelteKit + @sveltejs/adapter-static
   - Svelte Flow (@xyflow/svelte) for node canvas
   - Tauri 2 (Rust backend, system webview)
   - Vite (built into SvelteKit)
   - Tailwind CSS 4
   - TypeScript strict mode
   - Vitest (unit tests) + Playwright (E2E/visual tests)

3. **33 ASCII wireframe mock screens**: `docs/mock-screens/`

4. **4 test workflow JSON files**: `test-data/workflows/`
   - W0_Compile_Then_Run.json (orchestrator)
   - W1_Compile_Source_Prompt.json (AI compiler with LangChain + OpenAI)
   - W2_Execute_Step.json (step executor with LangChain + OpenAI)
   - W3_Run_Compiled_Graph.json (graph runner with loop)

5. **Mega review completed**: `docs/mega-review-results.md` — all 15 surviving findings fixed in requirements

6. **n8n instance**: Running locally via `npx n8n` on port 5678
   - API key generated and stored in `.env`
   - User: pravenpurohit@gmail.com (global:owner)
   - n8n version: 2.14.2
   - Instance is currently STOPPED (was killed during session)

7. **.env file** (gitignored, on local machine only):
   ```
   N8N_BASE_URL=http://localhost:5678
   N8N_API_KEY=eyJhbG...pQ_M (full JWT token)
   DEBUG=false
   ```

8. **GitHub CLI** (`gh`) installed and authenticated as pravenpurohit

## What's NOT Done Yet

### Immediate Next Step: Multi-LLM Test Workflows

The user wants to create variants of the test workflows that use different LLM providers:
- OpenAI GPT-4o (already in W1/W2 via `lmChatOpenAi`)
- Google Gemini (via `lmChatGoogleGemini`)
- Anthropic Claude (via `lmChatAnthropic`)
- xAI Grok (via `lmChatGroq`)

**Waiting on**: User to provide API keys for each provider. Keys will go in `.env`:
```
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
ANTHROPIC_API_KEY=
XAI_API_KEY=
```

**Action**: Create 4 variants of W1 and W2 (the two workflows that use LLM nodes), one per provider. W0 and W3 don't need variants — they call W1/W2 as sub-workflows.

### After Multi-LLM Workflows

1. **Create design.md** — technical design document (architecture, component design, data flow, API integration patterns). This is the next phase of the spec workflow: requirements → design → tasks.
2. **Create tasks.md** — implementation task list derived from the design
3. **Scaffold the Tauri + SvelteKit project** (`npm create tauri-app`)
4. **Implement Phase 1 requirements** per the task list

## Key Files

| File | Purpose |
|------|---------|
| `.kiro/specs/local-n8n-app/requirements.md` | All 46 requirements |
| `.kiro/specs/local-n8n-app/.config.kiro` | Spec config (requirements-first workflow) |
| `docs/TECH_STACK.md` | Technology stack decisions |
| `docs/mock-screens/README.md` | Index of all 33 mock screens |
| `docs/mega-review-results.md` | Review findings (all fixed) |
| `test-data/workflows/*.json` | 4 test workflow files |
| `test-data/baselines/` | Visual test baselines (empty, to be generated) |
| `.env` | Credentials (gitignored) |
| `.env.example` | Credential template (committed) |
| `README.md` | Project overview and structure |

## How to Resume

1. Read this file first
2. Read `docs/TECH_STACK.md` for stack decisions
3. Read `.kiro/specs/local-n8n-app/requirements.md` for all requirements
4. Check `git log --oneline` for commit history
5. Start n8n: `npx n8n` (port 5678)
6. Continue from "Immediate Next Step" above
