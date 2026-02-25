---
"gdu": patch
---

fix(gdu): centralise Octopus deploy tokens in mfe-configs chunk for Vite builds

Rolldown constant-folds string literals from Vite's `define` across consumer
chunks, scattering `#{...}` Octopus tokens into dozens of files. The deployment
pipeline's `tokenReplacement.sh` only processes `mfe-configs`, so scattered
tokens were left un-replaced at runtime.

Added `mfeEnvTokens` plugin (`enforce: 'pre'`) that rewrites `process.env.XXX`
to `globalThis.__MFE_ENV__["XXX"]` before `define` runs. Dynamic property
access cannot be constant-folded, keeping all tokens inside the `mfe-configs`
chunk. The chunk is also routed to the dist root (not `chunks/`) so Octopus
TokenReplacement can find it.
