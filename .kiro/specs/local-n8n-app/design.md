# Technical Design Document — Local n8n App

## 1. Overview

This document defines the technical architecture and detailed design for the Local n8n App — a Tauri 2 desktop application that replicates the n8n.com workflow automation UI. The app connects to a self-hosted n8n instance via API key and provides a complete visual workflow editor, execution management, credential management, and all supporting features defined in the 46 requirements.

### 1.1 System Context

```
┌─────────────────────────────────────────────────────────┐
│                    User's Desktop                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Tauri 2 Application                    │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │          System WebView (WebKit)              │  │  │
│  │  │  ┌────────────────────────────────────────┐  │  │  │
│  │  │  │        SvelteKit Static SPA            │  │  │  │
│  │  │  │  ┌──────────┐  ┌──────────────────┐   │  │  │  │
│  │  │  │  │  Svelte  │  │  App Components  │   │  │  │  │
│  │  │  │  │  Flow    │  │  (Pages, Panels, │   │  │  │  │
│  │  │  │  │  Canvas  │  │   Modals, etc.)  │   │  │  │  │
│  │  │  │  └──────────┘  └──────────────────┘   │  │  │  │
│  │  │  │  ┌────────────────────────────────┐   │  │  │  │
│  │  │  │  │  Stores (Svelte 5 Runes)       │   │  │  │  │
│  │  │  │  └────────────────────────────────┘   │  │  │  │
│  │  │  │  ┌────────────────────────────────┐   │  │  │  │
│  │  │  │  │  API Client (Tauri invoke)     │   │  │  │  │
│  │  │  │  └────────────────────────────────┘   │  │  │  │
│  │  │  └────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │           Rust Backend                        │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │  │  │
│  │  │  │  HTTP    │ │  File    │ │  Env Config  │  │  │  │
│  │  │  │  Proxy   │ │  System  │ │  Reader      │  │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────────┘  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                          │                                │
│                          │ HTTP (localhost, no CORS)      │
│                          ▼                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │         n8n Instance (localhost:5678)                │  │
│  │         Public API: /api/v1/*                       │  │
│  │         Internal API: /rest/* (Phase 3)             │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API proxy | Tauri Rust HTTP commands | Bypasses CORS; API key never exposed to webview JS |
| State management | Svelte 5 runes ($state, $derived, $effect) | No external lib needed; fine-grained reactivity |
| Routing | SvelteKit file-based routing | Convention over configuration; adapter-static for Tauri |
| Canvas | @xyflow/svelte (Svelte Flow) | Native Svelte 5; full feature parity with React Flow |
| Styling | Tailwind CSS 4 | Utility-first; purged in production; dark/light themes |
| File I/O | Tauri filesystem plugin | debug.log writing, JSON export, .env reading |
| Node registry | Bundled static JSON + runtime fetch fallback | Works offline; updated via npm script |

## 2. High-Level Architecture

### 2.1 Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                  │
│  SvelteKit Pages, Svelte Components, Svelte Flow     │
│  Tailwind CSS, Theme System                          │
├─────────────────────────────────────────────────────┤
│                   Application Layer                   │
│  Stores (Runes), Actions, Business Logic             │
│  Expression Parser, Workflow Parser, Node Registry   │
├─────────────────────────────────────────────────────┤
│                   Infrastructure Layer                │
│  API Client (Tauri invoke), Logger, File Service     │
│  Cache Manager, Pagination Handler                   │
├─────────────────────────────────────────────────────┤
│                   Tauri Rust Backend                  │
│  HTTP Proxy Commands, Filesystem Commands            │
│  Env Config Reader                                   │
└─────────────────────────────────────────────────────┘
```

### 2.2 Directory Structure

```
src/
├── lib/
│   ├── api/                    # API client and types
│   │   ├── client.ts           # Core HTTP client (Tauri invoke wrapper)
│   │   ├── workflows.ts        # Workflow API functions
│   │   ├── executions.ts       # Execution API functions
│   │   ├── credentials.ts      # Credential API functions
│   │   ├── tags.ts             # Tag API functions
│   │   ├── data-tables.ts      # Data table API functions
│   │   ├── templates.ts        # Template API functions
│   │   ├── audit.ts            # Security audit API
│   │   └── types.ts            # API request/response types
│   ├── stores/                 # Svelte 5 rune-based stores
│   │   ├── workflows.svelte.ts # Workflow list + cache store
│   │   ├── executions.svelte.ts# Execution list store
│   │   ├── credentials.svelte.ts# Credential list store
│   │   ├── tags.svelte.ts      # Tags store
│   │   ├── data-tables.svelte.ts# Data tables store
│   │   ├── canvas.svelte.ts    # Canvas state (nodes, edges, viewport)
│   │   ├── node-panel.svelte.ts# Node config panel state
│   │   ├── theme.svelte.ts     # Theme preference store
│   │   ├── connection.svelte.ts# Connection status store
│   │   └── app.svelte.ts       # Global app state (debug, config)
│   ├── components/             # Reusable Svelte components
│   │   ├── layout/
│   │   │   ├── Sidebar.svelte  # Left sidebar navigation
│   │   │   ├── TopBar.svelte   # Workflow editor top bar
│   │   │   └── Shell.svelte    # App shell (sidebar + content)
│   │   ├── canvas/
│   │   │   ├── WorkflowCanvas.svelte  # Svelte Flow wrapper
│   │   │   ├── CustomNode.svelte      # Base custom node renderer
│   │   │   ├── TriggerNode.svelte     # Trigger node variant
│   │   │   ├── ClusterNode.svelte     # AI/LangChain node variant
│   │   │   ├── StickyNote.svelte      # Sticky note on canvas
│   │   │   ├── CustomEdge.svelte      # Connection line renderer
│   │   │   ├── NodeSelector.svelte    # Add-node search panel
│   │   │   └── CanvasControls.svelte  # Zoom/fit/tidy controls
│   │   ├── panels/
│   │   │   ├── NodeConfigPanel.svelte # Right-side node config
│   │   │   ├── ParametersTab.svelte   # Dynamic parameter form
│   │   │   ├── SettingsTab.svelte     # Node settings tab
│   │   │   ├── InputOutputTab.svelte  # Input/Output data display
│   │   │   ├── ExpressionEditor.svelte# {{ }} expression editor
│   │   │   └── CodeEditor.svelte      # Code node editor
│   │   ├── common/
│   │   │   ├── DataTable.svelte       # Reusable data table
│   │   │   ├── SearchInput.svelte     # Search with debounce
│   │   │   ├── TagPill.svelte         # Tag display pill
│   │   │   ├── StatusBadge.svelte     # Status indicator
│   │   │   ├── LoadMore.svelte        # Pagination load-more
│   │   │   ├── ConfirmDialog.svelte   # Destructive action confirm
│   │   │   ├── ErrorNotification.svelte# Error toast
│   │   │   └── ConnectionBanner.svelte # Offline/reconnecting banner
│   │   └── modals/
│   │       ├── WorkflowSettings.svelte# Workflow settings modal
│   │       ├── ImportExport.svelte    # Import/export dialog
│   │       └── CredentialForm.svelte  # Credential create/edit
│   ├── core/                   # Core business logic (no UI)
│   │   ├── workflow-parser.ts  # Parse n8n workflow JSON
│   │   ├── expression-parser.ts# Parse {{ }} expressions
│   │   ├── node-registry.ts    # Node type metadata lookup
│   │   ├── connection-resolver.ts # Resolve and validate node connections
│   │   └── logger.ts           # Structured debug logger
│   ├── utils/
│   │   ├── pagination.ts       # Cursor-based pagination helper
│   │   ├── cache.ts            # ID→name cache utility
│   │   └── format.ts           # Date, number formatting
│   └── types/                  # Shared TypeScript types
│       ├── workflow.ts         # Workflow, Node, Connection types
│       ├── execution.ts        # Execution types
│       ├── credential.ts       # Credential types
│       ├── node-registry.ts    # Node type definition types
│       └── api.ts              # API response envelope types
├── routes/                     # SvelteKit file-based routes
│   ├── +layout.svelte          # Root layout (Shell + Sidebar)
│   ├── +page.svelte            # Redirect to /overview
│   ├── overview/
│   │   └── +page.svelte        # Overview with tabs
│   ├── workflows/
│   │   ├── +page.svelte        # Workflow list (alias for overview)
│   │   ├── [id]/
│   │   │   └── +page.svelte    # Workflow canvas editor
│   │   └── new/
│   │       └── +page.svelte    # New workflow canvas
│   ├── executions/
│   │   └── +page.svelte        # Global executions page
│   ├── credentials/
│   │   └── +page.svelte        # Credentials management
│   ├── templates/
│   │   └── +page.svelte        # Template browser
│   ├── data-tables/
│   │   ├── +page.svelte        # Data tables list
│   │   └── [id]/
│   │       └── +page.svelte    # Data table row editor
│   ├── settings/
│   │   ├── +page.svelte        # Settings index
│   │   ├── preferences/
│   │   │   └── +page.svelte    # Theme + app preferences
│   │   ├── connection/
│   │   │   └── +page.svelte    # Connection status
│   │   ├── tags/
│   │   │   └── +page.svelte    # Tags management
│   │   └── audit/
│   │       └── +page.svelte    # Security audit
│   └── error/
│       └── +page.svelte        # .env error screen
├── static/
│   └── node-registry.json      # Bundled node type definitions
├── app.html                    # SvelteKit HTML template
├── app.css                     # Tailwind CSS entry point
└── hooks.server.ts             # SvelteKit hooks (unused in static)

src-tauri/
├── src/
│   ├── main.rs                 # Tauri app entry point
│   ├── commands/
│   │   ├── http.rs             # HTTP proxy commands
│   │   ├── env.rs              # .env reader commands
│   │   └── fs.rs               # Filesystem commands (log, export)
│   └── lib.rs                  # Command registration
├── Cargo.toml
├── tauri.conf.json             # Tauri configuration
└── capabilities/
    └── default.json            # Tauri permission capabilities
```


