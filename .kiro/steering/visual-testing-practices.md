---
inclusion: auto
---

# Visual Testing Best Practices

## Core Principle

A test that checks "does the element exist" is NOT a visual test. Visual tests must verify that the UI looks correct, not just that it renders without crashing.

## What Went Wrong Previously

1. Tailwind CSS 4 requires `@tailwindcss/vite` plugin — without it, zero styles load and the app renders as raw unstyled HTML. Tests still passed because they only checked DOM existence.
2. Tests used `waitForLoadState('networkidle')` which hangs when the app has polling/retry loops.
3. Tests didn't use `toHaveScreenshot()` for visual comparison — they just took screenshots without comparing them to anything.
4. No baseline screenshots existed to compare against.

## Rules for Visual E2E Tests

### 1. Always Use `toHaveScreenshot()` for Visual Assertions
```typescript
// BAD — just checks element exists
await expect(page.locator('nav')).toBeVisible();

// GOOD — compares actual rendering to baseline
await expect(page).toHaveScreenshot('overview-page.png', { maxDiffPixelRatio: 0.02 });
```

### 2. Verify CSS is Actually Loading
Before running visual tests, verify Tailwind is working:
- Check that `@tailwindcss/vite` is in `vite.config.ts` plugins
- Check screenshot file sizes (styled pages are 30-100KB, unstyled are 3-5KB)
- If screenshots are tiny, CSS is broken

### 3. Wait for Content, Not Network
```typescript
// BAD — hangs if app has polling
await page.waitForLoadState('networkidle');

// GOOD — wait for specific content to appear
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('nav', { state: 'visible' });
```

### 4. Scope Locators to Avoid Ambiguity
```typescript
// BAD — "Overview" appears in sidebar AND page heading
await expect(page.getByText('Overview')).toBeVisible();

// GOOD — scope to the sidebar
const sidebar = page.locator('nav').first();
await expect(sidebar.getByText('Overview')).toBeVisible();
```

### 5. First Run Creates Baselines
On first run, `toHaveScreenshot()` creates baseline images in `tests/e2e/*.spec.ts-snapshots/`. Subsequent runs compare against these. To update baselines:
```bash
npx playwright test --update-snapshots
```

### 6. Check Screenshots After Every Test Run
Screenshots go to `test-results/screenshots/`. Always check them visually — a passing test doesn't mean the UI looks good.

### 7. Test Against Mock Screens
Compare screenshots against the ASCII mockups in `docs/mock-screens/` to verify the UI matches the design intent.

## Tailwind CSS 4 + SvelteKit Setup Checklist

1. `@tailwindcss/vite` installed as devDependency
2. `tailwindcss()` added to `vite.config.ts` plugins array (BEFORE sveltekit)
3. `src/app.css` has `@import "tailwindcss";`
4. `src/routes/+layout.svelte` imports `../app.css`
5. No `tailwind.config.js` needed for v4 (config is in CSS via `@theme`)

## Self-Healing Test Loop

1. Run `npx playwright test --workers=1`
2. Check `test-results/screenshots/` — are pages styled?
3. If screenshots are tiny (<10KB), CSS is broken. Fix vite.config.ts.
4. If layout is wrong, fix the component.
5. If test fails on locator, check if the DOM structure changed.
6. After fixing, run `npx playwright test --update-snapshots` to update baselines.
7. Commit baselines to git.
