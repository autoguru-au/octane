# Vite 8 + Rolldown Upgrade — Status & Testing Guide

**Branch:** `feat/AG-17612-vite-dynamic-imports-and-esm-externals`
**Date:** 2026-02-24

---

## Current Status

All code changes are complete in octane. TypeScript compiles cleanly, lint passes, and all 71 tests pass. The changes have **not yet been tested** with a real MFE build — the local prod server was serving stale assets from a previous build.

---

## What Changed (Summary)

| File | Change |
|------|--------|
| `packages/gdu/package.json` | `vite` bumped from `^7.0.0` to `^8.0.0-beta.0`; added `peerDependencyMeta` for `@vanilla-extract/vite-plugin` |
| `packages/gdu/config/vite/types.ts` | Renamed `Rollup*` types to `Rolldown*`; added `oxc` config type alongside existing `esbuild` type; `minify` type widened to `boolean \| string` |
| `packages/gdu/config/vite/vite.config.ts` | `rollupOptions` renamed to `rolldownOptions`; `minify: 'esbuild'` changed to `minify: true` (OXC minifier); added `oxc` config block for JSX transform; kept `esbuild` config for `pure` + `legalComments` (deprecated but functional in Vite 8) |
| `packages/gdu/commands/build/buildSPA-vite.ts` | `esmExternalRequirePlugin` imported from `'vite'` instead of `'rolldown/plugins'`; **fixed bug** where `external: undefined` was set when the plugin loaded (would have bundled all externals); simplified merge config |
| `packages/gdu/commands/start/runSPA-vite.ts` | Added `oxc: base.oxc` for JSX in dev; `esbuild.pure` cleared for dev mode |
| `.changeset/vite-dynamic-imports-esm-externals.md` | Updated to `minor` bump with Vite 8 upgrade description |

---

## Key Architectural Decisions

### OXC vs esbuild coexistence

Vite 8 introduces `oxc` as the new transform engine and deprecates `esbuild`. However, both can coexist:

- **`oxc`** handles JSX/TS transforms (the `jsx: { runtime: 'automatic', importSource: 'react' }` config)
- **`esbuild`** (deprecated but functional) handles the renderChunk pass for `pure` (console stripping) and `legalComments: 'none'`

There is no direct OXC equivalent of esbuild's `pure: ['console.log', ...]` option. Rolldown's minifier has `dropConsole: boolean` in `CompressOptions`, but that drops **all** console methods including `console.error`. Our config selectively strips `log`, `info`, `debug`, and `warn` while preserving `error`.

**Note:** With `minify: true` (OXC minifier), the esbuild renderChunk plugin runs for target downlevelling but with `treeShaking: false`, so the `pure` annotations may not actually strip console calls in the final output. If console stripping is critical, consider either:
1. Changing `minify` to `'esbuild'` (keeps esbuild as the minifier)
2. Using `define` to replace console methods with no-ops: `'console.log': '(()=>{})'`

### The external removal bug fix

The previous code had:
```ts
...(hasEsmExternalPlugin ? { external: undefined } : {})
```
This would set `external` to `undefined` when `esmExternalRequirePlugin` loaded successfully — effectively removing all externals from the Rolldown config and causing them to be bundled into the output. The `esmExternalRequirePlugin` is designed to **coexist** with `external`, not replace it. The plugin handles CJS `require()` shims while `external` keeps the modules out of the bundle.

---

## How to Test with fmo-booking

### Step 1: Build gdu in octane

```bash
cd ~/Documents/GitHub/octane
yarn workspace gdu build
```

### Step 2: Copy gdu build to MFE

```bash
cd ~/Documents/GitHub/mfe
yarn gdu:local
```

This runs `.scripts/copy-gdu.js` which:
1. Builds gdu in the sibling `octane` repo (`yarn workspace gdu build`)
2. Copies `octane/packages/gdu/dist/` to `mfe/node_modules/gdu/dist/`
3. Copies `octane/packages/gdu/entry/` to `mfe/node_modules/gdu/entry/`
4. Copies `octane/packages/babel-preset/` to `mfe/node_modules/@autoguru/babel-preset/`

**Important:** The `copy-gdu.js` script runs its own `yarn workspace gdu build` internally, so you don't strictly need Step 1 separately. However, running it first lets you catch TypeScript errors before copying.

