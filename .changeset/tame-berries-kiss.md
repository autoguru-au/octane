---
'gdu': patch
---

GDU html-webpack-plugin requires template to be a string, and never undefined.

**BUG FIXES**

When no consumer template.html the property should be set to `auto`
