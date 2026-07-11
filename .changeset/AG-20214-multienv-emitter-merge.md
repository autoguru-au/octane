---
'gdu': patch
---

fix(AG-20214): merge multi-env config seeds instead of clobbering co-mounted apps

`multiEnvConfigEmitter` emitted each per-env/tenant config script as a bare
`globalThis.__MFE_ENV__={...}` whole-object assignment. On a page that injects
more than one app's config script — the app-shell Lambda generator, the legacy
portals, the shadow loader — the second script replaced the first app's
`globalThis.__MFE_ENV__` outright, so the earlier app lost every one of its
config keys and fell over on the first read. The divergence is real:
`mergeConfigSources` layers the global `env-configs/{env}_{tenant}.json` under
each app's `app-configs/<app>/{env}_{tenant}.json` and then filters to that
app's `allowKeys`, so two co-mounted apps genuinely carry different key sets.

The emitted seed now merges into any existing global rather than replacing it:

    globalThis.__MFE_ENV__=Object.assign(globalThis.__MFE_ENV__||{},{...});

- The first seed on a page is unchanged. The global starts undefined, `||{}`
  seeds a fresh object, and the resulting `__MFE_ENV__` is identical to before.
- A later seed from a second co-mounted app adds its keys instead of wiping the
  first app's.
- Overlapping keys stay last-wins. Global-config keys shared across apps carry
  equal values by construction, so a genuine same-key/different-value clash
  between two apps' app-configs is a data-layout concern, not something the
  emitter can resolve.
- Transition caveat: an old bare-assign artefact built before this release,
  seeded after a new merge artefact, still clobbers. New artefacts are safe
  after old ones; the residual case clears as every app rebuilds on this gdu
  release.

The sibling single-env init block in `mfeEnvTokens.ts` is deliberately left
untouched — it is byte-locked to the old host + 6-pipeline contract by test, and
its bare assign is the accepted transition case that ages out as apps rebuild.
