---
"gdu": patch
---

Fix webpack error handling in build process

Fixed a race condition in webpack compilation where errors were being silently swallowed due to incorrect promise resolution order. The compiler.close() callback was resolving the promise before error handling could occur, causing compilation errors to never be displayed to developers. Now errors are properly handled and logged to the console.