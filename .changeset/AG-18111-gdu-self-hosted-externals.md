---
'gdu': minor
---

feat(AG-18111): emit self-hosted CDN URLs for runtime externals in production builds

`getExternals()` now emits `#{PUBLIC_PATH_BASE}/_shared/externals/<pkg>@<version>/<entry>.js` for the 8 React + DataDog externals in production builds (Webpack and Vite). Local dev server continues to use `esm.sh`. Standalone MFEs are unaffected.

Requires the externals bundles to be uploaded to `_shared/externals/` under each tenant CDN — already provisioned via AG-18110.
