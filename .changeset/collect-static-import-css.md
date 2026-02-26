---
"gdu": patch
---

Collect CSS from statically imported chunks in build manifest

The `collectEntryCssFiles` function now traverses the entry chunk's static import tree (via `chunk.imports`) to gather CSS from all transitively-imported chunks. Previously, only CSS from the entry chunk itself was included in `assets.css`, causing missing styles for MFEs that render statically-imported Overdrive components before any lazy route loads.
