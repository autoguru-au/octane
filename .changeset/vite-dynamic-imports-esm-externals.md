---
'gdu': minor
---

Upgrade from Vite 7 to Vite 8 (Rolldown + OXC)

- Bump `vite` dependency from `^7.0.0` to `^8.0.0-beta.0` — replaces Rollup + esbuild with Rolldown + OXC for 10-30x faster bundling
- Rename `rollupOptions` to `rolldownOptions` and `esbuild` config to `oxc` across all Vite configuration
- Change `minify: 'esbuild'` to `minify: true` (OXC minifier is the new default)
- Import `esmExternalRequirePlugin` from `'vite'` instead of `'rolldown/plugins'` (now a first-class Vite 8 re-export)
- Fix bug where `external: undefined` was set when esmExternalRequirePlugin loaded, which would have caused all externals to be bundled
- Add `peerDependencyMeta` override for `@vanilla-extract/vite-plugin` to suppress Vite 8 peer dep warning
