---
"gdu": minor
---

feat(AG-20098): upgrade GDU to Vite 8 stable and drop the single-config bake

The SPA build now runs on Vite 8 stable (`^8.1.3`), replacing the
`^8.0.0-beta.0` pin. Rolldown + OXC were already the active bundler/transform
path, so this is a version bump plus verification across the pilot SPA dev
server and production artefact build.

`mfeEnvTokens` no longer bakes a `globalThis.__MFE_ENV__={...}` init block into
the `mfe-configs` chunk. It keeps only its `process.env.X` →
`globalThis.__MFE_ENV__["X"]` key rewrite; initialising `__MFE_ENV__` moves to
the per-env/tenant config chunks emitted by `multiEnvConfigEmitter`
(04-gdu-vite8.md §2.3), landing separately. Until that emitter lands, the
production SPA artefact carries the config-key rewrites without an init block —
harmless while no consumer bumps its `gdu` dependency. The dev server is
unaffected (the plugin is build-only).
