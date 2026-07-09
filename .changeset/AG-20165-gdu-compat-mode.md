---
'gdu': minor
---

feat(AG-20165): compat mode — old single-env config contract as safe default

Restore the single-env config contract as the default build behaviour, with
multi-env emission now gated behind the `GDU_MULTI_ENV_CONFIG` env var.

Since 13.21.0 the SPA build unconditionally dropped the baked
`globalThis.__MFE_ENV__={...#{TOKEN}...}` init block (PR #439) and always
emitted per-combo config scripts plus a manifest `env` map (PR #441). An app
rebuilt under 13.21.0 therefore stopped producing the artefact the old host and
the 6 old pipelines expect — the `mfe-configs` chunk read
`globalThis.__MFE_ENV__` without anything ever assigning it, crashing on the
first config read.

The default (`GDU_MULTI_ENV_CONFIG` unset) now restores that contract byte-for-
byte at the chunk level: `mfeEnvTokens` again prepends the init block to the
`mfe-configs` chunk via a `bakeInitBlock` option, `multiEnvConfigEmitter` is
omitted from the plugin list, and the manifest carries no `env` key. Setting
`GDU_MULTI_ENV_CONFIG=1` opts into the 13.21.0 behaviour unchanged. The
`process.env.X` → `globalThis.__MFE_ENV__["X"]` key rewrite runs in both modes.

The env var is read once at the `config/vite/index.ts` seam and threaded through
`baseViteOptions`/`makeViteConfig` as a plain boolean, so both modes are
unit-testable without env mutation. This is transitional — once every SPA is
migrated the gate and the restored bake can be dropped.
