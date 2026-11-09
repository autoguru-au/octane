---
'gdu': minor
---

fix(AG-22695): disable Next.js image optimisation in the shared Next config

`images.unoptimized` is now `true` in GDU's shared Next config. Next no longer
mounts the `/_next/image` route, so every Next MFE built with GDU stops serving
that endpoint.

The optimiser was attack surface with no consumers. No app renders `next/image`
— every image already resolves through the AutoGuru image server via
`useAgImageServerUrl` — while the endpoint itself is public and unauthenticated,
takes a caller-supplied URL and makes the Lambda fetch it from inside the
private network. It carried CVE-2026-94483 (SSRF in Image Optimization, High
8.3, only exploitable when `images.remotePatterns` is configured, which GDU
does) and a second advisory covering unauthenticated RCE via crafted SVG, which
configuration rather than version was holding shut: `dangerouslyAllowSVG` merely
happens to be unset.

Upgrading Next patches those two advisories; switching the route off removes the
whole class, independent of version, and drops the dependency on DNS hygiene
across the three wildcard `remotePatterns` zones.

**Breaking for any app that wants `next/image`.** Set `unoptimized: false` in
that app's own `next.config` to re-enable the optimiser — and note that doing so
re-opens the SSRF surface above.
