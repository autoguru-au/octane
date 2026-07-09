---
"gdu": minor
---

feat(AG-20099): emit per-env/tenant config scripts and multi-env build manifest

Adds `multiEnvConfigEmitter`, which emits one init-only
`mfe-configs-<env>_<tenant>-<hash>.js` script per env×tenant combo an SPA
targets (read from `.mfe-data/mfe-list.json`), each a standalone
`globalThis.__MFE_ENV__={...}` assignment carrying that combo's real, resolved
config values (merged from `.mfe-data/env-configs` + `.mfe-data/app-configs`,
restricted to the keys the app actually reads). The host injects the matching
script ahead of the app bundle so config is initialised without a `sed` step.

`guruBuildManifest` now records these scripts in an `env` map
(`env[<env>_<tenant>].config`) per the 00-overview §4c schema. The `mfe-configs`
app chunk is left intact and env-agnostic — its bytes (and hash) no longer
depend on which env's values are in play, so the app bundle is identical across
combos while only the tiny config scripts differ. A shared `mfeDataReader`
resolves combos and merges config sources.
