---
'gdu': patch
---

Replace require() with native dynamic import and add Rolldown ESM external plugin

- Switch Vite and Vanilla Extract imports from synchronous `require()` to native dynamic `import()` to prevent TypeScript CJS output from rewriting them
- Integrate Rolldown's `esmExternalRequirePlugin` to properly convert CJS `require()` calls for externalised modules into ESM imports
- Extend VitePlugin type with `renderChunk` hook support