## 3. Data Models

### 3.1 Core TypeScript Types

```typescript
// src/lib/types/workflow.ts

/** Represents a complete n8n workflow */
interface Workflow {
  id: string;
  name: string;
  active: boolean;
  versionId: string;       // Required for optimistic concurrency on PUT requests
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  settings: WorkflowSettings;
  staticData: unknown | null;
  tags: Tag[];
  pinData: Record<string, unknown[]>;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}

/** A single node within a workflow */
interface WorkflowNode {
  id: string;
  name: string;
  type: string;           // e.g. "n8n-nodes-base.httpRequest"
  typeVersion: number;
  position: [number, number];  // [x, y] canvas coordinates
  parameters: Record<string, unknown>;
  credentials?: Record<string, NodeCredentialRef>;
  disabled?: boolean;
  notes?: string;
  retryOnFail?: boolean;
  continueOnFail?: boolean;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
}

/** Reference to a credential from a node */
interface NodeCredentialRef {
  id: string;
  name: string;
}

/** Connection map: sourceNode → outputType → outputIndex → ConnectionTarget[] */
type WorkflowConnections = Record<string, Record<string, ConnectionTarget[][]>>;

interface ConnectionTarget {
  node: string;    // target node name
  type: string;    // connection type: "main", "ai_languageModel", "ai_outputParser", etc.
  index: number;   // target input index
}

/** Workflow-level settings */
interface WorkflowSettings {
  executionOrder?: 'v0' | 'v1';
  errorWorkflow?: string;
  callerPolicy?: 'any' | 'none' | 'workflowsFromAList';
  callerIds?: string;
  timezone?: string;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  saveManualExecutions?: boolean;
  saveExecutionProgress?: boolean;
  executionTimeout?: number;
  timeSavedUnit?: 'hours' | 'minutes' | 'seconds';
  timeSavedValue?: number;
}

/** Tag applied to workflows */
interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

```typescript
// src/lib/types/execution.ts

/** Represents a workflow execution */
interface Execution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: string;
  stoppedAt: string | null;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook' | 'retry';
  data?: ExecutionData;
  workflowData?: Workflow;   // Workflow snapshot at execution time (for "Copy to Editor" feature)
  retryOf?: string;
  retrySuccessId?: string;
}

type ExecutionStatus = 'success' | 'error' | 'canceled' | 'running' | 'waiting' | 'new';

/** Per-node execution data */
interface ExecutionData {
  resultData: {
    runData: Record<string, NodeExecutionResult[]>;
    error?: ExecutionError;
  };
}

interface NodeExecutionResult {
  startTime: number;
  executionTime: number;
  data: { main: Array<Array<{ json: Record<string, unknown> }>> };
  error?: ExecutionError;
}

interface ExecutionError {
  message: string;
  stack?: string;
  name?: string;
}
```

```typescript
// src/lib/types/credential.ts

/** Credential stored in n8n */
interface Credential {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

/** Credential with decrypted data (for editing) */
interface CredentialWithData extends Credential {
  data: Record<string, unknown>;
}

/** Schema for a credential type's fields */
interface CredentialSchema {
  type: string;
  properties: CredentialSchemaField[];
}

interface CredentialSchemaField {
  displayName: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'options';
  required: boolean;
  default?: unknown;
  options?: Array<{ name: string; value: string }>;
  typeOptions?: { password?: boolean };
}
```

```typescript
// src/lib/types/node-registry.ts

/** Node type definition for rendering and configuration */
interface NodeTypeDefinition {
  type: string;                    // e.g. "n8n-nodes-base.httpRequest"
  displayName: string;
  icon: string;                    // icon identifier or SVG path
  category: NodeCategory;
  version: number | number[];
  description: string;
  defaults: { name: string; color?: string };
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  properties: NodePropertyDefinition[];
  credentials?: Array<{ name: string; required: boolean }>;
}

type NodeCategory =
  | 'Core'
  | 'Actions in an App'
  | 'Data transformation'
  | 'Flow'
  | 'Advanced AI'
  | 'Human in the loop';

interface PortDefinition {
  type: string;    // "main", "ai_languageModel", "ai_outputParser", "ai_agent", etc.
  displayName?: string;
  required?: boolean;
}

interface NodePropertyDefinition {
  displayName: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'collection' | 'fixedCollection' | 'json' | 'code';
  default?: unknown;
  required?: boolean;
  description?: string;
  options?: Array<{ name: string; value: string | number | boolean }>;
  displayOptions?: { show?: Record<string, unknown[]> };
  typeOptions?: {
    editor?: 'code' | 'json';
    language?: 'javascript' | 'python';
    rows?: number;
    password?: boolean;
  };
}
```

```typescript
// src/lib/types/api.ts

/** Paginated API response envelope */
interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
}

/** API error response from n8n */
interface ApiErrorResponse {
  status: number;
  message: string;
  code?: string;
}

/** App configuration from .env */
interface AppConfig {
  n8nBaseUrl: string;
  n8nApiKey: string;
  debug: boolean;
}
```

### 3.2 Svelte Flow Node/Edge Mapping

n8n workflow nodes and connections map to Svelte Flow's `Node` and `Edge` types:

```typescript
// Mapping: WorkflowNode → Svelte Flow Node
function workflowNodeToFlowNode(node: WorkflowNode, registry: NodeTypeRegistry): SvelteFlowNode {
  const typeDef = registry.get(node.type, node.typeVersion);
  return {
    id: node.id,
    type: getCustomNodeType(node.type),  // 'customNode' | 'triggerNode' | 'clusterNode'
    position: { x: node.position[0], y: node.position[1] },
    data: {
      label: node.name,
      nodeType: node.type,
      icon: typeDef?.icon ?? 'default',
      parameters: node.parameters,
      disabled: node.disabled ?? false,
      executionStatus: undefined,  // set after execution
    },
  };
}

