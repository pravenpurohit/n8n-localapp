# Mega Review — Local n8n App (Code Implementation)

Date: 2026-04-02

---

## Review 1: Business & Problem Validation

**Problem Clarity**: Good. A desktop client for self-hosted n8n that bypasses CORS and keeps API keys out of the browser. Clear single-sentence problem.

**Scope Discipline**: Good. Clear Phase 1/2/3 boundary. Phase 2 items are stubs. No scope creep.

**User & Value Alignment**: Good. Target user is a self-hosted n8n operator who wants a native desktop experience.

**Findings**: None produced. The problem is well-defined, scope is disciplined, and the MVP boundary is clear.

**Critic challenge dropped 0 findings.**

---

## Review 2: User Journey & UX

### Findings

**F2.1 — Export serializes Svelte Flow `node.data` instead of n8n workflow format (MEDIUM)**
`ImportExport.svelte` `handleExport()` serializes `canvasStore.nodes.map(n => n.data)` and `connections: {}`. This produces a JSON file that is NOT a valid n8n workflow — it has no connections and the node format is wrong. Importing this file back would fail or produce a broken workflow.
Fix: Use `flowNodesToWorkflowNodes()` and `edgesToWorkflowConnections()` from `flow-mapping.ts` to produce proper n8n JSON, matching the `serializeWorkflow()` format.

**F2.2 — StickyNote text edits don't persist back to node data (LOW)**
`StickyNote.svelte` updates a local `text` $state but never writes it back to `node.data.text`. On save, the sticky note text is lost.
Fix: Update `node.data = { ...node.data, text }` in `handleInput`.

### Critic Challenge
- F2.1: Actionable (specific file + fix), proportionate, real (export produces broken files). **KEEP**.
- F2.2: Actionable, proportionate, real (data loss on save). **KEEP**.

**Critic challenge dropped 0 findings that were overcautious, vague, or not actionable.**

Surviving: 2

---

## Review 3: Architecture & System Design

### Findings

**F3.1 — flow-mapping.ts uses node names as Svelte Flow IDs but n8n connections reference names while nodes have separate IDs (MEDIUM)**
`workflowConnectionsToEdges` sets `edge.source = sourceName` (the node name from the connections map). But `workflowNodesToFlowNodes` sets `node.id = node.id` (the UUID). Svelte Flow matches edges to nodes by ID. If node.name !== node.id (which is always the case — names are human-readable, IDs are UUIDs), edges won't connect to nodes.
Fix: Build a `nameToId` map from the nodes array and resolve source/target in `workflowConnectionsToEdges`. The unused `nodeNameToId` variable on line 42 suggests this was intended but never implemented.

**F3.2 — Dual node selection state between canvasStore and nodePanelStore (LOW)**
`canvasStore.selectedNodeId` and `nodePanelStore.selectedNode` track the same concept independently. They can drift if one is updated without the other.
Fix: Derive `nodePanelStore.selectedNode` from `canvasStore.selectedNodeId` + `canvasStore.nodes`, eliminating the duplicate state.

