---
"gdu": minor
---

feat(gdu): add runtime public path resolution for Vite builds

Vite builds could not use Octopus Deploy `#{PUBLIC_PATH_BASE}` tokens because
the `base` config gets baked into minified JS where token substitution fails.
This caused CSS and JS chunks to load from incorrect paths (`/chunks/...`
instead of the CDN URL), resulting in `text/html` MIME type errors in deployed
environments.

Added `runtimePublicPath` plugin that derives the CDN base URL at runtime from
`import.meta.url` of the entry chunk — mirroring how webpack's
`__webpack_require__.p` mechanism works via `set-public-path.js`.

The build manifest keeps bare filenames (matching the webpack convention) so the
app shell Lambda can add the CDN prefix as before. The `#{PUBLIC_PATH_BASE}`
tokens are not used in the manifest because the deployment pipeline does not
substitute them in JSON files served from the CDN.
