---
'gdu': minor
---

Fix React Compiler production builds with externalized React

- Remove duplicate React Compiler processing that caused `useMemoCache` errors
- Create custom webpack loader using official babel-plugin-react-compiler v1.0.0
- Remove dependency on third-party react-compiler-webpack package
- Include critical jsescOption fix for webpack compatibility (React #29120)
- Update babel-plugin-react-compiler to stable v1.0.0
- Reduce bundle size by eliminating duplicate compilation passes

This fixes production build failures introduced when upgrading to React Compiler 1.0.0, where the compiler was running twice (webpack loader + Babel plugin), causing issues with externalized React from esm.sh.
