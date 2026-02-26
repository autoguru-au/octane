---
"gdu": minor
---

feat(gdu): add Overdrive barrel-splitting Vite plugin

Adds a Vite transform plugin that rewrites barrel imports from
`@autoguru/overdrive` into deep component imports using a static 136-entry
export manifest. This enables granular tree-shaking and prevents Vanilla
Extract CSS side-effect leakage from unused components.

Also fixes dev mode env token replacement for Vite 8/OXC — custom
`process.env.X` dotted member expressions are now correctly inlined via a
`devEnvReplace` pre-transform plugin, resolving broken routing in dev mode.
