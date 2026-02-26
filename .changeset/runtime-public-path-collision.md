---
"gdu": patch
---

fix(gdu): namespace runtime public path per MFE to prevent collisions

When multiple Vite-built MFEs load on the same page, they each set
`globalThis.__GDU_PUBLIC_PATH__` from their entry chunk. The last MFE to
load overwrites the global, causing earlier MFEs to resolve lazy-loaded CSS
chunks from the wrong CDN path (e.g. fmo-app-shell CSS fetched from
fmo-booking/, returning 403).

Replaced the single global with a per-MFE map
`globalThis.__GDU_PUBLIC_PATHS__[projectName]` so each MFE reads only its
own slot and concurrent MFEs no longer clobber each other's chunk resolution.
