---
"gdu": patch
---

Fix rolldownExternalShim ESM import hoisting crash

The plugin previously used `renderChunk` to prepend a `require()` shim to the entry chunk. However, ES module static `import` declarations are always hoisted and evaluated before the module body runs, so chunks calling `require()` for externals (react, react-dom, etc.) would crash before the shim was set up.

Switched to `writeBundle`: the original entry code is moved to an inner file, and the entry becomes a thin wrapper with no static imports that sets up `globalThis.require` first, then dynamically imports the real entry via `await import()`.
