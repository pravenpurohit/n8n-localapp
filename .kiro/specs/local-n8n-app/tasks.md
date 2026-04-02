# Implementation Plan: Local n8n App

## Overview

This plan implements the Local n8n App — a Tauri 2 desktop application replicating the n8n.com workflow automation UI. Tasks follow a bottom-up build order: scaffolding → Rust backend → core modules → layout → pages → canvas editor → tests → Phase 2 stubs. Each task builds on previous tasks with no orphaned code.

## Tasks

- [x] 1. Project scaffolding and configuration
  - [x] 1.1 Initialize Tauri 2 + SvelteKit project
    - Run `npm create tauri-app` with Svelte template
    - Configure `@sveltejs/adapter-static` in `svelte.config.js`
    - Set TypeScript strict mode in `tsconfig.json`
    - Add `@xyflow/svelte`, `tailwindcss` (v4), `prismjs` to dependencies
    - Add `vitest`, `@playwright/test`, `fast-check`, `@types/prismjs` to devDependencies
    - Verify `npm run dev` and `npm run tauri dev` launch successfully
    - _Requirements: 46.1, 46.2, 46.5_

  - [x] 1.2 Configure Tailwind CSS 4 with dark/light theme
    - Create `src/app.css` with Tailwind directives
    - Configure `darkMode: 'class'` in Tailwind config
    - Define color tokens matching n8n design language (primary `#ff6d5a`, backgrounds, surfaces, text, borders, status colors)
    - _Requirements: 30.1, 30.2_

  - [x] 1.3 Set up SvelteKit file-based routing structure
    - Create all route directories per design §2.2: `overview/`, `workflows/[id]/`, `workflows/new/`, `executions/`, `credentials/`, `templates/`, `data-tables/[id]/`, `settings/preferences/`, `settings/connection/`, `settings/tags/`, `settings/audit/`, `error/`
    - Create placeholder `+page.svelte` for each route
    - Create root `+layout.svelte` and `+page.svelte` (redirect to `/overview`)
    - _Requirements: 46.5_

  - [x] 1.4 Create shared TypeScript type definitions
    - Create `src/lib/types/workflow.ts` — Workflow, WorkflowNode, WorkflowConnections, ConnectionTarget, WorkflowSettings, Tag interfaces
    - Create `src/lib/types/execution.ts` — Execution, ExecutionStatus, ExecutionData, NodeExecutionResult, ExecutionError interfaces
    - Create `src/lib/types/credential.ts` — Credential, CredentialWithData, CredentialSchema, CredentialSchemaField interfaces
    - Create `src/lib/types/node-registry.ts` — NodeTypeDefinition, NodeCategory, PortDefinition, NodePropertyDefinition interfaces
    - Create `src/lib/types/api.ts` — PaginatedResponse, ApiErrorResponse, AppConfig interfaces
    - _Requirements: 46.2_

  - [x] 1.5 Configure Tauri capabilities and permissions
    - Create `src-tauri/capabilities/default.json` with permissions for HTTP, filesystem, and shell
    - Configure `tauri.conf.json` with app name, window size, and CSP
    - Verify `.env` is in `.gitignore` and `debug.log` is in `.gitignore`
    - Ensure `.env.example` exists with placeholder values and documentation comments
    - _Requirements: 1.6, 1.7, 40.9, 46.3_

  - [x] 1.6 Configure Vitest for unit and integration testing
    - Create `vitest.config.ts` with SvelteKit path aliases, test file patterns (`src/**/*.test.ts`), coverage configuration
    - Configure mock setup for Tauri invoke calls
    - Verify `npm test` runs successfully (no tests yet, but config works)
    - _Requirements: 45.5, 46.1_

- [x] 2. Tauri Rust backend commands
  - [x] 2.1 Implement .env config reader command
    - Create `src-tauri/src/commands/env.rs` with `read_env_config` command
    - Parse N8N_BASE_URL, N8N_API_KEY, DEBUG from .env file
    - Handle missing file (return descriptive error), missing keys, empty API key
    - Resolve .env path relative to resource dir with fallback to current dir
    - _Requirements: 1.1, 40.1_

  - [x] 2.2 Implement HTTP proxy command with URL allowlist
    - Create `src-tauri/src/commands/http.rs` with `http_request` command
    - Accept HttpRequest struct (method, url, body, headers), return HttpResponse (status, body, headers)
    - Validate URL starts with the allowed base URL from .env (reject all others)
    - Use shared `reqwest::Client` for connection pooling
    - Support GET, POST, PUT, PATCH, DELETE methods
    - _Requirements: 46.3_

  - [x] 2.3 Implement filesystem commands
    - Create `src-tauri/src/commands/fs.rs` with `append_log`, `write_file`, `read_file` commands
    - Implement log rotation: rename `debug.log` to `debug.log.1` when exceeding 10MB
    - _Requirements: 40.7, 40.8, 46.4_

  - [x] 2.4 Register all commands in Tauri app
    - Create `src-tauri/src/lib.rs` with `AllowedBaseUrl` managed state
    - Register `reqwest::Client` as managed state
    - Read .env config during `setup` phase to initialize AllowedBaseUrl
    - Register all commands via `invoke_handler`: http_request, read_env_config, append_log, write_file, read_file
    - Create `src-tauri/src/main.rs` entry point calling `lib::run()`
    - _Requirements: 46.3_

  - [ ]* 2.5 Write Rust unit tests for backend commands
    - Test `read_env_config`: valid .env parsing, missing file error, missing keys error, empty API key error
    - Test `http_request`: URL allowlist validation (reject URLs outside N8N_BASE_URL)
    - Test `append_log`: log writing, log rotation at 10MB boundary
    - Test `write_file` / `read_file`: basic file I/O round-trip
    - Run via `cargo test` in `src-tauri/`
    - _Requirements: 45 (Rust backend tests per design §13.8)_

- [x] 3. Checkpoint — Verify Rust backend compiles and tests pass
  - Ensure `cargo build` succeeds in `src-tauri/`
  - Ensure `cargo test` passes in `src-tauri/`
  - Ensure `npm run tauri dev` launches the app window