### Step 3: Ensure Vite 8 is installed in MFE

The MFE's `node_modules/gdu/node_modules/vite` (or the hoisted `node_modules/vite`) must be Vite 8. Since `gdu:local` only copies the `dist/` and `entry/` directories, it does **not** update `node_modules/vite`.

You need to ensure the MFE has Vite 8 available. The simplest approach:

```bash
cd ~/Documents/GitHub/mfe

# Check current vite version
node -e "console.log(require('vite/package.json').version)"

# If it's still 7.x, you may need to manually update or add a resolutions override
# in the MFE root package.json:
#   "resolutions": { "vite": "8.0.0-beta.15" }
# Then run:
yarn install
```

### Step 4: Build fmo-booking

```bash
cd ~/Documents/GitHub/mfe
APP_ENV=dev_au yarn workspace @autoguru/fmo-booking build:mfe
```

### Step 5: Verify the build output

```bash
# Check build manifest exists
cat apps/fmo-booking/dist/dev_au/build-manifest.json | jq .

# Check the main JS bundle imports externals from esm.sh (not bundled inline)
head -5 apps/fmo-booking/dist/dev_au/main-*.js

# Check for external import specifiers in the bundle
grep -c 'esm.sh' apps/fmo-booking/dist/dev_au/main-*.js

# Check bundle size (should be significantly smaller than 2.6 MB)
du -sh apps/fmo-booking/dist/dev_au/main-*.js
```

**What to look for:**
- The main JS should have `import` statements pointing to `esm.sh` URLs for react, react-dom, @datadog/*, etc.
- These modules should NOT be bundled inline
- Bundle size should be significantly smaller than 2.6 MB

### Step 6: Test with the local prod server

```bash
# Kill any existing server on port 8080
lsof -ti :8080 | xargs kill -9 2>/dev/null

# Start fresh server (reads build manifest at startup)
node .scripts/mfe-local-prod-server.js fmo-booking dev au 8080
```

Then open: http://localhost:8080/au/custom-fleet/booking

**Important:** The local prod server caches `build-manifest.json` at startup. If you rebuild, you **must** restart the server to pick up the new asset hashes.

---

## What Was Tried During Investigation

### Browser debugging session

Navigated to `http://localhost:8080/au/custom-fleet/booking?status=COMPLETED&...` and found:

1. **Page was blank** — only the environment banner and empty `<div id="__app__">` rendered
2. **Network tab showed 4 requests**, all returning HTTP 200:
   - The HTML document
   - `main-DZvqnZTf.css` (200)
   - `main-Cm3RdaoF.js` (200)
   - `favicon.ico` (200)
3. **The JS file was returning HTML** — `curl http://localhost:8080/main-Cm3RdaoF.js` returned the SPA fallback HTML, not JavaScript
4. **Root cause:** The build manifest on disk contained `main-B8JrHicf.js` but the server was serving HTML referencing `main-Cm3RdaoF.js` — the server had been started with an older build and the manifest was cached at startup. The hash mismatch meant `express.static` couldn't find the file, so the catch-all `app.get('*')` returned HTML instead

### Verification completed

- `tsc --noEmit` — passes (no type errors)
- `yarn lint` — passes
- `yarn test` — all 71 tests pass (11 suites)
- `yarn install` — resolved Vite 8.0.0-beta.15 + Rolldown 1.0.0-rc.5 successfully
- `esmExternalRequirePlugin` — confirmed exported from `vite` in v8 (`typeof vite.esmExternalRequirePlugin === 'function'`)
- Rolldown `OutputOptions.paths` — confirmed supported (for external URL rewriting)

---

## Known Risks

1. **Vite 8 is beta** (`8.0.0-beta.15`) — may have undiscovered bugs
2. **`@vanilla-extract/vite-plugin`** doesn't list `vite@8` in peer deps — added `peerDependencyMeta` override to suppress warnings. Rolldown supports Rollup plugins so it should work, but untested with this specific combination
3. **`esbuild.pure` may not strip console calls** with `minify: true` (OXC) — the esbuild renderChunk plugin runs for target downlevelling but with `treeShaking: false`. Verify by checking if `console.log` appears in production bundles
4. **Rolldown output format differences** — subtle differences between Rollup and Rolldown ES module output could cause runtime issues. Verify by checking import/export shapes in the bundle
