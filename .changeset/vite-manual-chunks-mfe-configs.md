---
"gdu": minor
---

feat(gdu): add manualChunks to Vite config for mfe-configs chunk naming

Routes all `packages/global-configs` modules into a `mfe-configs` named chunk, mirroring webpack's `splitChunks.cacheGroups.mfeConfigs` convention. This ensures CI token replacement (`tokenReplacement.sh`) can find and replace `#{...}` config tokens in Vite/Rolldown builds, fixing WebSocket subscription failures caused by unreplaced tokens in arbitrarily-named chunks.
