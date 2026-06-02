---
"gdu": patch
---

Vite dev server now serves shared-package (`pkg-*`) locales.

The Vite `TranslationHashingPlugin` only runs at build time (`apply: 'build'`), so the dev server never made package translation namespaces available — they rendered as raw i18n keys (e.g. `tips.selectFleet.title`) for every Vite MFE, even though the keys exist and resolve in production. A new dev plugin mirrors the webpack path: it copies each discovered package's declared `i18n.namespaces` locales into the consuming app's `public/locales/<lang>/` at dev-server start. Production builds are unaffected.