// Mapping: WorkflowConnections → Svelte Flow Edge[]
function workflowConnectionsToEdges(connections: WorkflowConnections): SvelteFlowEdge[] {
  const edges: SvelteFlowEdge[] = [];
  for (const [sourceNode, outputs] of Object.entries(connections)) {
    for (const [outputType, outputIndexes] of Object.entries(outputs)) {
      outputIndexes.forEach((targets, sourceIndex) => {
        targets.forEach((target) => {
          edges.push({
            id: `${sourceNode}-${outputType}-${sourceIndex}-${target.node}-${target.index}`,
            source: sourceNode,
            target: target.node,
            sourceHandle: `${outputType}-${sourceIndex}`,
            targetHandle: `${target.type}-${target.index}`,
            type: 'customEdge',
            data: { connectionType: outputType },
          });
        });
      });
    }
  }
  return edges;
}
```

## 4. Component Design

### 4.1 App Shell and Layout

The root layout (`+layout.svelte`) renders the `Shell` component which provides:
- Left sidebar navigation (collapsible)
- Main content area (routed pages)
- Global error notification area
- Connection status banner (when offline)

```
┌──────────────────────────────────────────────────┐
│ ConnectionBanner (shown when n8n unreachable)     │
├──────┬───────────────────────────────────────────┤
│      │                                           │
│ Side │         Route Content                     │
│ bar  │         (+page.svelte)                    │
│      │                                           │
│      │                                           │
├──────┴───────────────────────────────────────────┤
│ ErrorNotification (toast stack, bottom-right)     │
└──────────────────────────────────────────────────┘
```

### 4.2 Sidebar Component

The `Sidebar.svelte` component renders navigation items from a static config array. Phase 2 items show a lock icon and are non-clickable. The sidebar reads the current route from SvelteKit's `$page` store to highlight the active item.

Collapsed mode stores only icons, toggled via a button at the bottom. Collapse state persists in localStorage.

### 4.3 Workflow Canvas Editor

The canvas page (`/workflows/[id]/+page.svelte`) is the most complex screen. It composes:

```
WorkflowCanvasPage
├── TopBar (workflow name, tags, save, publish, share, history)
├── TabBar (Editor | Executions)
├── WorkflowCanvas (Svelte Flow)
│   ├── CustomNode (for standard nodes)
│   ├── TriggerNode (for trigger nodes)
│   ├── ClusterNode (for AI/LangChain nodes)
│   ├── CustomEdge (connection lines)
│   ├── StickyNote (annotations)
│   └── CanvasControls (zoom, fit, tidy)
├── NodeSelector (slide-in panel for adding nodes)
├── NodeConfigPanel (right-side panel when node selected)
│   ├── ParametersTab
│   ├── SettingsTab
│   ├── InputOutputTab (Input)
│   └── InputOutputTab (Output)
└── WorkflowExecutions (shown when Executions tab active)
```

#### Canvas State Management

```typescript
// src/lib/stores/canvas.svelte.ts

class CanvasStore {
  nodes = $state<SvelteFlowNode[]>([]);
  edges = $state<SvelteFlowEdge[]>([]);
  selectedNodeId = $state<string | null>(null);
  workflowId = $state<string>('');
  workflowName = $state<string>('');
  workflowActive = $state<boolean>(false);
  workflowTags = $state<Tag[]>([]);
  workflowSettings = $state<WorkflowSettings>({});
  isDirty = $state<boolean>(false);
  executionStatus = $state<Map<string, 'success' | 'error' | 'running'>>(new Map());

  selectedNode = $derived(
    this.nodes.find(n => n.id === this.selectedNodeId) ?? null
  );

  async loadWorkflow(id: string): Promise<void> { /* ... */ }
  async saveWorkflow(): Promise<void> { /* ... */ }
  async activateWorkflow(): Promise<void> { /* ... */ }
  async deactivateWorkflow(): Promise<void> { /* ... */ }
  async executeWorkflow(): Promise<void> { /* ... */ }

  addNode(type: string, position: { x: number; y: number }): void { /* ... */ }
  removeNode(id: string): void { /* ... */ }
  addEdge(source: string, target: string, sourceHandle: string, targetHandle: string): void { /* ... */ }
  removeEdge(id: string): void { /* ... */ }
  addStickyNote(position: { x: number; y: number }): void { /* ... */ }
}

export const canvasStore = new CanvasStore();
```

### 4.4 Node Configuration Panel

The `NodeConfigPanel` renders dynamically based on the selected node's type definition from the node registry. The `ParametersTab` iterates over `NodePropertyDefinition[]` and renders the appropriate input component for each field type:

| Property Type | Rendered Component |
|--------------|-------------------|
| `string` | Text input (or textarea if multiline) |
| `string` + `typeOptions.editor: 'code'` | CodeEditor (Monaco-like) |
| `string` + `typeOptions.password: true` | Password input |
| `number` | Number input |
| `boolean` | Toggle switch |
| `options` | Select dropdown |
| `collection` | Expandable field group |
| `fixedCollection` | Named field group with add/remove |
| `json` | JSON editor textarea |

Each field supports expression mode toggle. When expression mode is active, the field switches to the `ExpressionEditor` component.

### 4.5 Custom Node Components

Three custom node types for Svelte Flow:

1. **CustomNode** — Standard nodes (HTTP Request, Set, Code, etc.)
   - Rounded rectangle with icon + name
   - Output port(s) on right, input port(s) on left
   - Hover actions: execute, toggle, delete, more

2. **TriggerNode** — Trigger nodes (Manual Trigger, Schedule, Webhook, etc.)
   - Same as CustomNode but with a lightning bolt indicator
   - No input port (triggers are entry points)

3. **ClusterNode** — AI/LangChain nodes (Chain LLM, OpenAI Chat Model, etc.)
   - Specialized ports: `ai_languageModel`, `ai_outputParser`, `ai_agent`, `ai_memory`, `ai_tool`, `ai_vectorStore`, `ai_embedding`
   - Ports rendered at specific positions (bottom for sub-connections)
   - Visual grouping indicator for connected AI sub-nodes

### 4.6 Expression Editor

The `ExpressionEditor` component provides:
- Text input with `={{ }}` syntax highlighting
- Autocomplete dropdown for available references:
  - `$json.*` — current node input data fields
  - `$('NodeName').first().json.*` — data from specific upstream nodes
  - `$vars.*` — instance variables
  - `$workflow.*` — workflow metadata
  - `$execution.*` — execution metadata
- Live preview of resolved expression value (when execution data available)
- Validation: highlights syntax errors in red

### 4.7 Code Editor

The `CodeEditor` component for Code nodes:
- Textarea-based editor with Prism.js for syntax highlighting (~2KB core, modular language support)
- Language toggle: JavaScript / Python
- Line numbers (rendered via CSS counter or line-number gutter div)
- Basic autocompletion for n8n helpers (`$input`, `$json`, `$items()`)
- Monospace font, dark theme matching n8n's code editor

### 4.8 Node Selector Panel

The `NodeSelector` component is a slide-in panel triggered by the "+" button on the canvas:
- Search input at top with debounced filtering (300ms)
- Categories populated from `nodeRegistry.getByCategory()`: Advanced AI, Actions in an App, Data transformation, Flow, Core, Human in the loop
- Each category is a collapsible section showing matching node types with icon + display name + short description
- Clicking a node type adds it to the canvas at the center of the current viewport
- Dragging a node type onto the canvas places it at the drop position
- Search filters across all categories by display name and type identifier
- Empty search shows all categories expanded
- Non-empty search shows only matching nodes, grouped by category

### 4.9 New Workflow Flow

When the user navigates to `/workflows/new`:
1. The canvas renders in empty state with "Add first step" placeholder (Req 3 AC#12)
2. No API call is made yet — the workflow exists only in local canvas state
3. When the user adds the first node OR clicks Save, the app calls `POST /api/v1/workflows` to create the workflow on the n8n instance
4. On successful creation, the URL updates to `/workflows/{newId}` via `goto()` (SvelteKit navigation)
5. Subsequent saves use `PUT /api/v1/workflows/{id}`
6. If the user navigates away without saving and no nodes were added, no API call is made (no orphan workflows)

### 4.10 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd+S | Save workflow |
| Delete/Backspace | Delete selected node(s) |
| Ctrl/Cmd+Z | Undo (canvas state) |
| Ctrl/Cmd+Shift+Z | Redo |
| Ctrl/Cmd+A | Select all nodes |
| Ctrl/Cmd+C | Copy selected nodes |
| Ctrl/Cmd+V | Paste copied nodes |
| Ctrl/Cmd+D | Duplicate selected node |
| Escape | Deselect / close panel |
| Space (hold) + drag | Pan canvas |

Shortcuts are registered via SvelteKit's `onMount` with `window.addEventListener('keydown', ...)` and cleaned up on `onDestroy`.

## 5. API Client Design

### 5.1 Tauri Command Interface

All HTTP requests to the n8n instance go through Tauri Rust commands. The frontend never makes direct fetch calls to n8n.

```typescript
// src/lib/api/client.ts

