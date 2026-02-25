---
"gdu": patch
---

fix(gdu): remove publicPath from Vite build manifest

The deployment pipeline does not substitute `#{PUBLIC_PATH_BASE}` tokens in
`build-manifest.json` served from the CDN. This caused the app shell Lambda to
produce double-prefixed URLs where the literal `#` acted as a URL fragment
identifier, breaking all asset loading for Vite-built MFEs.

The manifest now keeps bare filenames (matching the webpack convention) so the
Lambda can add the CDN prefix as before. The `runtimePublicPath` plugin
independently handles chunk URL resolution at runtime.