- [x] 4. Core infrastructure modules
  - [x] 4.1 Implement structured logger
    - Create `src/lib/core/logger.ts` per design §6.4
    - Logger class with debug, info, warn, error methods
    - Console output with `[timestamp] [LEVEL] [module]` prefix
    - File output via Tauri `append_log` invoke (fire-and-forget)
    - `setDebug(enabled)` to toggle DEBUG/INFO logging
    - When DEBUG=false, only log WARN and ERROR
    - _Requirements: 40.1, 40.2, 40.5, 40.6, 40.7_

  - [x] 4.2 Implement API client with Tauri invoke wrapper
    - Create `src/lib/api/client.ts` per design §5.1
    - `tauriHttp()` function wrapping `invoke<HttpResponse>('http_request', { request })`
    - `ApiClient` class with `initialize()` (reads env config via invoke), `request<T>()`, `get`, `post`, `put`, `patch`, `delete` methods
    - Add X-N8N-API-KEY header and Content-Type on all requests
    - Handle 401 → throw with "check API key" message
    - Handle 5xx → throw with status + body
    - Handle 4xx → throw with parsed error message
    - `paginate<T>()` method for cursor-based pagination
    - `requestInternal<T>()` for /rest/* endpoints (node registry fetch)
    - Log all requests via logger (method, URL, status, duration)
    - Export singleton `apiClient`
    - _Requirements: 1.2, 1.5, 46.3, 46.6_

  - [x] 4.3 Implement domain-specific API modules
    - Create `src/lib/api/workflows.ts` — listWorkflows, getWorkflow, createWorkflow, updateWorkflow, deleteWorkflow, activateWorkflow, deactivateWorkflow
    - Create `src/lib/api/executions.ts` — listExecutions (with status/workflowId/dateRange filters), getExecution, deleteExecution, retryExecution
    - Create `src/lib/api/credentials.ts` — listCredentials, getCredential, createCredential, updateCredential, deleteCredential, getCredentialSchema, testCredential
    - Create `src/lib/api/tags.ts` — listTags, createTag, updateTag, deleteTag
    - Create `src/lib/api/data-tables.ts` — listDataTables, createDataTable, deleteDataTable, listRows, addRow, updateRow, deleteRow, upsertRow
    - Create `src/lib/api/templates.ts` — listTemplates, getTemplate (calls n8n.io public API)
    - Create `src/lib/api/audit.ts` — runAudit (POST /audit)
    - _Requirements: 2, 5, 7, 8, 23, 24, 26, 36, 37_

  - [x] 4.4 Implement cursor-based pagination helper
    - Create `src/lib/utils/pagination.ts` per design §7.3
    - `PaginatedList<T>` class with $state items, nextCursor, loading; $derived hasMore
    - `loadInitial()`, `loadMore()`, `reset()` methods
    - Prevent concurrent loads (guard on loading state)
    - _Requirements: 46.6_

  - [x] 4.5 Implement workflow ID → name cache
    - Create `src/lib/utils/cache.ts` per design §7.4
    - `WorkflowNameCache` class with `refresh()` (paginate all workflows) and `getName(id)` (return name or raw ID)
    - _Requirements: 5.1, 46.7_

  - [x] 4.6 Implement date/number formatting utilities
    - Create `src/lib/utils/format.ts`
    - Date formatting for execution timestamps (relative "2 min ago" + absolute)
    - Duration formatting for execution times
    - _Requirements: 2.4, 5.1_

- [x] 5. Core business logic modules
  - [x] 5.1 Implement workflow parser
    - Create `src/lib/core/workflow-parser.ts` per design §6.1
    - `parseWorkflowJson(json)` → ParseResult { workflow, warnings }
    - Validate required fields: nodes array, connections object
    - Parse each node: id, name, type, typeVersion, position, parameters, credentials, disabled
    - Validate connection references (warn on dangling source/target names)
    - Handle missing optional fields with defaults (active=false, settings={}, tags=[], pinData={})
    - `ParseError` class for structural errors
    - _Requirements: 38.1, 38.2, 38.4, 25.3_

  - [x] 5.2 Implement expression parser
    - Create `src/lib/core/expression-parser.ts` per design §6.2
    - `findExpressions(value)` → ExpressionRef[] using `=\{\{(.+?)\}\}` regex
    - Classify each expression: json ($json.field), node_ref ($('NodeName').first().json), vars ($vars.key), workflow, execution, complex
    - `extractReferencedNodes(parameters)` — walk all parameter values recursively, collect unique referenced node names
    - _Requirements: 39.1, 39.2, 39.3_

  - [x] 5.3 Implement node type registry
    - Create `src/lib/core/node-registry.ts` per design §6.3
    - `NodeTypeRegistry` class with $state types Map, $state loaded
    - `initialize()` — load bundled static JSON first, then attempt fetch from /rest/nodes
    - `get(type, version?)` — lookup by type+version key, or find highest version
    - `getByCategory(category)` — filter by NodeCategory
    - `search(query)` — fuzzy match on displayName and type identifier
    - _Requirements: 44.1, 44.2, 44.3, 44.4, 44.5_

  - [x] 5.4 Create bundled static node registry JSON
    - Create `src/static/node-registry.json` covering all test workflow node types: manualTrigger, set (v3.4), executeWorkflow (v1.2), executeWorkflowTrigger (v1.1), code (v2), splitInBatches (v3), n8nDataTable (v1), chainLlm (v1.4), lmChatOpenAi (v1), outputParserStructured (v1.2)
    - Include displayName, icon, category, version, inputs, outputs, properties, credentials for each
    - _Requirements: 44.2_

  - [x] 5.5 Implement connection resolver
    - Create `src/lib/core/connection-resolver.ts`
    - Validate all connections: source and target nodes exist in node list
    - Identify connection types: main, ai_languageModel, ai_outputParser, ai_agent, ai_memory, ai_tool, ai_vectorStore, ai_embedding
    - _Requirements: 38.2.5, 38.2.6_

  - [x] 5.5b Implement update-node-registry script
    - Create `scripts/update-node-registry.ts` (or .js) that fetches node type definitions from a running n8n instance (`GET /rest/nodes`)
    - Transform the response into the bundled registry format and write to `src/static/node-registry.json`
    - Add `npm run update-node-registry` script to package.json
    - _Requirements: 44.6_

  - [ ]* 5.6 Write property test: Workflow round-trip (Property 1)
    - **Property 1: Workflow Round-Trip Preservation**
    - For each test workflow JSON in `test-data/workflows/`, parse → serialize → parse again
    - Assert: nodes match (id, name, type, typeVersion, position, parameters)
    - Assert: connections match (source, target, type, index)
    - Assert: settings match
    - Assert: AI connection types preserved (ai_languageModel, ai_outputParser)
    - Use Vitest with fast-check for additional random workflow generation
    - **Validates: Requirements 38.5.15, 38.5.16, 25.5, 37.5**

  - [ ]* 5.7 Write property test: Expression parser completeness (Property 2)
    - **Property 2: Expression Parser Completeness**
    - For any string containing `={{ ... }}` patterns, `findExpressions` returns exactly the set of expressions present
    - Each expression is correctly classified (json, node_ref, vars, workflow, execution, complex)
    - Referenced nodes/fields are correctly extracted
    - Use fast-check to generate random strings with embedded expression patterns
    - **Validates: Requirements 39.1, 39.2, 39.3**

  - [ ]* 5.8 Write property test: Node registry lookup consistency (Property 3)
    - **Property 3: Node Registry Lookup Consistency**
    - For any node type present in the registry, `get(type, version)` returns a definition with matching type and version
    - For any node type NOT in the registry, `get` returns undefined
    - **Validates: Requirements 44.4, 44.5**

  - [ ]* 5.9 Write property test: Pagination completeness (Property 4)
    - **Property 4: Pagination Completeness**
    - After `loadInitial()` + repeated `loadMore()` until `hasMore` is false, `items` contains all items from all pages
    - No duplicates, no gaps
    - Use fast-check to generate random paginated response sequences
    - **Validates: Requirements 46.6**

- [x] 6. Checkpoint — Core modules compile and property tests pass
  - Ensure all TypeScript compiles without errors
  - Ensure `npm test` passes for core module tests

- [x] 7. Svelte 5 rune-based stores
  - [x] 7.1 Implement theme store
    - Create `src/lib/stores/theme.svelte.ts` per design §10.1
    - ThemeStore class with $state theme ('light'|'dark'|'system'), $derived resolvedTheme
    - `setTheme()` — persist to localStorage, toggle `dark` class on `<html>`
    - Listen to `prefers-color-scheme` media query for system theme
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 7.2 Implement connection status store
    - Create `src/lib/stores/connection.svelte.ts` per design §7.2
    - ConnectionStore class with $state status, lastSuccessfulCheck, retryCount
    - $derived isConnected
    - `checkConnection()` — GET /workflows?limit=1, update status
    - Auto-retry every 10 seconds when disconnected
    - `stopRetry()` on reconnection
    - _Requirements: 14.2, 14.3, 34.1, 34.5_

  - [x] 7.3 Implement app state store
    - Create `src/lib/stores/app.svelte.ts`
    - AppStore class with $state config (AppConfig), $state initialized, $state debug
    - `initialize()` — read env config, init API client, check connection, init node registry, set debug flag on logger
    - _Requirements: 1.1, 1.3, 40.1_

  - [x] 7.4 Implement workflow list store
    - Create `src/lib/stores/workflows.svelte.ts`
    - Use PaginatedList<Workflow> for paginated workflow fetching
    - $state searchQuery, $state selectedTags for filtering
    - $derived filteredWorkflows (client-side filter by search + tags)
    - _Requirements: 2.1, 2.2, 2.5, 2.8_

  - [x] 7.5 Implement executions store
    - Create `src/lib/stores/executions.svelte.ts`
    - Use PaginatedList<Execution> for paginated execution fetching
    - $state statusFilter, workflowFilter, dateRangeFilter
    - Resolve workflow names via workflowNameCache
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 7.6 Implement credentials store
    - Create `src/lib/stores/credentials.svelte.ts`
    - Use PaginatedList<Credential> for paginated credential fetching
    - _Requirements: 7.1, 7.9_

  - [x] 7.7 Implement tags store
    - Create `src/lib/stores/tags.svelte.ts`
    - $state tags array, CRUD operations via tags API
    - _Requirements: 23.1, 23.2, 23.3, 23.6_

  - [x] 7.8 Implement data tables store
    - Create `src/lib/stores/data-tables.svelte.ts`
    - Use PaginatedList<DataTable> for table list
    - Row management with pagination for individual table views
    - _Requirements: 24.1, 24.7_

  - [x] 7.9 Implement canvas store
    - Create `src/lib/stores/canvas.svelte.ts` per design §4.3
    - CanvasStore class with $state nodes, edges, selectedNodeId, workflowId, workflowName, workflowActive, workflowTags, workflowSettings, isDirty, executionStatus
    - $derived selectedNode
    - `loadWorkflow(id)` — fetch workflow, parse, convert to Svelte Flow nodes/edges
    - `saveWorkflow()` — convert back to n8n JSON, PUT to API
    - `activateWorkflow()`, `deactivateWorkflow()`, `executeWorkflow()` (with public API → internal REST fallback)
    - `addNode()`, `removeNode()`, `addEdge()`, `removeEdge()`, `addStickyNote()`
    - _Requirements: 3.1, 3.5, 3.9, 36.1, 36.2, 37.2_

  - [x] 7.10 Implement node panel store
    - Create `src/lib/stores/node-panel.svelte.ts`
    - $state selectedNode, activeTab ('parameters'|'settings'|'input'|'output')
    - _Requirements: 4.1_

  - [x] 7.11 Implement Svelte Flow node/edge mapping functions
    - Create mapping functions in canvas store or separate utility
    - `workflowNodeToFlowNode(node, registry)` — map WorkflowNode to SvelteFlowNode with custom type detection (customNode, triggerNode, clusterNode)
    - `workflowConnectionsToEdges(connections)` — map WorkflowConnections to SvelteFlowEdge[] with proper source/target handles
    - `flowNodesToWorkflowNodes(nodes)` — reverse mapping for save
    - `edgesToWorkflowConnections(edges)` — reverse mapping for save
    - _Requirements: 3.1, 3.8, 38.2.4, 38.2.5_

  - [ ]* 7.12 Write property test: Canvas mapping bijection (Property 5)
    - **Property 5: Canvas Mapping Bijection**
    - Converting workflow nodes/connections to Svelte Flow nodes/edges and back produces equivalent workflow structure
    - No information lost in either direction
    - Test with all 4 test workflow JSON files
    - **Validates: Requirements 38.2.4, 38.2.5, 38.5.15**

  - [ ]* 7.13 Write property test: Connection validation (Property 6)
    - **Property 6: Connection Validation — No Dangling References**
    - For any connection in a workflow, both source and target nodes exist in the workflow's node list
    - Test with all 4 test workflow JSON files
    - **Validates: Requirements 38.2.5**

  - [ ]* 7.14 Write property test: Workflow name cache consistency (Property 7)
    - **Property 7: Workflow Name Cache Consistency**
    - After `refresh()`, for every workflow returned by the API, `getName(workflowId)` returns the correct name
    - For unknown IDs, returns the raw ID
    - Use fast-check to generate random workflow lists
    - **Validates: Requirements 5.1, 46.7**

- [x] 8. App shell, layout, and navigation
  - [x] 8.1 Implement app shell component
    - Create `src/lib/components/layout/Shell.svelte`
    - Layout: ConnectionBanner (top, conditional) + Sidebar (left) + main content slot + ErrorNotification area (bottom-right toast stack)
    - _Requirements: 29, 30.3, 34.1_

  - [x] 8.2 Implement sidebar navigation
    - Create `src/lib/components/layout/Sidebar.svelte`
    - Navigation items from static config: Overview, Workflows, Credentials, Templates, Data Tables, Executions, Settings
    - Phase 2 items (Variables, Insights, Projects) shown with lock icon, non-clickable
    - Highlight active route via SvelteKit `$page` store
    - Display connected n8n instance URL at top
    - Collapsible mode (icons only), persist collapse state in localStorage
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5_

  - [x] 8.3 Implement root layout with app initialization
    - Update `src/routes/+layout.svelte` to render Shell component
    - On mount: call appStore.initialize() → read env → init API client → check connection → init node registry
    - If .env missing or API key empty → redirect to `/error` page
    - If connection OK → proceed to requested route
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 8.4 Implement error screen for .env issues
    - Create `src/routes/error/+page.svelte`
    - Display error message with instructions to configure .env file
    - Show .env.example format reference
    - _Requirements: 1.4_

  - [x] 8.5 Implement common UI components
    - Create `src/lib/components/common/SearchInput.svelte` — text input with debounced filtering (300ms)
    - Create `src/lib/components/common/TagPill.svelte` — colored tag label
    - Create `src/lib/components/common/StatusBadge.svelte` — execution status indicator (success/error/running/waiting)
    - Create `src/lib/components/common/LoadMore.svelte` — "Load More" button or infinite scroll trigger
    - Create `src/lib/components/common/ConfirmDialog.svelte` — destructive action confirmation modal
    - Create `src/lib/components/common/ErrorNotification.svelte` — toast notification with severity icon, message, optional retry, auto-dismiss (8s for non-errors)
    - Create `src/lib/components/common/ConnectionBanner.svelte` — top banner "n8n instance unreachable. Retrying..."
    - Create `src/lib/components/common/DataTable.svelte` — reusable sortable data table component
    - _Requirements: 2.5, 34.1, 34.2, 34.5_

  - [x] 8.6 Implement top bar component for workflow editor
    - Create `src/lib/components/layout/TopBar.svelte`
    - Editable workflow name, tags selector, Save button, Publish/Activate toggle, Share button (disabled Phase 1), History button (disabled Phase 1)
    - _Requirements: 3.2_

- [x] 9. Checkpoint — App shell renders with sidebar navigation
  - Ensure the app launches, shows sidebar, navigates between placeholder pages
  - Ensure theme toggle works (light/dark/system)
  - Ensure .env error screen shows when credentials missing

- [x] 10. Overview page with tabs
  - [x] 10.1 Implement Overview page with Workflows tab
    - Create `src/routes/overview/+page.svelte`
    - Three tabs: Workflows, Credentials, Executions
    - Workflows tab: list from workflowsStore with name, status (active/inactive), tags, last updated, created date
    - Search input filtering by name
    - Tag-based filtering (multi-select)
    - "Create Workflow" button → navigate to `/workflows/new`
    - Click workflow row → navigate to `/workflows/[id]`
    - Cursor-based pagination via LoadMore component
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 10.2 Implement Overview Credentials tab
    - Credentials tab: list from credentialsStore with name and type
    - Search input filtering by name
    - Cursor-based pagination
    - _Requirements: 2.3, 2.9_

  - [x] 10.3 Implement Overview Executions tab
    - Executions tab: list from executionsStore with workflow name (resolved from cache), started-at, status badge, execution ID
    - Search input filtering
    - Cursor-based pagination
    - _Requirements: 2.4, 2.9_

- [x] 11. Workflow canvas editor
  - [x] 11.1 Implement WorkflowCanvas component with Svelte Flow
    - Create `src/lib/components/canvas/WorkflowCanvas.svelte`
    - Wrap `<SvelteFlow>` with nodes, edges, custom node types, custom edge type
    - Gray dotted grid background
    - Register custom node types: customNode, triggerNode, clusterNode
    - Register custom edge type: customEdge
    - Handle onNodesChange, onEdgesChange, onConnect events → update canvasStore
    - _Requirements: 3.1, 3.5, 3.8_

  - [x] 11.2 Implement CustomNode component
    - Create `src/lib/components/canvas/CustomNode.svelte`
    - Rounded rectangle with icon + node name
    - Input port(s) on left, output port(s) on right
    - Hover actions: execute (play), toggle active/disabled (power), delete (trash), more (ellipsis)
    - Show execution status overlay (green check / red X / spinner)
    - _Requirements: 3.6, 3.10_

  - [x] 11.3 Implement TriggerNode component
    - Create `src/lib/components/canvas/TriggerNode.svelte`
    - Same as CustomNode but with lightning bolt indicator
    - No input port (triggers are entry points)
    - _Requirements: 3.12_

  - [x] 11.4 Implement ClusterNode component for AI/LangChain nodes
    - Create `src/lib/components/canvas/ClusterNode.svelte`
    - Specialized ports: ai_languageModel, ai_outputParser, ai_agent, ai_memory, ai_tool, ai_vectorStore, ai_embedding
    - Ports rendered at specific positions (bottom for sub-connections)
    - Visual grouping indicator for connected AI sub-nodes
    - _Requirements: 33.1, 33.2, 33.3, 38.2.6_

  - [x] 11.5 Implement CustomEdge component
    - Create `src/lib/components/canvas/CustomEdge.svelte`
    - Connection line renderer with data flow direction indication
    - Support main and AI-specific connection types with visual differentiation
    - _Requirements: 3.8, 38.2.5_

  - [x] 11.6 Implement StickyNote component
    - Create `src/lib/components/canvas/StickyNote.svelte`
    - Text annotation on canvas, editable, resizable
    - _Requirements: 3.11_

  - [x] 11.7 Implement CanvasControls component
    - Create `src/lib/components/canvas/CanvasControls.svelte`
    - Buttons: zoom-to-fit, zoom-in, zoom-out, reset-zoom, tidy-up-nodes
    - _Requirements: 3.3_

  - [x] 11.8 Implement NodeSelector panel
    - Create `src/lib/components/canvas/NodeSelector.svelte`
    - Slide-in panel triggered by "+" button on canvas
    - Search input with debounced filtering (300ms)
    - Categories from nodeRegistry.getByCategory(): Advanced AI, Actions in an App, Data transformation, Flow, Core, Human in the loop
    - Collapsible category sections with icon + displayName + description per node type
    - Click node type → add to canvas center; drag → place at drop position
    - _Requirements: 3.4_

  - [x] 11.9 Implement workflow canvas page
    - Create `src/routes/workflows/[id]/+page.svelte`
    - Compose: TopBar + TabBar (Editor | Executions) + WorkflowCanvas + NodeSelector + NodeConfigPanel
    - On mount: canvasStore.loadWorkflow(id) → fetch, parse, convert to Svelte Flow
    - Save button → canvasStore.saveWorkflow()
    - Activate/Deactivate toggle → canvasStore.activateWorkflow() / deactivateWorkflow()
    - Execute button → canvasStore.executeWorkflow() with public API → internal REST fallback → user message
    - Unsaved changes guard via SvelteKit `beforeNavigate`
    - _Requirements: 3.1, 3.2, 3.9, 3.10, 36.1, 36.2, 36.3, 36.4, 37.2, 37.4_

  - [x] 11.10 Implement new workflow page
    - Create `src/routes/workflows/new/+page.svelte`
    - Empty canvas with "Add first step" placeholder prompting Trigger_Node
    - No API call until first node added or Save clicked → POST /workflows
    - On creation success → `goto('/workflows/{newId}')`
    - Navigate away without saving + no nodes → no API call
    - _Requirements: 3.12, 37.1_

  - [x] 11.11 Implement keyboard shortcuts
    - Register shortcuts in canvas page via `onMount` + `window.addEventListener('keydown')`
    - Ctrl/Cmd+S → save, Delete/Backspace → delete selected, Ctrl/Cmd+Z → undo, Ctrl/Cmd+Shift+Z → redo
    - Ctrl/Cmd+A → select all, Ctrl/Cmd+C → copy, Ctrl/Cmd+V → paste, Ctrl/Cmd+D → duplicate
    - Escape → deselect/close panel, Space+drag → pan
    - Clean up on `onDestroy`
    - _Requirements: 3 (design §4.10)_

  - [x] 11.12 Implement execution polling and status updates
    - After triggering workflow execution (POST), receive execution ID from response
    - Poll `GET /executions/{id}` at 1-second intervals until status is terminal (success, error, canceled)
    - During polling: update canvasStore.executionStatus per node to 'running'
    - On completion: update each node's status to 'success' or 'error' based on execution data
    - Show green checkmark on successful nodes, red X on failed nodes
    - Display execution results in node Input/Output tabs
    - Handle polling timeout (max 5 minutes) with user notification
    - _Requirements: 3.9, 3.10_

- [x] 12. Node configuration panel
  - [x] 12.1 Implement NodeConfigPanel component
    - Create `src/lib/components/panels/NodeConfigPanel.svelte`
    - Right-side slide-in panel when node selected on canvas
    - Tabs: Parameters, Settings, Input, Output
    - Node name and type header
    - Close button → deselect node
    - _Requirements: 4.1_

  - [x] 12.2 Implement ParametersTab with dynamic form rendering
    - Create `src/lib/components/panels/ParametersTab.svelte`
    - Iterate over NodePropertyDefinition[] from node registry
    - Render appropriate input for each property type: string→text input, number→number input, boolean→toggle, options→select, collection→expandable group, fixedCollection→named group, json→JSON textarea, code→CodeEditor
    - Handle `displayOptions.show` for conditional field visibility
    - Handle `typeOptions.password` for password fields
    - Credentials section: select existing credential or create new
    - Expression mode toggle per field → switch to ExpressionEditor
    - Inline validation for required fields
    - _Requirements: 4.2, 4.3, 4.7, 4.8_

  - [x] 12.3 Implement SettingsTab
    - Create `src/lib/components/panels/SettingsTab.svelte`
    - Toggles: Retry on Fail, Continue on Fail, Always Output Data, Execute Once
    - _Requirements: 4.4_

  - [x] 12.4 Implement InputOutputTab
    - Create `src/lib/components/panels/InputOutputTab.svelte`
    - Display JSON data from most recent execution (input or output depending on tab)
    - Formatted JSON viewer with syntax highlighting
    - Show "No execution data" when no data available
    - _Requirements: 4.5, 4.6_

  - [x] 12.5 Implement ExpressionEditor component
    - Create `src/lib/components/panels/ExpressionEditor.svelte`
    - Text input with `={{ }}` syntax highlighting
    - Autocomplete dropdown: $json.*, $('NodeName').first().json.*, $vars.*, $workflow.*, $execution.*
    - Live preview of resolved value when execution data available
    - Validation: highlight syntax errors in red
    - _Requirements: 4.7, 39.4_

  - [x] 12.6 Implement CodeEditor component
    - Create `src/lib/components/panels/CodeEditor.svelte`
    - Textarea-based editor with Prism.js syntax highlighting
    - Language toggle: JavaScript / Python
    - Line numbers via CSS counter
    - Basic autocompletion for n8n helpers ($input, $json, $items())
    - Monospace font, dark theme
    - _Requirements: 32.1, 32.2, 32.3_

- [x] 13. Checkpoint — Canvas editor renders workflows from API
  - Ensure a workflow can be loaded from n8n API and rendered on canvas
  - Ensure nodes are clickable and config panel opens
  - Ensure save/activate/deactivate work

- [x] 14. Executions pages
  - [x] 14.1 Implement global executions page
    - Create `src/routes/executions/+page.svelte`
    - Table: workflow name (from cache), started-at, status badge, execution ID
    - Status filter: Any Status, Failed, Cancelled, Running, Success, Waiting
    - Workflow name filter dropdown
    - Time range filter (date picker)
    - Click row → execution detail view (node-by-node input/output JSON)
    - Retry button on failed executions
    - Delete action (single + bulk select)
    - Bulk stop action
    - Cursor-based pagination
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x] 14.2 Implement workflow-level executions tab
    - Add Executions tab content to workflow canvas page
    - List previous executions for the specific workflow (GET /executions?workflowId={id})
    - Select past execution → overlay execution data on canvas (input/output per node)
    - "Copy to Editor" action → load past execution's workflow state into canvas
    - "Re-run" action → re-execute via API
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 15. Credentials management page
  - [x] 15.1 Implement credentials list page
    - Create `src/routes/credentials/+page.svelte`
    - List all credentials: name, type
    - "Create New Credential" button
    - Cursor-based pagination
    - _Requirements: 7.1, 7.2, 7.9_

  - [x] 15.2 Implement credential form modal
    - Create `src/lib/components/modals/CredentialForm.svelte`
    - Searchable dropdown of credential types
    - On type selection: fetch schema from API → render type-specific fields
    - "Test Connection" button → validate via API, show success/failure
    - Edit mode: load current values (secrets masked)
    - Delete with confirmation
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 16. Templates page
  - [x] 16.1 Implement templates browser
    - Create `src/routes/templates/+page.svelte`
    - Browsable gallery of templates from n8n.io public API
    - Search input filtering by name/description
    - Category and use-case filters
    - Click template → detail view (description, nodes, visual preview)
    - "Use This Template" → import as new workflow in canvas editor
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 17. Data tables management
  - [x] 17.1 Implement data tables list page
    - Create `src/routes/data-tables/+page.svelte`
    - List all data tables from API
    - "Create Data Table" button → form for name + column schema
    - Delete with confirmation
    - Cursor-based pagination
    - _Requirements: 24.1, 24.2, 24.6, 24.7_

  - [x] 17.2 Implement data table row editor
    - Create `src/routes/data-tables/[id]/+page.svelte`
    - Spreadsheet-like grid view with column headers
    - Add, edit, delete rows via API
    - Upsert support
    - Cursor-based pagination for rows
    - _Requirements: 24.3, 24.4, 24.5, 24.7_

- [x] 18. Settings pages
  - [x] 18.1 Implement preferences/theme settings page
    - Create `src/routes/settings/preferences/+page.svelte`
    - Theme selector: light, dark, system-default
    - Apply theme immediately on change
    - Display connected n8n instance URL (read-only from .env)
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 18.2 Implement connection status page
    - Create `src/routes/settings/connection/+page.svelte`
    - Display N8N_BASE_URL (read-only)
    - Connection status indicator (connected/disconnected)
    - "Test Connection" button → GET /workflows?limit=1
    - Instructions for updating credentials via .env file
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 18.3 Implement tags management page
    - Create `src/routes/settings/tags/+page.svelte`
    - List all tags
    - Create new tag (name input)
    - Rename existing tag (inline edit)
    - Delete tag with confirmation (removes from all workflows)
    - Cursor-based pagination
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

  - [x] 18.4 Implement security audit page
    - Create `src/routes/settings/audit/+page.svelte`
    - "Run Security Audit" button → POST /audit
    - Display results organized by risk category with descriptions and remediation recommendations
    - _Requirements: 26.1, 26.2, 26.3_

  - [x] 18.5 Implement settings index page
    - Create `src/routes/settings/+page.svelte`
    - Links to: Preferences, Connection, Tags, Security Audit
    - Phase 2 settings (Users, LDAP, SAML, Log Streaming, External Secrets, Source Control) shown with lock icon
    - _Requirements: 29.1_

- [x] 19. Workflow operations
  - [x] 19.1 Implement workflow settings modal
    - Create `src/lib/components/modals/WorkflowSettings.svelte`
    - Execution order selector (v1 recommended, v0 legacy)
    - Error workflow selector dropdown
    - "This workflow can be called by" permission selector
    - Timezone selector
    - Toggles: save failed executions, save successful executions, save manual executions, save execution progress
    - Timeout configuration (seconds)
    - Estimated time saved (Fixed/Dynamic)
    - Save → PUT /workflows/{id}
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 21.10_

  - [x] 19.2 Implement workflow import/export
    - Create `src/lib/components/modals/ImportExport.svelte`
    - Export: download workflow JSON via Tauri write_file
    - Import: accept JSON file, validate structure via workflow parser, POST /workflows
    - Show validation errors for invalid JSON
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

  - [x] 19.3 Implement workflow delete with confirmation
    - Add delete action to workflow list (Overview) and workflow editor
    - ConfirmDialog before DELETE /workflows/{id}
    - _Requirements: 37.3_

  - [x] 19.4 Implement webhook URL display in node config
    - When a Webhook Trigger node is selected, display generated webhook URL
    - Copy-to-clipboard action
    - Show production URL when workflow active, test URL when in test mode
    - _Requirements: 31.1, 31.2, 31.3, 31.4_

- [x] 20. Error handling and offline behavior
  - [x] 20.1 Implement error notification system
    - Wire ErrorNotification component into Shell layout
    - Toast stack in bottom-right: severity icon, message, optional retry button
    - Auto-dismiss after 8 seconds (errors persist until manually dismissed)
    - _Requirements: 34.2, 34.3_

  - [x] 20.2 Implement connection loss detection and retry
    - Wire ConnectionBanner into Shell layout
    - Show banner when connectionStore.status === 'disconnected'
    - Auto-retry every 10 seconds
    - Dismiss banner on reconnection, refresh current view
    - _Requirements: 34.1, 34.5_

  - [x] 20.3 Implement cached data read-only mode
    - When disconnected, allow viewing previously loaded data (workflow list, executions)
    - Disable write operations (save, create, delete) with "offline" indicator
    - _Requirements: 34.4_

  - [x] 20.4 Implement 401 handling
    - On 401 response, show error notification: "Unauthorized — check your API key in .env"
    - _Requirements: 1.5, 34.6_

  - [x] 20.5 Implement unsaved changes guard
    - In workflow canvas page, use SvelteKit `beforeNavigate` hook
    - When canvasStore.isDirty, show ConfirmDialog: "You have unsaved changes. Discard?"
    - _Requirements: 37.4_

  - [x] 20.6 Implement route-level error pages
    - Create `+error.svelte` pages for route groups
    - User-friendly error message with "Go to Overview" link
    - Global unhandled error handler (window.onerror, window.onunhandledrejection) → log + toast
    - _Requirements: 34 (design §11.4)_

- [x] 21. Checkpoint — All Phase 1 pages functional
  - Ensure all Phase 1 pages render with live data from n8n API
  - Ensure CRUD operations work for workflows, credentials, tags, data tables
  - Ensure error handling and offline behavior work correctly

- [ ] 22. Unit tests for core modules
  - [ ]* 22.1 Write unit tests for API client
    - Test header construction (X-N8N-API-KEY present)
    - Test URL building (/api/v1 prefix)
    - Test error handling: 401 → "check API key", 5xx → server error, network error
    - Test pagination cursor handling
    - Use mock Tauri invoke responses
    - _Requirements: 45.1_

  - [ ]* 22.2 Write unit tests for workflow parser
    - Parse all 4 test workflow JSON files successfully
    - Verify correct node extraction (count, id, name, type, typeVersion, position)
    - Verify connection mapping including AI-specific types (ai_languageModel, ai_outputParser)
    - Verify settings parsing (executionOrder: "v1")
    - Test malformed JSON handling (missing nodes, missing connections, invalid types)
    - Test handling of empty pinData, null staticData, empty meta.instanceId
    - _Requirements: 45.2, 38.1, 38.4.13, 38.4.14_

  - [ ]* 22.3 Write unit tests for expression parser
    - Test findExpressions with all expression types from test workflows
    - Test $json.field references
    - Test $('NodeName').first().json references
    - Test $vars.key references
    - Test complex expressions (e.g., `={{ JSON.stringify($json) }}`)
    - Test edge cases: empty strings, no expressions, nested expressions
    - _Requirements: 45.3, 39.1, 39.2, 39.3_

  - [ ]* 22.4 Write unit tests for node type registry
    - Test lookup by type+version returns correct definition
    - Test lookup for highest version when version not specified
    - Test fallback: unknown type returns undefined
    - Test category filtering
    - Test search by displayName and type identifier
    - _Requirements: 45.4_

  - [ ]* 22.5 Write unit tests for pagination helper
    - Test loadInitial populates items and nextCursor
    - Test loadMore appends items
    - Test hasMore is false when no nextCursor
    - Test concurrent load prevention
    - Test reset clears state
    - _Requirements: 45.5_

  - [ ]* 22.6 Write unit tests for workflow name cache
    - Test refresh populates cache from paginated API
    - Test getName returns correct name for known IDs
    - Test getName returns raw ID for unknown IDs
    - _Requirements: 45.1_

- [ ] 23. Integration tests
  - [ ]* 23.1 Write integration test: workflow round-trip for all test files
    - For each JSON in `test-data/workflows/`: import → parse → serialize → compare
    - Verify equivalent nodes (id, name, type, typeVersion, position, parameters)
    - Verify equivalent connections including AI types
    - _Requirements: 45.6, 38.5.15, 38.5.16_

  - [ ]* 23.2 Write integration test: canvas mapping for all test files
    - Parse each test workflow → convert to Svelte Flow nodes/edges
    - Verify correct node count, positions, custom node type assignment
    - Verify correct edge count and connection types
    - Verify ClusterNode assignment for AI nodes (chainLlm, lmChatOpenAi, outputParserStructured)
    - _Requirements: 38.2.4, 38.2.5, 38.2.6, 38.2.7_

  - [ ]* 23.3 Write integration test: expression extraction from test workflows
    - Parse all test workflows → extract all expressions from all node parameters
    - Verify all `={{ }}` patterns found
    - Verify correct classification of each expression
    - Verify referenced node names extracted correctly
    - _Requirements: 39.1, 39.2, 39.3_

  - [ ]* 23.4 Write integration test: test workflow node type coverage
    - Verify all node types in test data are present in bundled registry: manualTrigger, set, executeWorkflow, executeWorkflowTrigger, code, splitInBatches, n8nDataTable, chainLlm, lmChatOpenAi, outputParserStructured
    - _Requirements: 38.1.3, 44.2_

- [x] 24. Checkpoint — All unit and integration tests pass
  - Ensure `npm test` passes all unit and integration tests
  - Ensure `cargo test` passes all Rust backend tests

- [ ] 25. Visual and E2E tests (Playwright)
  - [ ]* 25.1 Set up Playwright test infrastructure
    - Configure Playwright for Tauri app testing
    - Set up screenshot directory `test-results/screenshots/`
    - Configure screenshot naming convention: `{test-scenario}_{screen-name}_{timestamp}.png`
    - Set up HTML report generation at `test-results/visual-report.html`
    - Add `test-results/` to `.gitignore`
    - Configure `npm run test:visual` command
    - _Requirements: 41.1.1, 41.1.2, 41.5.12, 41.5.13, 41.5.14_

  - [ ]* 25.2 Write E2E test: import and render test workflows
    - For each JSON in `test-data/workflows/`: import workflow, screenshot overview page
    - Open each workflow in canvas editor, screenshot full canvas
    - Click each node, screenshot config panel
    - Open workflow settings modal, screenshot
    - _Requirements: 41.2.4, 41.2.5, 41.2.6, 41.2.7_

  - [ ]* 25.3 Write E2E test: execution flow
    - For workflows with Manual Trigger: click Execute, screenshot in-progress, screenshot complete, screenshot execution detail
    - Navigate to global executions page, screenshot
    - _Requirements: 41.3.8, 41.3.9_

  - [ ]* 25.4 Write E2E test: screen coverage
    - Navigate to each Phase 1 screen, screenshot each: Overview, Credentials, Templates, Data Tables, Tags, Settings > Preferences, Settings > Connection, Security Audit
    - _Requirements: 41.4.10_

  - [ ]* 25.5 Write E2E test: error states
    - Use mock HTTP responses to simulate: 401 (invalid API key), 500 (server error), connection timeout
    - Screenshot each error state
    - Do NOT stop/restart actual n8n instance
    - _Requirements: 41.4.11_

  - [ ]* 25.6 Write functional assertions in E2E tests
    - Verify workflow list count after import
    - Verify node config panel shows correct node name/type
    - Verify execution status matches expected outcome
    - Verify sidebar navigation items present and clickable
    - _Requirements: 41.6.15, 41.6.16_

  - [ ]* 25.7 Set up visual baseline management
    - Configure `npm run test:update-baselines` command
    - Save baseline screenshots to `test-data/baselines/`
    - Configure 2% diff threshold for pixel comparison
    - Commit baselines to git
    - _Requirements: 43.1, 43.2, 43.3, 43.4, 43.5_

- [ ]* 25b. Self-healing test loop (Req 42)
  - [ ]* 25b.1 Implement failure detection
    - After each test run, compare screenshots against baselines (image diff with pixelmatch)
    - Analyze debug.log for ERROR-level entries (message, module, stack trace)
    - Produce `test-results/failure-report.json`: screenshot mismatches (diff %, diff image), log errors, failed assertions
    - _Requirements: 42.1.1, 42.1.2, 42.1.3_

  - [ ]* 25b.2 Implement AI-powered diagnosis
    - When failures detected, send failure report to AI analysis step
    - Examine failed screenshots + debug log entries → produce diagnosis
    - Check for usability issues: misaligned components, overlapping elements, broken layouts, contrast issues
    - Output `test-results/diagnosis.json`: failures[] (type, screen, description, source_file, proposed_fix) + usability_issues[]
    - _Requirements: 42.2.4, 42.2.5, 42.2.6, 42.2.7_

  - [ ]* 25b.3 Implement automated fix cycle
    - For each diagnosed failure with proposed fix, apply fix to source code
    - Only modify files matching `src/**/*.{ts,tsx,js,jsx,css,scss}` — never .env, .gitignore, package.json, or files outside src/
    - Reject fixes that add dependencies or modify build config
    - Git commit before each fix iteration
    - Rebuild app and re-run full visual test suite
    - Repeat (test → diagnose → fix → re-test) max 5 iterations
    - Stop on all-pass or iteration limit
    - _Requirements: 42.3.8, 42.3.9, 42.3.10, 42.3.11, 42.3.12, 42.3.13, 42.3.14, 42.3.15_

  - [ ]* 25b.4 Implement usability review
    - On each test run, review screenshots for: visual hierarchy, typography, target sizes, tab order, contrast, n8n design alignment
    - Produce `test-results/usability-report.json` (critical, major, minor, suggestion)
    - Critical/major issues treated as failures in fix cycle
    - _Requirements: 42.4.13, 42.4.14, 42.4.15_

  - [ ]* 25b.5 Implement audit trail
    - Maintain `test-results/heal-log.json`: each iteration with timestamp, failures found, fixes applied, results after fix, resolution status
    - _Requirements: 42.5.16, 42.5.17_

- [x] 26. Phase 2 enterprise feature stubs
  - [x] 26.1 Implement Variables management stub (Req 9)
    - Create route `/settings/variables` with "Enterprise feature — requires license" message
    - Show mock UI layout matching wireframe
    - _Requirements: 9_

  - [x] 26.2 Implement Insights dashboard stub (Req 10)
    - Create route `/insights` with enterprise license message
    - Show mock summary banner and chart placeholders
    - _Requirements: 10_

  - [x] 26.3 Implement Projects management stub (Req 11)
    - Create route `/projects` with enterprise license message
    - _Requirements: 11_

  - [x] 26.4 Implement Users management stub (Req 13)
    - Create route `/settings/users` with enterprise license message
    - _Requirements: 13_

  - [x] 26.5 Implement LDAP settings stub (Req 15)
    - Create route `/settings/ldap` with enterprise license message
    - _Requirements: 15_

  - [x] 26.6 Implement SAML/SSO settings stub (Req 16)
    - Create route `/settings/saml` with enterprise license message
    - _Requirements: 16_

  - [x] 26.7 Implement Log Streaming settings stub (Req 17)
    - Create route `/settings/log-streaming` with enterprise license message
    - _Requirements: 17_

  - [x] 26.8 Implement External Secrets settings stub (Req 18)
    - Create route `/settings/external-secrets` with enterprise license message
    - _Requirements: 18_

  - [x] 26.9 Implement Source Control settings stub (Req 20)
    - Create route `/settings/source-control` with enterprise license message
    - _Requirements: 20_

  - [x] 26.10 Implement Workflow History stub (Req 22)
    - History button in canvas TopBar shows enterprise license message
    - _Requirements: 22_

  - [x] 26.11 Implement Sharing dialog stub (Req 27)
    - Share button in canvas TopBar shows enterprise license message
    - _Requirements: 27_

  - [x] 26.12 Implement AI Assistant panel stub (Req 28)
    - "Ask Assistant" button shows enterprise license message
    - _Requirements: 28_

- [x] 27. Final checkpoint — Complete application
  - Ensure all Phase 1 features are functional with live n8n API
  - Ensure all Phase 2 stubs render with enterprise license messages
  - Ensure `npm test` passes all unit, integration, and property tests
  - Ensure `cargo test` passes all Rust backend tests
  - Ensure `npm run tauri dev` launches the complete application

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests (Properties 1-7) validate universal correctness properties from design §13
- Rust backend tests validate .env parsing, URL allowlist, and filesystem operations
- Unit tests use mock data — no live n8n instance required
- E2E/visual tests require a running n8n instance on localhost:5678
- Phase 3 features (Req 12 profile, Req 14 API keys, Req 19 community nodes) are deferred — not included in this plan