import { invoke } from '@tauri-apps/api/core';
import { logger } from '$lib/core/logger';

interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
}

interface HttpResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
}

/** Send an HTTP request through Tauri's Rust backend */
async function tauriHttp(request: HttpRequest): Promise<HttpResponse> {
  const startTime = performance.now();
  try {
    const response = await invoke<HttpResponse>('http_request', { request });
    const duration = Math.round(performance.now() - startTime);
    logger.debug('api', 'HTTP request completed', {
      method: request.method,
      url: request.url,
      status: response.status,
      duration,
    });
    return response;
  } catch (error) {
    logger.error('api', 'HTTP request failed', {
      method: request.method,
      url: request.url,
      error: String(error),
    });
    throw error;
  }
}

class ApiClient {
  private baseUrl: string = '';
  private apiKey: string = '';

  async initialize(): Promise<void> {
    const config = await invoke<AppConfig>('read_env_config');
    this.baseUrl = config.n8nBaseUrl.replace(/\/$/, '');
    this.apiKey = config.n8nApiKey;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await tauriHttp({
      method: method as HttpRequest['method'],
      url: `${this.baseUrl}/api/v1${path}`,
      body,
      headers: { 'X-N8N-API-KEY': this.apiKey, 'Content-Type': 'application/json' },
    });

    if (response.status === 401) {
      throw new ApiRequestError(401, 'Unauthorized — check your API key in .env');
    }
    if (response.status >= 500) {
      throw new ApiRequestError(response.status, `Server error: ${response.body}`);
    }
    if (response.status >= 400) {
      throw new ApiRequestError(response.status, JSON.parse(response.body).message ?? response.body);
    }

    return JSON.parse(response.body) as T;
  }

  async get<T>(path: string): Promise<T> { return this.request('GET', path); }
  async post<T>(path: string, body: unknown): Promise<T> { return this.request('POST', path, body); }
  async put<T>(path: string, body: unknown): Promise<T> { return this.request('PUT', path, body); }
  async patch<T>(path: string, body: unknown): Promise<T> { return this.request('PATCH', path, body); }
  async delete<T>(path: string): Promise<T> { return this.request('DELETE', path); }

  /** Make a request to the internal REST API (for node registry fetch, Phase 3 features) */
  async requestInternal<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await tauriHttp({
      method: method as HttpRequest['method'],
      url: `${this.baseUrl}${path}`,  // No /api/v1 prefix — direct path
      body,
      headers: { 'X-N8N-API-KEY': this.apiKey, 'Content-Type': 'application/json' },
    });
    if (response.status >= 400) {
      throw new ApiRequestError(response.status, JSON.parse(response.body).message ?? response.body);
    }
    return JSON.parse(response.body) as T;
  }

  /** Fetch a paginated list, handling cursor-based pagination */
  async paginate<T>(path: string, cursor?: string): Promise<PaginatedResponse<T>> {
    const separator = path.includes('?') ? '&' : '?';
    const url = cursor ? `${path}${separator}cursor=${cursor}` : path;
    return this.get<PaginatedResponse<T>>(url);
  }
}

export const apiClient = new ApiClient();
```

### 5.2 Rust HTTP Proxy Command

```rust
// src-tauri/src/commands/http.rs

use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Deserialize)]
pub struct HttpRequest {
    method: String,
    url: String,
    body: Option<serde_json::Value>,
    headers: Option<std::collections::HashMap<String, String>>,
}

#[derive(Serialize)]
pub struct HttpResponse {
    status: u16,
    body: String,
    headers: std::collections::HashMap<String, String>,
}

#[command]
pub async fn http_request(
    client: tauri::State<'_, reqwest::Client>,
    allowed_base_url: tauri::State<'_, AllowedBaseUrl>,
    request: HttpRequest,
) -> Result<HttpResponse, String> {
    // Security: validate URL is within the allowed base URL
    if !request.url.starts_with(&allowed_base_url.0) {
        return Err(format!(
            "URL not allowed: {}. Only requests to {} are permitted.",
            request.url, allowed_base_url.0
        ));
    }

    let mut builder = match request.method.as_str() {
        "GET" => client.get(&request.url),
        "POST" => client.post(&request.url),
        "PUT" => client.put(&request.url),
        "PATCH" => client.patch(&request.url),
        "DELETE" => client.delete(&request.url),
        _ => return Err(format!("Unsupported method: {}", request.method)),
    };

    if let Some(headers) = request.headers {
        for (key, value) in headers {
            builder = builder.header(&key, &value);
        }
    }
    if let Some(body) = request.body {
        builder = builder.json(&body);
    }

    let response = builder.send().await.map_err(|e| e.to_string())?;
    let status = response.status().as_u16();
    let headers: std::collections::HashMap<String, String> = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();
    let body = response.text().await.map_err(|e| e.to_string())?;

    Ok(HttpResponse { status, body, headers })
}
```

### 5.3 Domain-Specific API Modules

Each API module wraps the core client with typed functions:

```typescript
// src/lib/api/workflows.ts

import { apiClient } from './client';
import type { Workflow, PaginatedResponse } from '$lib/types';

export async function listWorkflows(cursor?: string): Promise<PaginatedResponse<Workflow>> {
  return apiClient.paginate<Workflow>('/workflows', cursor);
}

export async function getWorkflow(id: string): Promise<Workflow> {
  return apiClient.get<Workflow>(`/workflows/${id}`);
}

export async function createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
  return apiClient.post<Workflow>('/workflows', workflow);
}

export async function updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
  return apiClient.put<Workflow>(`/workflows/${id}`, workflow);
}

export async function deleteWorkflow(id: string): Promise<void> {
  await apiClient.delete(`/workflows/${id}`);
}

export async function activateWorkflow(id: string): Promise<Workflow> {
  return apiClient.post<Workflow>(`/workflows/${id}/activate`, {});
}

export async function deactivateWorkflow(id: string): Promise<Workflow> {
  return apiClient.post<Workflow>(`/workflows/${id}/deactivate`, {});
}
```

Similar modules exist for `executions.ts`, `credentials.ts`, `tags.ts`, `data-tables.ts`, `templates.ts`, and `audit.ts`.


## 6. Core Business Logic

### 6.1 Workflow Parser

The workflow parser converts raw n8n JSON into the app's internal types and validates structure.

```typescript
// src/lib/core/workflow-parser.ts

import type { Workflow, WorkflowNode, WorkflowConnections } from '$lib/types/workflow';

export interface ParseResult {
  workflow: Workflow;
  warnings: string[];
}