### Critic Challenge
- F3.1: Actionable (specific file, specific fix), proportionate, real (edges won't render connected to nodes). **KEEP**.
- F3.2: Actionable, but low impact — both are always updated together in the click handler. **KEEP as LOW**.

**Critic challenge dropped 0 findings.**

Surviving: 2

---

## Review 4: Security & Data Integrity

### Findings

**F4.1 — Rust `write_file` and `read_file` commands accept arbitrary paths with no validation (HIGH)**
`fs.rs` `write_file(path, content)` and `read_file(path)` accept any path string from the frontend. A compromised or buggy frontend could read/write any file the process has access to (e.g., `read_file("/etc/passwd")` or `write_file("/tmp/malicious", "...")`).
Fix: Restrict paths to a known safe directory (e.g., app data dir). Validate that the resolved path is within the allowed directory after canonicalization to prevent `../` traversal.

**F4.2 — `debug.log` written to current working directory, not app data dir (MEDIUM)**
`append_log` in `fs.rs` writes to `PathBuf::from("debug.log")` — a relative path resolved from CWD. On macOS, CWD for a Tauri app could be `/` or the user's home. The log file ends up in an unpredictable location and could be world-readable.
Fix: Use Tauri's `app.path().app_data_dir()` to resolve the log path.

### Critic Challenge
- F4.1: Actionable (specific file, specific fix), proportionate, real (path traversal). **KEEP**.
- F4.2: Actionable, proportionate, real (log in unpredictable location). **KEEP**.

**Critic challenge dropped 0 findings.**

Surviving: 2

---

## Review 5: Code Quality & Maintainability

### Findings

**F5.1 — `appStore.initialize()` calls `apiClient.initialize()` then immediately re-invokes `read_env_config` (LOW)**
`app.svelte.ts` calls `apiClient.initialize()` (which internally invokes `read_env_config`), then separately does `const envConfig = await invoke<AppConfig>('read_env_config')`. This reads the .env file twice. The first call's result is discarded (the dummy config object on lines 18-22 is immediately overwritten).
Fix: Have `apiClient.initialize()` return the `AppConfig`, or read it once and pass it to both.

**F5.2 — Unused imports in several files (LOW)**
- `canvas.svelte.ts` imports `parseWorkflowJson` and `serializeWorkflow` but never uses them.
- `CredentialForm.svelte` imports `testCredential` and `deleteCredential` but never uses them.
- `flow-mapping.ts` declares `nodeNameToId` on line 42 but never populates or uses it.
Fix: Remove unused imports and variables.

### Critic Challenge
- F5.1: Actionable, proportionate, real (unnecessary network call). **KEEP**.
- F5.2: Actionable, proportionate, real (dead code). **KEEP**.

**Critic challenge dropped 0 findings.**

Surviving: 2

---

## Review 6: Testing Strategy

### Findings

**F6.1 — Zero tests for stores, components, pages, or flow-mapping (MEDIUM)**
58 tests exist for core modules (parser, expression-parser, connection-resolver, logger, API client, format utils). But the entire UI layer — 11 stores, 20+ components, 22 pages, and the critical `flow-mapping.ts` — has zero test coverage. The flow-mapping module is pure logic with no UI dependencies and is highly testable.
Fix: Add unit tests for `flow-mapping.ts` (round-trip: nodes→flow→nodes, connections→edges→connections). This is the highest-value test to add.

**F6.2 — No test for the templates.ts DRIFT-1 fix (LOW)**
The templates API was rewritten to use direct `fetch()` instead of the Tauri proxy. No test validates this works.
Fix: Add a test mocking `fetch` to verify `listTemplates` and `getTemplate` call the correct URLs.

### Critic Challenge
- F6.1: Actionable (specific module, specific test), proportionate, real (flow-mapping bugs would silently corrupt workflows). **KEEP**.
- F6.2: Actionable, but low impact — the fix is straightforward and unlikely to regress. **DROP** — overcautious.

**Critic challenge dropped 1 finding that was overcautious.**

Surviving: 1

---

## Review 7: Performance & Scalability

### Findings

**F7.1 — `workflowNameCache.refresh()` fetches ALL workflows on every page load (MEDIUM)**
`overview/+page.svelte` calls `workflowNameCache.refresh()` on mount, which paginates through every workflow in the instance. For instances with thousands of workflows, this is an unbounded fetch that blocks the overview page.
Fix: Lazy-populate the cache — only fetch names for workflow IDs that are actually needed (e.g., from the current execution list). Or cap the refresh to a reasonable limit.

### Critic Challenge
- F7.1: Actionable, proportionate, real (blocks page load for large instances). **KEEP**.

**Critic challenge dropped 0 findings.**

Surviving: 1

---

## Review 8: Operational Readiness

### Findings

**F8.1 — No global unhandled error/rejection handler (LOW)**
Design §11.4 specifies `window.onerror` and `window.onunhandledrejection` handlers that log + show toast. These aren't implemented. Unhandled promise rejections (e.g., from fire-and-forget API calls) silently disappear.
Fix: Add global handlers in `+layout.svelte` `onMount` that call `logger.error()` and show an error toast.

### Critic Challenge
- F8.1: Actionable, proportionate, real (silent failures in production). **KEEP**.

**Critic challenge dropped 0 findings.**

Surviving: 1

---

## Review 9: API & Data Model Design

### Findings

**F9.1 — `edgesToWorkflowConnections` uses edge.source (which is a node name from load, but a UUID from addEdge) inconsistently (MEDIUM)**
When loading a workflow, `workflowConnectionsToEdges` sets `edge.source = sourceName` (a human-readable name). But `canvasStore.addEdge()` passes Svelte Flow node IDs (UUIDs) as source/target. So `edgesToWorkflowConnections` will produce connections keyed by UUID for user-added edges but by name for loaded edges. The n8n API expects connections keyed by node name.
Fix: This is the same root cause as F3.1. The mapping layer needs a consistent ID↔name resolution strategy.

### Critic Challenge
- F9.1: Same root cause as F3.1, but describes the data integrity consequence. **KEEP** (merged with F3.1 in final summary).

**Critic challenge dropped 0 findings.**

Surviving: 1 (merged)

---

## Review 10: Dependency & Supply Chain

### Findings

**F10.1 — `dotenvy` in Cargo.toml is listed but never imported (LOW)**
`Cargo.toml` lists `dotenvy = "0.15"` as a dependency, but the .env parsing is done manually in `env.rs`. The dependency is unused.
Fix: Remove `dotenvy` from `Cargo.toml`.

### Critic Challenge
- F10.1: Actionable, proportionate, real (unnecessary dependency in binary). **KEEP**.

**Critic challenge dropped 0 findings.**

Surviving: 1

---

## Final Output: Unified Summary

### Project Health Scorecard

| Perspective | Status | Top Issue |
|-------------|--------|-----------|
| Business & Problem | 🟢 | No issues — clear problem, disciplined scope |
| User Journey & UX | 🟡 | Export produces invalid n8n JSON (F2.1) |
| Architecture | 🟡 | Node name↔ID mismatch breaks edge rendering (F3.1) |
| Security | 🟡 | Unrestricted file read/write paths in Rust backend (F4.1) |
| Code Quality | 🟢 | Minor: double .env read, unused imports (F5.1, F5.2) |
| Testing | 🟡 | Zero tests for flow-mapping, stores, or UI (F6.1) |
| Performance | 🟢 | Workflow name cache fetches all workflows eagerly (F7.1) |
| Operations | 🟢 | Missing global error handler (F8.1) |
| API & Data Model | 🟡 | Edge source ID inconsistency on save (F9.1, same as F3.1) |
| Dependencies | 🟢 | Unused `dotenvy` crate (F10.1) |

### Critic Challenge Summary

| Review | Findings Produced | Findings Dropped | Findings Surviving |
|--------|-------------------|------------------|--------------------|
| 1. Business | 0 | 0 | 0 |
| 2. UX | 2 | 0 | 2 |
| 3. Architecture | 2 | 0 | 2 |
| 4. Security | 2 | 0 | 2 |
| 5. Code Quality | 2 | 0 | 2 |
| 6. Testing | 2 | 1 | 1 |
| 7. Performance | 1 | 0 | 1 |
| 8. Operations | 1 | 0 | 1 |
| 9. API & Data | 1 | 0 | 1 (merged w/ F3.1) |
| 10. Dependencies | 1 | 0 | 1 |
| **Total** | **14** | **1** | **13** |

### Top 5 Actions (Highest Impact)

1. **Fix node name↔ID mapping in flow-mapping.ts** (F3.1/F9.1) — Architecture/Data — Edges won't render connected to nodes, and saving user-added edges produces invalid connection keys. Build a `nameToId` map from the nodes array and resolve in both directions. This is the only bug that makes the core canvas non-functional.

2. **Fix export to produce valid n8n workflow JSON** (F2.1) — UX — Export currently serializes Svelte Flow internal data format with empty connections. Use `flowNodesToWorkflowNodes()` + `edgesToWorkflowConnections()` + `serializeWorkflow()` to produce proper n8n JSON.

3. **Restrict Rust `write_file`/`read_file` to safe directory** (F4.1) — Security — Arbitrary path access from the frontend is a path traversal risk. Validate paths are within the app data directory.

4. **Fix StickyNote text persistence** (F2.2) — UX — Sticky note edits are lost on save because the local state isn't written back to `node.data`.

5. **Add flow-mapping unit tests** (F6.1) — Testing — The flow-mapping module is the critical data transformation layer with zero tests. A round-trip test (nodes→flow→nodes) would catch F3.1-class bugs.

### Overall Verdict

The project has a solid foundation — clean architecture, well-typed data models, proper Rust backend with URL allowlisting, and 58 passing tests on core modules. The biggest risk is the node name↔ID mismatch in `flow-mapping.ts` (F3.1), which would prevent the canvas from rendering edges correctly and corrupt connections on save. This is a straightforward fix (build a name→ID lookup map). The export bug (F2.1) and path traversal risk (F4.1) are the next priorities. Everything else is low-severity cleanup. The codebase is well-organized and maintainable — the strongest aspect is the clean separation between API layer, core business logic, stores, and UI components.
