---
"gdu": patch
---

Fix chunks importing from wrapper entry by rewriting references to inner file

Chunks that import exports from the entry file (e.g. lazy-loaded page components) would get `SyntaxError: does not provide an export named 't'` because the wrapper entry has no exports. After creating the wrapper, the plugin now scans all non-entry chunks and rewrites references from the original entry filename to the inner filename.
