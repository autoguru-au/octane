---
'gdu': patch
---

Harden rolldownExternalShim plugin for production resilience

- Use `chunk.isEntry` instead of filename pattern matching for entry chunk detection — decoupled from `chunkFileNames` config
- Remove fragile `code.includes()` content heuristic — shim is harmless if `require()` is never called at runtime
- Switch `Promise.all()` to `Promise.allSettled()` with per-import `.catch()` — single CDN failure no longer blanks the page
- Chain to existing `globalThis.require` when present — multiple Vite MFEs on the same page no longer overwrite each other's module caches
- Widen `renderChunk` chunk type to include `isEntry` property