export function parseWorkflowJson(json: string): ParseResult {
  const warnings: string[] = [];
  const raw = JSON.parse(json);

  // Validate required fields
  if (!raw.nodes || !Array.isArray(raw.nodes)) {
    throw new ParseError('Missing or invalid "nodes" array');
  }
  if (!raw.connections || typeof raw.connections !== 'object') {
    throw new ParseError('Missing or invalid "connections" object');
  }

  const nodes: WorkflowNode[] = raw.nodes.map((n: unknown) => parseNode(n, warnings));
  const connections: WorkflowConnections = raw.connections;

  // Validate connection references
  const nodeNames = new Set(nodes.map(n => n.name));
  for (const [source, outputs] of Object.entries(connections)) {
    if (!nodeNames.has(source)) {
      warnings.push(`Connection source "${source}" not found in nodes`);
    }
    for (const targets of Object.values(outputs as Record<string, unknown[][]>)) {
      for (const targetGroup of targets) {
        for (const target of targetGroup as Array<{ node: string }>) {
          if (!nodeNames.has(target.node)) {
            warnings.push(`Connection target "${target.node}" not found in nodes`);
          }
        }
      }
    }
  }

  return {
    workflow: {
      id: raw.id ?? '',
      name: raw.name ?? 'Untitled Workflow',
      active: raw.active ?? false,
      nodes,
      connections,
      settings: raw.settings ?? {},
      staticData: raw.staticData ?? null,
      tags: raw.tags ?? [],
      pinData: raw.pinData ?? {},
      createdAt: raw.createdAt ?? new Date().toISOString(),
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
    },
    warnings,
  };
}

function parseNode(raw: unknown, warnings: string[]): WorkflowNode {
  const node = raw as Record<string, unknown>;
  if (!node.type || typeof node.type !== 'string') {
    throw new ParseError('Node missing "type" field');
  }
  if (!node.name || typeof node.name !== 'string') {
    throw new ParseError('Node missing "name" field');
  }
  return {
    id: (node.id as string) ?? crypto.randomUUID(),
    name: node.name as string,
    type: node.type as string,
    typeVersion: (node.typeVersion as number) ?? 1,
    position: (node.position as [number, number]) ?? [0, 0],
    parameters: (node.parameters as Record<string, unknown>) ?? {},
    credentials: node.credentials as Record<string, { id: string; name: string }> | undefined,
    disabled: (node.disabled as boolean) ?? false,
  };
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}
```

### 6.2 Expression Parser

Identifies and renders n8n expressions within node parameters.

```typescript
// src/lib/core/expression-parser.ts

export interface ExpressionRef {
  raw: string;           // full expression text including ={{ }}
  inner: string;         // expression body without ={{ }}
  type: 'json' | 'node_ref' | 'vars' | 'workflow' | 'execution' | 'complex';
  referencedNode?: string;  // for $('NodeName') references
  referencedField?: string; // for .json.fieldName references
}

const EXPRESSION_REGEX = /=\{\{(.+?)\}\}/gs;
const JSON_REF_REGEX = /^\s*\$json\.(\w+)\s*$/;
const NODE_REF_REGEX = /^\s*\$\('([^']+)'\)\.first\(\)\.json(?:\.(\w+))?\s*$/;
const VARS_REF_REGEX = /^\s*\$vars\.(\w+)\s*$/;

export function findExpressions(value: unknown): ExpressionRef[] {
  if (typeof value !== 'string') return [];
  const refs: ExpressionRef[] = [];
  let match: RegExpExecArray | null;

  while ((match = EXPRESSION_REGEX.exec(value)) !== null) {
    const inner = match[1].trim();
    refs.push(classifyExpression(match[0], inner));
  }
  return refs;
}

function classifyExpression(raw: string, inner: string): ExpressionRef {
  let m: RegExpExecArray | null;

  if ((m = JSON_REF_REGEX.exec(inner))) {
    return { raw, inner, type: 'json', referencedField: m[1] };
  }
  if ((m = NODE_REF_REGEX.exec(inner))) {
    return { raw, inner, type: 'node_ref', referencedNode: m[1], referencedField: m[2] };
  }
  if ((m = VARS_REF_REGEX.exec(inner))) {
    return { raw, inner, type: 'vars', referencedField: m[1] };
  }
  if (inner.startsWith('$workflow')) {
    return { raw, inner, type: 'workflow' };
  }
  if (inner.startsWith('$execution')) {
    return { raw, inner, type: 'execution' };
  }
  return { raw, inner, type: 'complex' };
}

/** Extract all unique node names referenced in expressions across all parameters */
export function extractReferencedNodes(parameters: Record<string, unknown>): string[] {
  const nodes = new Set<string>();
  function walk(value: unknown): void {
    if (typeof value === 'string') {
      for (const ref of findExpressions(value)) {
        if (ref.referencedNode) nodes.add(ref.referencedNode);
      }
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(walk);
    }
  }
  walk(parameters);
  return [...nodes];
}
```

### 6.3 Node Type Registry

```typescript
// src/lib/core/node-registry.ts

import type { NodeTypeDefinition } from '$lib/types/node-registry';
import staticRegistry from '$static/node-registry.json';
import { apiClient } from '$lib/api/client';
import { logger } from './logger';

class NodeTypeRegistry {
  private types = $state<Map<string, NodeTypeDefinition>>(new Map());
  private loaded = $state<boolean>(false);

  async initialize(): Promise<void> {
    // Load bundled static registry first
    for (const def of staticRegistry as NodeTypeDefinition[]) {
      this.types.set(this.key(def.type, Array.isArray(def.version) ? def.version[0] : def.version), def);
    }
    this.loaded = true;

    // Attempt to fetch from n8n instance for latest definitions
    try {
      const response = await apiClient.requestInternal<NodeTypeDefinition[]>('GET', '/rest/nodes');
      for (const def of response) {
        this.types.set(this.key(def.type, Array.isArray(def.version) ? def.version[0] : def.version), def);
      }
      logger.info('node-registry', `Loaded ${response.length} node types from n8n instance`);
    } catch {
      logger.warn('node-registry', 'Could not fetch node types from n8n instance, using bundled registry');
    }
  }

  get(type: string, version?: number): NodeTypeDefinition | undefined {
    if (version !== undefined) {
      return this.types.get(this.key(type, version));
    }
    // Find highest version for this type
    let best: NodeTypeDefinition | undefined;
    for (const [, def] of this.types) {
      if (def.type === type) {
        const v = Array.isArray(def.version) ? Math.max(...def.version) : def.version;
        const bestV = best ? (Array.isArray(best.version) ? Math.max(...best.version) : best.version) : -1;
        if (v > bestV) best = def;
      }
    }
    return best;
  }

  getByCategory(category: NodeCategory): NodeTypeDefinition[] {
    return [...this.types.values()].filter(d => d.category === category);
  }

  search(query: string): NodeTypeDefinition[] {
    const q = query.toLowerCase();
    return [...this.types.values()].filter(
      d => d.displayName.toLowerCase().includes(q) || d.type.toLowerCase().includes(q)
    );
  }

  private key(type: string, version: number): string {
    return `${type}@${version}`;
  }
}

export const nodeRegistry = new NodeTypeRegistry();
```

### 6.4 Structured Logger

```typescript
// src/lib/core/logger.ts

import { invoke } from '@tauri-apps/api/core';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
}

class Logger {
  private debugEnabled = false;

  setDebug(enabled: boolean): void {
    this.debugEnabled = enabled;
  }

  debug(module: string, message: string, data?: Record<string, unknown>): void {
    if (this.debugEnabled) this.log('DEBUG', module, message, data);
  }

  info(module: string, message: string, data?: Record<string, unknown>): void {
    if (this.debugEnabled) this.log('INFO', module, message, data);
  }

  warn(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('WARN', module, message, data);
  }

  error(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('ERROR', module, message, data);
  }

  private log(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };

    // Console output
    const prefix = `[${entry.timestamp}] [${level}] [${module}]`;
    if (level === 'ERROR') console.error(prefix, message, data ?? '');
    else if (level === 'WARN') console.warn(prefix, message, data ?? '');
    else console.log(prefix, message, data ?? '');

    // File output via Tauri (fire-and-forget)
    if (this.debugEnabled || level === 'ERROR' || level === 'WARN') {
      invoke('append_log', { entry: JSON.stringify(entry) }).catch(() => {});
    }
  }
}

