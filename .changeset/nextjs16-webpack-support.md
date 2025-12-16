---
"gdu": minor
---

Add --webpack flag support for Next.js 16

- Added `--webpack` flag to Next.js dev server command in `config/ssr/server.ts`
- Added `--webpack` flag to Next.js build command in `commands/build/buildSSR.ts`
- Added Vanilla Extract refresh stub loader for SSR compatibility
- This ensures Webpack is used instead of Turbopack (Next.js 16 default)
