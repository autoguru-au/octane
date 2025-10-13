---
'gdu': patch
---

Fix React Compiler production and development builds with externalized React

**React Compiler Fix:**
- Remove duplicate React Compiler processing that caused `useMemoCache` errors in both production and development
- Create custom webpack loader using official babel-plugin-react-compiler v1.0.0
- Remove dependency on third-party react-compiler-webpack package
- Include critical jsescOption fix for webpack compatibility (React #29120)
- Reduce bundle size by eliminating duplicate compilation passes

**Relay Upgrade:**
- Upgrade babel-plugin-relay to v20.1.1 (from v18.2.0)
- Update for compatibility with React 19.2.0
- Includes improvements to ESM module generation
- Improved type safety for conditional fragments

This fixes build failures where the React Compiler was running twice (webpack loader + Babel plugin), causing issues with externalized React from esm.sh.
