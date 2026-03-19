---
"gdu": minor
"@autoguru/eslint-plugin": patch
"browserslist-config-autoguru": patch
---

Migrate monorepo tooling from Yarn to Bun

- Replace `find-yarn-workspace-root` with a built-in workspace root resolver in gdu
- Update Yarn CLI references to Bun across documentation and build scripts
- Add `.macro` extension to ESLint import resolution config
- Update browserslist browser version snapshot
