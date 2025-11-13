---
"gdu": patch
---

fix: add Node types reference to generated tokens.ts

Fixes TypeScript errors when GDU generates tokens.ts that uses process.env.* but lacks proper type declarations. The generated file now includes `/// <reference types="node" />` directive, ensuring TypeScript can resolve the process global without manual fixes or post-processing scripts.
