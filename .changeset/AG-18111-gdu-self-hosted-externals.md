---
'gdu': minor
---

feat(AG-18111): emit self-hosted esm CDN URLs for runtime externals in production builds

`getExternals()` now emits `https://esm.autoguru.com/<pkg>@<version>[/<subpath>]` for
the 8 React + DataDog externals in production builds (webpack and vite). The URL
shape is a drop-in replacement for `esm.sh` — same path structure, single hostname,
no env/tenant variation. Local dev server (`gdu start`) continues to use `esm.sh`.
Standalone MFEs are unaffected.
