---
"gdu": patch
---

Fix webpack error handling in build process. Fixed a race condition in webpack compilation where errors were not returned due to incorrect promise resolution order.
