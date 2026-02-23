---
'gdu': minor
---

Add Vite build support with translation hashing, centralised types, and upgraded build configuration

- Integrate Vite support for SPA and SSR builds with shared externals configuration
- Add `TranslationHashingPlugin` for content-hashed i18n translation files with auto-discovery of workspace package translations and manifest generation
- Consolidate inline Vite/Rollup type definitions into a shared `types.ts` module
- Upgrade build targets from `es2020` to `es2022` and use hidden sourcemaps in production
- Bump Vite from `^6.2.0` to `^7.0.0` and Node.js engine minimum to `>=20.19.0`
- Improve dev server with warmup for `src/client.tsx` and additional Datadog packages in `optimizeDeps`
- Add `rollup-plugin-visualizer` for bundle analysis
- Add console warning when `tap()` hooks are used with the Vite bundler
