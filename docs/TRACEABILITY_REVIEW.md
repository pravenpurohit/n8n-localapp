# Traceability Review — Design ↔ Implementation Cross-Check

Date: 2026-04-02

## Methodology

Compared every implemented file against the design document (design.md) and requirements (requirements.md) to detect drift, missing pieces, or inconsistencies.

## Summary

| Area | Files Checked | Verdict |
|------|--------------|---------|
| TypeScript types | 5 files | ✅ Match design exactly |
| API client | client.ts | ✅ Match design (ApiRequestError, requestInternal, paginate) |
| API modules | 7 files | ⚠️ 1 drift (templates.ts) |
| Core modules | 4 files | ✅ Match design |
| Utilities | 3 files | ✅ Match design |
| Rust backend | 4 files | ✅ Match design (URL allowlist, managed Client, resource_dir fallback) |
| Config files | 5 files | ⚠️ 1 minor issue (Tauri capabilities) |
| Test infrastructure | 7 test files | ✅ 58 tests passing |
| Routes | 12 placeholder pages | ✅ All routes created per design §2.2 |

## Drift Issues

### DRIFT-1: Templates API routes through Rust proxy with external URL (MEDIUM)

**File**: `src/lib/api/templates.ts`
**Problem**: The templates API calls `apiClient.requestInternal('GET', 'https://api.n8n.io/api/templates/...')`. This constructs a full external URL and passes it to `requestInternal()`, which prepends `this.baseUrl` to the path. The resulting URL would be `http://localhost:5678https://api.n8n.io/api/templates/...` — a malformed URL.

Additionally, even if the URL were correct, the Rust HTTP proxy validates that URLs start with the AllowedBaseUrl (localhost:5678). Requests to `https://api.n8n.io` would be rejected by the URL allowlist.

**Design says**: Req 8 specifies "n8n.io templates API (public, no auth needed)". The design doesn't explicitly address how external API calls bypass the Rust proxy.

**Fix needed**: Templates should either:
1. Use a separate `fetch()` call directly (not through Tauri proxy) since templates are public and don't need the API key, OR
2. Add a separate Rust command for external HTTP requests without URL allowlist validation, OR
3. Modify `requestInternal` to detect full URLs and not prepend baseUrl

**Impact**: Templates page won't work until fixed.

### DRIFT-2: Tauri capabilities minimal (LOW)

**File**: `src-tauri/capabilities/default.json`
**Problem**: Only has `core:default` and `shell:allow-open`. The design mentions HTTP, filesystem, and shell permissions. However, Tauri 2 custom commands (invoke) don't require explicit capability permissions — they're registered via `invoke_handler`. The capabilities file is mainly for Tauri plugins.

**Impact**: None currently. The HTTP proxy and filesystem commands work via invoke without capability entries. If Tauri plugins are added later (e.g., `tauri-plugin-http`, `tauri-plugin-fs`), capabilities would need updating. Since we use custom Rust commands instead of plugins, this is fine.

**Verdict**: Not a real drift — design was slightly over-specified for capabilities.

## Conformance Checks (All Passing)

### Types (design §3.1)
- ✅ `Workflow` has `versionId` field (design review fix 9.1)
- ✅ `Execution` has `workflowData?: Workflow` field (design review fix 9.2)
- ✅ `ApiErrorResponse` interface (not `ApiError` — design review fix 5.1)
- ✅ All interfaces match design exactly: WorkflowNode, WorkflowConnections, ConnectionTarget, WorkflowSettings, Tag, ExecutionStatus, ExecutionData, NodeExecutionResult, ExecutionError, Credential, CredentialWithData, CredentialSchema, CredentialSchemaField, NodeTypeDefinition, NodeCategory, PortDefinition, NodePropertyDefinition, PaginatedResponse, AppConfig

