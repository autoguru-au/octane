---
"gdu": minor
---

feat(gdu): add @datadog/browser-logs to webpack externals

Add `@datadog/browser-logs` SDK to the webpack externals configuration, matching the pattern used for `@datadog/browser-rum` and `@datadog/browser-rum-react`.

This enables MFEs to import `@datadog/browser-logs` without bundling the SDK, instead referencing `window.DD_LOGS` which is loaded from CDN by the app-shell HTML generator.

**Related:** AG-17670
