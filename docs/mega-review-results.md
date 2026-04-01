# Mega Review Results — requirements.md

## Project Health Scorecard

| Perspective | Status | Top Issue |
|-------------|--------|-----------|
| Business & Problem | 🟢 | Clear problem, well-phased MVP; Req 42 (self-healing) is ambitious |
| User Journey & UX | 🟡 | Missing node type metadata source — canvas can't render without it |
| Architecture | 🟡 | No tech stack specified; CORS and filesystem access unaddressed |
| Security | 🟢 | Local-only app has minimal attack surface; AI auto-fix needs guardrails |
| Code Quality | ⚪ | N/A — no code yet |
| Testing | 🟡 | No unit/integration test requirements; visual-only testing is brittle |
| Performance | 🟡 | No pagination handling for API list endpoints |
| Operations | 🟡 | No app start command defined |
| API & Data Model | 🟢 | API endpoints well-mapped; pagination is the only gap |
| Dependencies | ⚪ | N/A — no package.json yet |

## Critic Challenge Summary

| Review | Findings Produced | Findings Dropped | Findings Surviving |
|--------|-------------------|------------------|--------------------|
| 1. Business | 4 | 1 | 3 |
| 2. UX | 3 | 0 | 3 |
| 3. Architecture | 3 | 0 | 3 |
| 4. Security | 2 | 1 | 1 |
| 5. Code Quality | 0 | 0 | 0 |
| 6. Testing | 3 | 0 | 3 |
| 7. Performance | 1 | 0 | 1 |
| 8. Operations | 1 | 0 | 1 |
| 9. API & Data | 2 | 2 | 0 |
| 10. Dependencies | 0 | 0 | 0 |
| **Total** | **19** | **4** | **15** |

## Top 5 Actions (Highest Impact)

1. **Add a requirement for node type metadata sourcing** — from UX (Finding 2.1) — Without knowing node icons, parameter schemas, and categories, the canvas editor (Req 3), node selection panel (Req 3 AC#4), and node configuration panel (Req 4) literally cannot render. The n8n public API doesn't expose a "list node types" endpoint. Options: bundle node definitions from n8n's open-source repo, fetch from the internal `/rest/nodes` endpoint (Phase 3), or maintain a static registry. This is the single biggest gap in the requirements.

2. **Verify manual workflow execution is possible via public API** — from UX (Finding 2.2) — Req 3 AC#9 requires triggering manual execution, but the API key scopes don't include a `workflow:execute` scope. The public API may not support manual execution at all — only activate/deactivate for trigger-based execution. If manual execution requires the internal REST API, it moves core canvas functionality to Phase 3, which fundamentally changes the app's value proposition. Investigate and document the correct endpoint.

3. **Specify technology stack and deployment model** — from Architecture (Finding 3.1, 3.2, 3.3) — The requirements don't specify whether this is a browser SPA, Electron app, or Tauri app. This decision affects: whether `debug.log` file writing is possible (Req 40), whether CORS is an issue (localhost API calls), and whether the app can be distributed as a standalone binary. Add a technology constraints section to the requirements.

4. **Add pagination handling to all list endpoints** — from Performance (Finding 7.1) — Req 2 (workflows), Req 5 (executions), Req 7 (credentials), Req 23 (tags), and Req 24 (data tables) all say "display a list of all X" but the n8n API returns paginated results with `nextCursor`. Without pagination handling, the app only shows the first page of results. Add ACs for "load more" or infinite scroll behavior.

5. **Add unit and integration test requirements** — from Testing (Finding 6.2) — The testing strategy is entirely visual/E2E (Req 41-43). There are no requirements for unit testing the API client, workflow JSON parser, expression evaluator, or connection resolver. These are the core modules that will have the most bugs. Add a Req 44 for unit test coverage of core modules, and use mock API responses instead of requiring a live n8n instance.

## All Surviving Findings

### From Review 1 (Business)
- **1.1** (LOW): Req 35 (Mock Screens) is a process artifact already completed, not a product feature. Remove from Phase 1 classification table or mark as "Documentation — Complete."
- **1.2** (INFO): Req 42 (Self-Healing Test Loop) is extremely ambitious. The user explicitly requested it, so it stays, but implementation should be last after all other Phase 1 requirements are done.
- **1.3** (HIGH): No requirement addresses how node type definitions (icons, parameter field schemas, node categories) are sourced. Add Req 44.

### From Review 2 (UX)
- **2.1** (CRITICAL): Node type metadata gap — same as 1.3 above. The canvas, node panel, and node config panel all depend on this.
- **2.2** (HIGH): Manual workflow execution (Req 3 AC#9) may not be available via the public API. Verify and document.
- **2.3** (MEDIUM): Req 5 (Executions) needs an AC specifying that execution list items display the workflow name (resolved from workflowId), not just the raw ID.

### From Review 3 (Architecture)
- **3.1** (HIGH): No technology stack specified. Add a constraints section.
- **3.2** (MEDIUM): Req 40 AC#7 (debug.log file) is unimplementable in a pure browser SPA. Clarify deployment model.
- **3.3** (MEDIUM): CORS handling not addressed. If the app runs on port 3000 and n8n on 5678, browser CORS will block API calls unless n8n is configured with CORS headers or the app proxies requests.

### From Review 4 (Security)
- **4.2** (MEDIUM): Req 42 (Self-Healing) auto-applies AI-generated code fixes with no safety guardrails. Add constraints: limit fixable file types (e.g., only `.ts`, `.tsx`, `.css` in `src/`), require a git commit before each fix so changes can be reverted, and exclude `.env`, `.gitignore`, and config files from AI modification.

### From Review 6 (Testing)
- **6.1** (MEDIUM): Req 41 (Visual Testing) has no functional assertions beyond screenshot comparison. Add ACs like "verify the workflow list contains N items" or "verify the node panel shows the correct node name."
- **6.2** (HIGH): No unit or integration test requirements. Add a requirement for testing core modules (API client, JSON parser, expression evaluator) with mock data.
- **6.3** (LOW): Req 41 AC#11 (error state testing by stopping n8n) should use a mock server instead of actually stopping/starting n8n.

### From Review 7 (Performance)
- **7.1** (MEDIUM): No pagination handling specified for list endpoints (Req 2, 5, 7, 23, 24). Add ACs for cursor-based pagination.

### From Review 8 (Operations)
- **8.1** (MEDIUM): No app start command defined. Add an AC to Req 1 or a new requirement specifying `npm start` or `npm run dev`.

## Overall Verdict

The requirements document is thorough and well-structured with clear phase boundaries, consistent formatting, and good traceability to n8n's actual feature set. The biggest risk is the **node type metadata gap** — without a plan for sourcing node definitions, the core canvas editor cannot be built. The second risk is **manual execution availability** via the public API. Both should be resolved before implementation begins. The self-healing test loop (Req 42) is the most ambitious requirement and should be implemented last. The strongest aspect is the phase classification and the real-world test workflow data that exercises a rich set of n8n features.
