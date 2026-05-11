/**
 * Single source of truth for AutoGuru's runtime CDN origins.
 *
 * `ESM_CDN_BASE` hosts the bare-specifier esm bundles consumed by MFE externals
 * (React, ReactDOM, DataDog SDKs). It is a global hostname with no env or
 * tenant variation, served from S3 via CloudFront with immutable cache headers.
 *
 * Build-time consumers in gdu (`getExternals` in `./externals`) and the
 * mfe Lambda HTML generator (wave 2 — AG-18112) both import from here so the
 * origin can be rotated in exactly one place.
 */
export const ESM_CDN_BASE = 'https://esm.autoguru.com';