### API Client (design §5.1)
- ✅ Class named `ApiRequestError` (not `ApiError` — design review fix 5.1)
- ✅ `requestInternal()` method for /rest/* endpoints (design review fix 3.2)
- ✅ `paginate()` method with cursor handling
- ✅ 401 → "check API key", 5xx → server error, 4xx → parsed message
- ✅ Logs via logger (method, URL, status, duration)
- ✅ Singleton export `apiClient`

### API Modules (design §5.3)
- ✅ workflows.ts: listWorkflows, getWorkflow, createWorkflow, updateWorkflow, deleteWorkflow, activateWorkflow, deactivateWorkflow
- ✅ executions.ts: listExecutions (with filters), getExecution, deleteExecution, retryExecution
- ✅ credentials.ts: listCredentials, getCredential, createCredential, updateCredential, deleteCredential, getCredentialSchema, testCredential
- ✅ tags.ts: listTags, createTag, updateTag, deleteTag
- ✅ data-tables.ts: listDataTables, createDataTable, deleteDataTable, listRows, addRow, updateRow, deleteRow, upsertRow
- ⚠️ templates.ts: URL construction is broken (DRIFT-1)
- ✅ audit.ts: runAudit

### Rust Backend (design §5.2, §8.1, §8.2, §8.3)
- ✅ `reqwest::Client` as managed state (design review fix 3.1)
- ✅ `AllowedBaseUrl` managed state with URL validation (design review fix 4.1)
- ✅ `.env` path resolution: resource_dir → current_dir fallback (design review fix 8.1)
- ✅ Log rotation at 10MB (design §8.2)
- ✅ `read_env_config_standalone()` for setup phase
- ✅ All 5 commands registered: http_request, read_env_config, append_log, write_file, read_file

### Core Modules (design §6.1-§6.4)
- ✅ workflow-parser.ts: parseWorkflowJson, serializeWorkflow, ParseError, connection validation
- ✅ expression-parser.ts: findExpressions, classifyExpression, extractReferencedNodes, all 6 expression types
- ✅ node-registry.ts: NodeTypeRegistry class, initialize, get, getByCategory, search, bundled + fetch fallback
- ✅ connection-resolver.ts: validateConnections, getConnectionType, CONNECTION_TYPES
- ✅ logger.ts: Logger class, setDebug, console + Tauri file output, structured entries

### Utilities (design §7.3, §7.4)
- ✅ pagination.ts: PaginatedList class with $state/$derived, loadInitial, loadMore, reset, concurrent guard
- ✅ cache.ts: WorkflowNameCache with refresh (paginate all) and getName
- ✅ format.ts: formatRelativeTime, formatAbsoluteTime, formatDuration

### Project Config
- ✅ adapter-static configured in svelte.config.js
- ✅ Tailwind CSS 4 with dark mode class strategy and n8n color tokens
- ✅ Vitest configured in vite.config.ts with jsdom, setup file, coverage
- ✅ All dependencies present in package.json (svelte, @xyflow/svelte, @tauri-apps/api, prismjs, tailwindcss, vitest, playwright, fast-check)
- ✅ npm scripts: dev, build, test, test:visual, test:update-baselines, update-node-registry
- ✅ .gitignore covers .env, debug.log, test-results/
- ✅ Static node registry JSON (266 lines, 10 node types)

### Routes (design §2.2)
- ✅ All route directories created: overview, workflows/[id], workflows/new, executions, credentials, templates, data-tables/[id], settings/preferences, settings/connection, settings/tags, settings/audit, error
- ✅ Root layout with CSS import
- ✅ Root page redirects to /overview

## Remaining Work (Tasks 7-27)

Tasks 7-27 are all UI implementation (stores, components, pages) plus tests and Phase 2 stubs. No code exists for these yet. The foundation (types, API, core modules, Rust backend) is solid and matches the design.

## Recommendation

Fix DRIFT-1 (templates API URL) before proceeding to task 7. This is a 5-minute fix that prevents a broken templates page later.
