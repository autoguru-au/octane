---
"gdu": minor
---

Enforce Webpack usage for Next.js 16 via --webpack flag

- Added `--webpack` flag to Next.js dev server command in `config/ssr/server.ts`
- Added `--webpack` flag to Next.js build command in `commands/build/buildSSR.ts`
- Added Vanilla Extract refresh stub loader for SSR compatibility
- Enforces Webpack over Turbopack (Next.js 16 default) for Vanilla Extract compatibility
