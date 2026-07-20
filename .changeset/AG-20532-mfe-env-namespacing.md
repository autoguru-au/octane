---
'gdu': minor
---

fix(AG-20532): namespace the injected env per app so co-mounted MFEs stop clobbering each other

`mfeEnvTokens` and `multiEnvConfigEmitter` wrote every app's config into a
single flat `globalThis.__MFE_ENV__` object, keyed only by config name. That
object is shared across every MFE co-mounted on a page, so two apps that read
the same key — `mfeBasePath` is the load-bearing one — overwrote one another:
the last config script to load won, and every reader saw its value. On a
deep-linked supplier-portal child page the scripts load
`[shell-config, child-config, shell-main, child-main]`, so the shell captured
the child's relative `mfeBasePath` instead of its own absolute URL and built
compounding aside-nav hrefs (`/nz/pricing/nz/pricing/...`); child routers then
stopped matching and rendered blank. The whole `sp-*` family was affected and
the mechanism is generic to every portal that co-mounts a shell with a child.

The reads and writes are now namespaced under the building app's own name
(`getProjectName()`):

- `mfeEnvTokens` rewrites `process.env.X` to
  `globalThis.__MFE_ENV__["<app>"]["X"]`, and its single-env baked init block
  seeds `globalThis.__MFE_ENV__["<app>"]` via a non-destructive merge that
  leaves a co-mounted app's namespace intact.
- `multiEnvConfigEmitter` writes each combo's values under
  `globalThis.__MFE_ENV__["<app>"]` with the same merge.

Every bundle now reads only its own namespace, so the outcome no longer depends
on script order. The read-rewrite and both write sites derive the namespace
from the same `getProjectName()` in one build, so they always agree. The
`#{TOKEN}`+`sed` deploy contract is unchanged — the placeholders still sit
inside the namespaced object. Webpack builds constant-fold config into each
bundle and never touch `__MFE_ENV__`, so they are unaffected; SSR/serverless
keep their `#{TOKEN}`+`sed` path.

Because the layout of the shared object changes, every app co-mounted on a page
must be rebuilt on this release together — the release train rebuilds each
portal family as a unit, so this holds by construction.