export const logger = new Logger();
```


## 7. State Management

### 7.1 Store Architecture

All stores use Svelte 5 runes (class-based pattern with `$state` and `$derived`). No external state management library.

```
┌─────────────────────────────────────────────────┐
│                  Global Stores                    │
│  appStore (config, debug, initialized)           │
│  connectionStore (status, lastCheck, retryTimer) │
│  themeStore (theme, sidebarCollapsed)            │
├─────────────────────────────────────────────────┤
│                  Data Stores                      │
│  workflowsStore (list, cache, pagination)        │
│  executionsStore (list, filters, pagination)     │
│  credentialsStore (list, pagination)             │
│  tagsStore (list)                                │
│  dataTablesStore (list, pagination)              │
├─────────────────────────────────────────────────┤
│                  UI Stores                        │
│  canvasStore (nodes, edges, selection, dirty)    │
│  nodePanelStore (selectedNode, activeTab)        │
└─────────────────────────────────────────────────┘
```

### 7.2 Connection Status Store

Handles offline detection, retry logic, and cached data fallback (Req 34).

```typescript
// src/lib/stores/connection.svelte.ts

class ConnectionStore {
  status = $state<'connected' | 'disconnected' | 'checking'>('checking');
  lastSuccessfulCheck = $state<string | null>(null);
  retryCount = $state<number>(0);
  private retryInterval: ReturnType<typeof setInterval> | null = null;

  isConnected = $derived(this.status === 'connected');

  async checkConnection(): Promise<boolean> {
    this.status = 'checking';
    try {
      await apiClient.get('/workflows?limit=1');
      this.status = 'connected';
      this.lastSuccessfulCheck = new Date().toISOString();
      this.retryCount = 0;
      this.stopRetry();
      return true;
    } catch {
      this.status = 'disconnected';
      this.retryCount++;
      this.startRetry();
      return false;
    }
  }

  private startRetry(): void {
    if (this.retryInterval) return;
    this.retryInterval = setInterval(() => this.checkConnection(), 10_000);
  }

  private stopRetry(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }
}

export const connectionStore = new ConnectionStore();
```

### 7.3 Pagination Helper

Generic cursor-based pagination used by all list stores.

```typescript
// src/lib/utils/pagination.ts

import type { PaginatedResponse } from '$lib/types/api';

export class PaginatedList<T> {
  items = $state<T[]>([]);
  nextCursor = $state<string | undefined>(undefined);
  loading = $state<boolean>(false);
  hasMore = $derived(this.nextCursor !== undefined);

  constructor(private fetchFn: (cursor?: string) => Promise<PaginatedResponse<T>>) {}

  async loadInitial(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.fetchFn();
      this.items = response.data;
      this.nextCursor = response.nextCursor;
    } finally {
      this.loading = false;
    }
  }

  async loadMore(): Promise<void> {
    if (!this.hasMore || this.loading) return;
    this.loading = true;
    try {
      const response = await this.fetchFn(this.nextCursor);
      this.items = [...this.items, ...response.data];
      this.nextCursor = response.nextCursor;
    } finally {
      this.loading = false;
    }
  }

  reset(): void {
    this.items = [];
    this.nextCursor = undefined;
  }
}
```

### 7.4 Workflow ID → Name Cache

Used by the executions page to display workflow names instead of raw IDs (Req 5, Req 46 AC#7).

```typescript
// src/lib/utils/cache.ts

class WorkflowNameCache {
  private cache = $state<Map<string, string>>(new Map());

  async refresh(): Promise<void> {
    let cursor: string | undefined;
    const newCache = new Map<string, string>();
    do {
      const response = await apiClient.paginate<{ id: string; name: string }>('/workflows', cursor);
      for (const w of response.data) {
        newCache.set(w.id, w.name);
      }
      cursor = response.nextCursor;
    } while (cursor);
    this.cache = newCache;
  }

  getName(workflowId: string): string {
    return this.cache.get(workflowId) ?? workflowId;
  }
}

export const workflowNameCache = new WorkflowNameCache();
```

## 8. Tauri Rust Backend

### 8.1 Environment Config Reader

```rust
// src-tauri/src/commands/env.rs

use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use tauri::command;

#[derive(Serialize)]
pub struct AppConfig {
    n8n_base_url: String,
    n8n_api_key: String,
    debug: bool,
}

#[command]
pub fn read_env_config(app_handle: tauri::AppHandle) -> Result<AppConfig, String> {
    // Resolve .env path relative to the app's resource directory or executable directory
    // This ensures .env is found regardless of the current working directory
    let env_path = app_handle
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?
        .join(".env");

    // Fallback: try current directory (for development mode)
    let env_path = if env_path.exists() {
        env_path
    } else {
        std::env::current_dir()
            .map_err(|e| e.to_string())?
            .join(".env")
    };

    let content = fs::read_to_string(&env_path)
        .map_err(|_| "Could not read .env file. Please create a .env file with N8N_BASE_URL and N8N_API_KEY.".to_string())?;

    let vars: HashMap<String, String> = content
        .lines()
        .filter(|line| !line.starts_with('#') && line.contains('='))
        .filter_map(|line| {
            let mut parts = line.splitn(2, '=');
            Some((parts.next()?.trim().to_string(), parts.next()?.trim().to_string()))
        })
        .collect();

    let base_url = vars.get("N8N_BASE_URL")
        .ok_or("N8N_BASE_URL not found in .env")?
        .clone();
    let api_key = vars.get("N8N_API_KEY")
        .ok_or("N8N_API_KEY not found in .env")?
        .clone();
    let debug = vars.get("DEBUG")
        .map(|v| v.to_lowercase() == "true")
        .unwrap_or(false);

    if api_key.is_empty() {
        return Err("N8N_API_KEY is empty in .env".to_string());
    }

    Ok(AppConfig { n8n_base_url: base_url, n8n_api_key: api_key, debug })
}
```

### 8.2 Filesystem Commands

```rust
// src-tauri/src/commands/fs.rs

use std::fs::{self, OpenOptions};
use std::io::Write;
use tauri::command;

const MAX_LOG_SIZE: u64 = 10 * 1024 * 1024; // 10MB

#[command]
pub fn append_log(entry: String) -> Result<(), String> {
    let log_path = std::env::current_dir()
        .map_err(|e| e.to_string())?
        .join("debug.log");

    // Rotate if exceeds 10MB
    if let Ok(metadata) = fs::metadata(&log_path) {
        if metadata.len() > MAX_LOG_SIZE {
            let backup = log_path.with_extension("log.1");
            let _ = fs::rename(&log_path, &backup);
        }
    }

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(|e| e.to_string())?;

    writeln!(file, "{}", entry).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| e.to_string())
}

#[command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}
```

### 8.3 Tauri App Registration

```rust
// src-tauri/src/lib.rs

mod commands;

pub struct AllowedBaseUrl(pub String);

