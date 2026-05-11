---
'gdu': minor
---

feat(AG-18111): emit self-hosted esm CDN URLs for runtime externals

`getExternals()` now emits `https://esm.autoguru.com/<pkg>@<version>[/<subpath>]`
for the 8 React + DataDog externals, replacing `esm.sh`. The URL shape is a
drop-in for `esm.sh` (same path structure, single global hostname, no env or
tenant variation), so the same origin is used by both production builds and the
local dev server. Standalone MFEs are unaffected.

The signature changes from `getExternals(standalone?: boolean)` to
`getExternals({ standalone?: boolean })` for readability.
