# Technology Stack — Local n8n App

## Decision Criteria

Since human readability of code is not a factor, the stack is optimized purely for:
1. Runtime performance (smallest bundle, fastest render, lowest memory)
2. Build speed (fastest dev server, fastest HMR, fastest production build)
3. Feature fit (best node-based canvas library, best visual testing support)
4. Minimal dependency count (fewer moving parts = fewer things to break)

## Recommended Stack

### Frontend Framework: Svelte 5 + SvelteKit

**Why not React or Vue:**
- Svelte compiles to vanilla JS at build time — no virtual DOM runtime overhead
- Bundle size is 10x smaller than equivalent React apps
- Faster initial load, faster updates, lower memory usage
- n8n itself uses Vue, but we're not extending n8n — we're building a separate client. Using Vue would add no compatibility benefit since we talk to n8n via REST API only
- React has the largest ecosystem but also the largest runtime overhead. Since AI is writing the code (not a human team that needs to hire React devs), ecosystem size is irrelevant

**Why Svelte 5 specifically:**
- Svelte 5 introduced "runes" — a fine-grained reactivity system that eliminates unnecessary re-renders
- SvelteKit provides file-based routing, SSR/SSG adapter, and built-in Vite integration
- SvelteKit with `@sveltejs/adapter-static` compiles to a pure static SPA — perfect for Tauri

### Canvas Library: Svelte Flow (@xyflow/svelte)

**Why:**
- Svelte Flow 1.0 released with full feature parity with React Flow (24k+ stars)
- Built specifically for node-based UIs: drag-and-drop, zoom/pan, custom nodes, custom edges, minimap
- Supports custom connection types — needed for n8n's AI-specific ports (ai_languageModel, ai_outputParser)
- Same core engine (@xyflow/system) as React Flow, proven at scale
- Native Svelte 5 integration — no framework bridge overhead

**Alternatives considered:**
- React Flow: Would require React, adding ~40KB runtime overhead for no benefit
- Vue Flow: Would require Vue, same issue
- Custom canvas (HTML5 Canvas/WebGL): Massive implementation effort for basic node interactions that xyflow provides out of the box

### Desktop Shell: Tauri 2

**Why not Electron:**
- Tauri apps are ~2.5MB vs Electron's ~150MB (60x smaller)
- Tauri uses ~30MB RAM vs Electron's ~150-300MB (5-10x less)
- Tauri starts in <0.5s vs Electron's 1-2s
- Tauri uses the system webview (WebKit on macOS) — no bundled Chromium
- Tauri's Rust backend can write debug.log files directly (solves the Req 40 filesystem issue)
- Tauri 2 has first-class SvelteKit support

**Why not browser-only SPA:**
- CORS issues when calling localhost:5678 from a different port
- Can't write debug.log files from the browser
- Can't be distributed as a standalone app
- Tauri solves all three with minimal overhead

### Build Tool: Vite (built into SvelteKit)

**Why:**
- SvelteKit uses Vite natively — zero additional config
- Dev server cold start: ~400ms (vs Webpack's 28s)
- HMR updates: ~10-20ms (vs Webpack's 2-3s)
- Production build: ~2s (vs Webpack's 45s)
- Vite 8 with Rolldown is 10-30x faster than Rollup

### CSS: Tailwind CSS 4

**Why:**
- Utility-first — no CSS files to manage, styles are co-located with markup
- Smallest possible CSS output (purges unused styles)
- Dark/light theme support via `dark:` variant (matches Req 12/30)
- n8n uses a similar color palette — easy to match with Tailwind config

### Unit Testing: Vitest

**Why:**
- Native Vite integration — shares the same config, no duplicate pipeline
- 4-10x faster than Jest
- Jest-compatible API — same `describe/it/expect` syntax
- Built-in TypeScript and ESM support
- Built-in code coverage

### E2E / Visual Testing: Playwright

**Why:**
- Built-in `toHaveScreenshot()` for visual regression testing (matches Req 41-43)
- Built-in screenshot diff with pixelmatch — no additional library needed
- Fastest E2E runner (parallel execution, browser contexts)
- First-class support for Tauri apps via `@playwright/test`
- Generates HTML reports out of the box (matches Req 41 AC#13)

### Language: TypeScript (strict mode)

**Why:**
- Type safety catches bugs at compile time — critical when AI is writing code
- Svelte 5, SvelteKit, Tauri, Vitest, and Playwright all have first-class TS support
- Strict mode prevents the most common AI-generated code issues (null access, type mismatches)

### State Management: Svelte 5 Runes (built-in)

**Why:**
- Svelte 5's `$state`, `$derived`, `$effect` runes replace the need for external state libraries
- No Redux, Zustand, Pinia, or similar — one less dependency
- Fine-grained reactivity means only the exact DOM nodes that changed get updated

### HTTP Client: Built-in fetch (via Tauri's HTTP plugin or SvelteKit's fetch)

**Why:**
- No axios or other HTTP library needed
- Tauri's HTTP plugin bypasses CORS entirely (requests go through Rust, not the browser)
- SvelteKit's `fetch` works in both SSR and client contexts

## Full Dependency List

| Package | Purpose | Size |
|---------|---------|------|
| svelte | UI framework | ~10KB runtime |
| @sveltejs/kit | App framework + routing | (dev dependency) |
| @sveltejs/adapter-static | Static SPA build for Tauri | (dev dependency) |
| @xyflow/svelte | Node-based canvas | ~50KB |
| @tauri-apps/cli | Desktop shell build tool | (dev dependency) |
| @tauri-apps/api | Tauri JS API (filesystem, etc.) | ~5KB |
| tailwindcss | CSS utility framework | (dev dependency, purged in build) |
| typescript | Type checking | (dev dependency) |
| vitest | Unit testing | (dev dependency) |
| @playwright/test | E2E + visual testing | (dev dependency) |

**Total runtime dependencies: 3** (svelte, @xyflow/svelte, @tauri-apps/api)
**Estimated production bundle: ~65KB gzipped**

## Architecture Summary

```
┌─────────────────────────────────────────┐
│              Tauri 2 (Rust)             │
│  ┌───────────────────────────────────┐  │
│  │     System WebView (WebKit)       │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   SvelteKit SPA             │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │   Svelte Flow Canvas  │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Rust Backend:                          │
│  - HTTP proxy (bypasses CORS)           │
│  - File I/O (debug.log, exports)        │
│  - .env reader                          │
└──────────────┬──────────────────────────┘
               │ HTTP (no CORS issues)
               ▼
┌─────────────────────────────────────────┐
│     n8n Instance (localhost:5678)        │
│     Public API: /api/v1/*               │
└─────────────────────────────────────────┘
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build production SPA |
| `npm run tauri dev` | Start Tauri desktop app in dev mode |
| `npm run tauri build` | Build distributable desktop app |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:visual` | Run visual E2E tests (Playwright) |
| `npm run test:update-baselines` | Update visual test baselines |
| `npm run update-node-registry` | Fetch node type definitions from n8n |