pub fn run() {
    // Read .env at startup to get the allowed base URL
    // Note: For managed state, we read env config during setup phase
    tauri::Builder::default()
        .manage(reqwest::Client::new())  // Reuse single HTTP client (connection pooling)
        .setup(|app| {
            let config = commands::env::read_env_config(app.handle().clone())
                .expect("Failed to read .env config");
            app.manage(AllowedBaseUrl(config.n8n_base_url));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::http::http_request,
            commands::env::read_env_config,
            commands::fs::append_log,
            commands::fs::write_file,
            commands::fs::read_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```


## 9. Data Flow Diagrams

### 9.1 App Startup Flow

```
App Launch
    │
    ▼
Tauri reads .env ──── Missing? ──── Show Error Screen (Req 1 AC#4)
    │                                  "Configure .env file"
    │ (config loaded)
    ▼
Initialize API Client (set baseUrl + apiKey)
    │
    ▼
Check Connection (GET /workflows?limit=1)
    │
    ├── 401 Unauthorized ──── Show Error (Req 1 AC#5)
    │                          "Check API key in .env"
    │
    ├── Network Error ──── Show Error + Start Retry (Req 34)
    │                       "n8n instance unreachable"
    │
    └── 200 OK ──── Initialize stores
                        │
                        ▼
                    Load Node Registry (bundled + fetch)
                        │
                        ▼
                    Navigate to Overview (Req 1 AC#3)
                        │
                        ▼
                    Load Workflows, Credentials, Executions
                    Refresh Workflow Name Cache
```

### 9.2 Workflow Edit and Save Flow

```
User opens workflow (/workflows/{id})
    │
    ▼
GET /workflows/{id} ──── Parse JSON ──── Convert to Svelte Flow nodes/edges
    │                                          │
    ▼                                          ▼
Load into canvasStore                    Render on Canvas
    │
    ▼
User edits (add/remove/move nodes, edit connections, change params)
    │
    ▼
canvasStore.isDirty = true
    │
    ▼
User clicks Save
    │
    ▼
Convert Svelte Flow nodes/edges back to n8n JSON
    │
    ▼
PUT /workflows/{id} ──── Success? ──── isDirty = false
                              │
                              └── Error? ──── Show error notification
```

### 9.3 Workflow Execution Flow

```
User clicks "Execute Workflow"
    │
    ▼
Try POST /api/v1/workflows/{id}/execute (public API)
    │
    ├── Success ──── Poll execution status
    │                    │
    │                    ▼
    │                Update node execution status on canvas
    │                (running → success/error per node)
    │                    │
    │                    ▼
    │                Show execution results in node I/O tabs
    │
    ├── 404/403 ──── Fallback: POST /rest/workflows/{id}/run (session auth)
    │                    │
    │                    ├── Success ──── Same as above
    │                    └── Fail ──── Show message: "Execute from n8n web UI"
    │
    └── Network Error ──── Show error notification
```

### 9.4 Offline/Reconnection Flow

```
API request fails with network error
    │
    ▼
connectionStore.status = 'disconnected'
    │
    ▼
Show ConnectionBanner: "n8n instance unreachable. Retrying..."
    │
    ▼
Start retry timer (every 10 seconds)
    │
    ▼
Cache current data for read-only access
    │
    ▼
Retry: GET /workflows?limit=1
    │
    ├── Still failing ──── Continue retrying, increment counter
    │
    └── Success ──── connectionStore.status = 'connected'
                         │
                         ▼
                     Dismiss banner
                     Refresh current view with live data
```

## 10. Theme System

### 10.1 Theme Configuration

```typescript
// src/lib/stores/theme.svelte.ts

type Theme = 'light' | 'dark' | 'system';

class ThemeStore {
  theme = $state<Theme>((typeof localStorage !== 'undefined'
    ? localStorage.getItem('theme') as Theme
    : null) ?? 'system');

  resolvedTheme = $derived<'light' | 'dark'>(
    this.theme === 'system'
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : this.theme
  );

  setTheme(theme: Theme): void {
    this.theme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', this.resolvedTheme === 'dark');
  }
}

export const themeStore = new ThemeStore();
```

### 10.2 Tailwind Dark Mode

Tailwind CSS 4 configured with `darkMode: 'class'`. The `dark` class is toggled on `<html>` by the theme store.

Color tokens match n8n's design language:
- Primary: `#ff6d5a` (n8n orange-red)
- Background light: `#ffffff`, dark: `#1a1a2e`
- Surface light: `#f5f5f5`, dark: `#252547`
- Text light: `#333333`, dark: `#e0e0e0`
- Border light: `#dbdbdb`, dark: `#3a3a5c`
- Success: `#17bf63`, Error: `#ff4757`, Warning: `#ffa502`

## 11. Error Handling Strategy

### 11.1 Error Categories

| Category | Source | Handling |
|----------|--------|----------|
| Network Error | Tauri HTTP command fails | ConnectionBanner + retry timer |
| 401 Unauthorized | Invalid API key | Error notification + "check .env" message |
| 5xx Server Error | n8n instance error | Error notification with status + message |
| 4xx Client Error | Bad request | Error notification with API message |
| Parse Error | Invalid workflow JSON | Error notification with validation details |
| Missing .env | No .env file | Redirect to error screen with setup instructions |

### 11.2 Error Notification System

Toast-style notifications stack in the bottom-right corner. Each notification has:
- Severity icon (error: red, warning: yellow, info: blue)
- Message text
- Optional "Retry" action button
- Auto-dismiss after 8 seconds (errors persist until dismissed)

### 11.3 Unsaved Changes Guard

When `canvasStore.isDirty` is true and the user navigates away:
1. SvelteKit's `beforeNavigate` hook intercepts
2. `ConfirmDialog` shown: "You have unsaved changes. Discard?"
3. User confirms → navigate; User cancels → stay

### 11.4 Error Boundaries

SvelteKit provides `+error.svelte` pages for route-level errors. The design uses:

1. **Route-level error pages**: Each route group has a `+error.svelte` that catches load/render errors and shows a user-friendly message with a "Go to Overview" link.
2. **Component-level error handling**: Critical components (WorkflowCanvas, NodeConfigPanel) wrap their initialization in try/catch blocks. If a component fails to render (e.g., malformed workflow data), it shows an inline error message instead of crashing the entire app.
3. **Global unhandled error handler**: `window.onerror` and `window.onunhandledrejection` are registered in the root layout to catch any uncaught errors, log them via the logger, and show an error notification toast.

## 12. Testing Strategy

### 12.1 Unit Tests (Vitest)

| Module | Test Focus |
|--------|-----------|
| `workflow-parser.ts` | Parse all 4 test workflow JSONs; validate node extraction, connection mapping, settings parsing; test malformed JSON handling |
| `expression-parser.ts` | Classify all expression types; extract referenced nodes; handle edge cases (nested expressions, empty strings) |
| `node-registry.ts` | Lookup by type+version; search by name; fallback for unknown types; category filtering |
| `api/client.ts` | Header construction; URL building; error handling (401, 5xx, network); pagination cursor handling |
| `pagination.ts` | Load initial; load more; hasMore derived; reset; concurrent load prevention |
| `cache.ts` | Refresh from paginated API; getName for known/unknown IDs |

All unit tests use mock data — no live n8n instance required.

### 12.2 Integration Tests (Vitest)

| Test | Description |
|------|-------------|
| Workflow round-trip | Import each test JSON → parse → serialize → compare (equivalent nodes, connections, settings) |
| Canvas mapping | Parse workflow → convert to Svelte Flow nodes/edges → verify correct count, positions, connection types |
| Expression extraction | Parse test workflows → extract all expressions → verify all `={{ }}` patterns found |

### 12.3 Visual/E2E Tests (Playwright)

Per Req 41-43:
- Import all 4 test workflows, screenshot each canvas
- Click each node, screenshot config panel
- Execute workflows, screenshot execution states
- Navigate all Phase 1 screens, screenshot each
- Test error states with mock HTTP responses
- Compare against baselines with 2% diff threshold

### 12.4 Self-Healing Test Loop

Per Req 42:
1. Run visual tests → capture screenshots + debug.log
2. Compare against baselines → produce failure-report.json
3. AI diagnosis → produce diagnosis.json
4. Apply fixes (only `src/**/*.{ts,tsx,js,jsx,css,scss}`)
5. Git commit before each fix
6. Re-run tests (max 5 iterations)
7. Stop on all-pass or iteration limit

## 13. Correctness Properties (Property-Based Testing)

All correctness properties are implemented as parameterized tests in Vitest using the 4 test workflow JSON files as concrete examples. For properties that benefit from generated inputs (expression parsing, pagination), use `fast-check` for property-based testing with random input generation.

### 13.1 Workflow Round-Trip Property

**Property**: For any valid workflow JSON, `parse(serialize(parse(json)))` produces a workflow with equivalent nodes (same id, name, type, typeVersion, position, parameters) and equivalent connections.

```typescript
// Test: Workflow round-trip preserves structure
// For each test workflow JSON file:
//   1. Parse the JSON into a Workflow object
//   2. Serialize the Workflow back to JSON
//   3. Parse the serialized JSON again
//   4. Assert: nodes match (id, name, type, typeVersion, position, parameters)
//   5. Assert: connections match (source, target, type, index)
//   6. Assert: settings match
//   7. Assert: AI connection types preserved (ai_languageModel, ai_outputParser)
```

### 13.2 Expression Parser Completeness Property

**Property**: For any string containing `={{ ... }}` patterns, `findExpressions` returns exactly the set of expressions present, and each is correctly classified.

```typescript
// Test: Every ={{ }} pattern is found
// Generate strings with known expression patterns
// Assert: findExpressions returns correct count
// Assert: each expression has correct type classification
// Assert: referenced nodes/fields are correctly extracted
```

### 13.3 Node Registry Lookup Consistency Property

**Property**: For any node type present in the registry, `get(type, version)` returns a definition with matching type and version. For any node type NOT in the registry, `get` returns undefined.

### 13.4 Pagination Completeness Property

**Property**: After calling `loadInitial()` followed by `loadMore()` until `hasMore` is false, `items` contains all items from all pages with no duplicates and no gaps.

### 13.5 Canvas Mapping Bijection Property

**Property**: Converting workflow nodes/connections to Svelte Flow nodes/edges and back produces equivalent workflow structure. The mapping is a bijection (no information lost in either direction).

### 13.6 Connection Validation Property

**Property**: For any connection in a workflow, both the source node and target node exist in the workflow's node list. No dangling references.

### 13.7 Workflow Name Cache Consistency Property

**Property**: After `refresh()`, for every workflow returned by the API, `getName(workflowId)` returns the correct workflow name. For unknown IDs, it returns the raw ID.

## 13.8 Rust Backend Tests

The Tauri Rust backend includes unit tests for:
- `commands::env::read_env_config` — valid .env parsing, missing file, missing keys, empty API key
- `commands::http::http_request` — URL allowlist validation (reject URLs outside N8N_BASE_URL)
- `commands::fs::append_log` — log writing, log rotation at 10MB boundary
- `commands::fs::write_file` / `read_file` — basic file I/O

Rust tests run via `cargo test` in the `src-tauri/` directory.

## 13.9 Canvas Virtualization Note

Svelte Flow (@xyflow/svelte) includes built-in viewport-based node rendering — nodes outside the visible viewport are not rendered to the DOM. This is enabled by default and handles workflows with 100+ nodes efficiently. No additional virtualization configuration is needed.

## 14. Phase 2 Design Notes

Phase 2 features (Enterprise) follow the same patterns but with additional API modules:

| Feature | API Module | Store | Route |
|---------|-----------|-------|-------|
| Variables (Req 9) | `variables.ts` | `variables.svelte.ts` | `/settings/variables` |
| Insights (Req 10) | `insights.ts` | `insights.svelte.ts` | `/insights` |
| Projects (Req 11) | `projects.ts` | `projects.svelte.ts` | `/projects` |
| Users (Req 13) | `users.ts` | `users.svelte.ts` | `/settings/users` |
| LDAP (Req 15) | `ldap.ts` | — | `/settings/ldap` |
| SAML (Req 16) | `saml.ts` | — | `/settings/saml` |
| Log Streaming (Req 17) | `log-streaming.ts` | — | `/settings/log-streaming` |
| External Secrets (Req 18) | `external-secrets.ts` | — | `/settings/external-secrets` |
| Source Control (Req 20) | `source-control.ts` | — | `/settings/source-control` |
| Workflow History (Req 22) | `workflow-history.ts` | — | In canvas editor |
| Sharing (Req 27) | `sharing.ts` | — | Modal in canvas editor |
| AI Assistant (Req 28) | `ai-assistant.ts` | — | Panel in canvas editor |

Phase 2 sidebar items show a lock icon. Clicking them shows: "This feature requires an Enterprise license."

## 15. Phase 3 Design Notes

Phase 3 features require session authentication via `POST /rest/login`:

```typescript
// Session auth flow (Phase 3 only)
async function sessionLogin(email: string, password: string): Promise<string> {
  const response = await tauriHttp({
    method: 'POST',
    url: `${baseUrl}/rest/login`,
    body: { email, password },
  });
  // Extract session cookie from response headers
  return response.headers['set-cookie'] ?? '';
}
```

Phase 3 routes:
- `/settings/profile` — Personal settings (Req 12 full)
- `/settings/api-keys` — API key management (Req 14 full)
- `/settings/community-nodes` — Community node management (Req 19)

## 16. Security Considerations

1. **API key isolation**: The API key is read by Rust and never exposed to the webview JavaScript context. All API calls go through Tauri invoke commands.
2. **No secrets in frontend**: The frontend receives data through Tauri commands; the API key header is added in Rust.
3. **Self-healing guardrails** (Req 42): AI fixes limited to `src/**/*.{ts,tsx,js,jsx,css,scss}`; git commit before each fix; no dependency or config modifications allowed.
4. **Local-only**: No cloud services, no telemetry, no external data transmission beyond the local n8n instance.
5. **CORS bypass**: Tauri's Rust HTTP client makes requests directly — no browser CORS restrictions apply.

## 17. Requirement Traceability

| Req | Design Component | Section |
|-----|-----------------|---------|
| 1 | Env config reader, error screen, API client init | §5.1, §8.1, §9.1 |
| 2 | Overview page, tabs, pagination, search | §2.2 routes, §7.3 |
| 3 | WorkflowCanvas, CustomNode, CanvasControls, TopBar | §4.3, §4.5 |
| 4 | NodeConfigPanel, ParametersTab, ExpressionEditor | §4.4, §4.6 |
| 5 | Executions page, filters, workflow name cache | §2.2 routes, §7.4 |
| 6 | Workflow-level executions tab in canvas | §4.3 |
| 7 | Credentials page, CredentialForm modal | §2.2 routes, §5.3 |
| 8 | Templates page (external n8n.io API) | §2.2 routes |
| 9-11 | Phase 2 stubs | §14 |
| 12 | ThemeStore, preferences page | §10 |
| 13 | Phase 2 stub | §14 |
| 14 | Connection status page | §2.2 routes, §7.2 |
| 15-18 | Phase 2 stubs | §14 |
| 19 | Phase 3 | §15 |
| 20 | Phase 2 stub | §14 |
| 21 | WorkflowSettings modal | §2.2 components |
| 22 | Phase 2 stub | §14 |
| 23 | Tags management page, TagPill | §2.2 routes |
| 24 | Data tables page + row editor | §2.2 routes |
| 25 | ImportExport modal, workflow parser | §6.1 |
| 26 | Security audit page | §2.2 routes |
| 27-28 | Phase 2 stubs | §14 |
| 29 | Sidebar component | §4.2 |
| 30 | Theme system, Tailwind config | §10 |
| 31 | Webhook URL display in node config | §4.4 |
| 32 | CodeEditor component | §4.7 |
| 33 | ClusterNode, AI port rendering | §4.5 |
| 34 | ConnectionStore, ConnectionBanner, retry logic | §7.2, §9.4 |
| 35 | Documentation (complete) | N/A |
| 36 | Activate/deactivate API + UI toggle | §5.3 |
| 37 | Workflow CRUD API + unsaved changes guard | §5.3, §11.3 |
| 38 | Workflow parser, canvas mapping, round-trip tests | §6.1, §3.2, §13.1 |
| 39 | Expression parser | §6.2 |
| 40 | Logger, Tauri log commands | §6.4, §8.2 |
| 41 | Playwright visual tests | §12.3 |
| 42 | Self-healing test loop | §12.4 |
| 43 | Baseline management | §12.3 |
| 44 | Node type registry | §6.3 |
| 45 | Unit + integration tests | §12.1, §12.2 |
| 46 | Tech stack, startup, CORS proxy, pagination | §1.2, §2.1, §5.1, §7.3 |
