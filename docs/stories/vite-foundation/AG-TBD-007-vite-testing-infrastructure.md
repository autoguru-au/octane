# Story: PM. Build Tooling. As a Developer, I want Vite testing infrastructure, so that I can validate build outputs and performance

## Story Details

**Story ID**: AG-TBD-007
**Epic**: AG-EPIC-VITE - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 2

## Description

### Summary
We need a comprehensive testing infrastructure for Vite builds that validates plugin behavior, build manifest structure, translation handling, and performance metrics. This ensures Vite builds produce identical outputs to webpack and meet our quality standards.

### User Value
Developers can confidently migrate to Vite knowing that automated tests catch regressions, validate compatibility, and ensure performance targets are met.

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Given Vite plugins, When unit tests run, Then coverage is >80% | ☐ | ☐ | ☐ |
| 2 | Given build manifest, When integration test runs, Then structure matches webpack schema exactly | ☐ | ☐ | ☐ |
| 3 | Given translation manifests, When validated, Then all required properties exist | ☐ | ☐ | ☐ |
| 4 | Given webpack and Vite builds, When outputs compared, Then bundle contents are functionally equivalent | ☐ | ☐ | ☐ |
| 5 | Given build performance, When benchmarked, Then metrics are tracked and reported | ☐ | ☐ | ☐ |
| 6 | Given CI/CD pipeline, When tests run, Then Vite builds are validated on every PR | ☐ | ☐ | ☐ |

### Testing Categories

| Category | Coverage Target | Description |
|----------|----------------|-------------|
| Unit Tests | >80% | Plugin logic, utility functions |
| Integration Tests | 100% of plugins | Full build tests, manifest validation |
| Comparison Tests | All environments | webpack vs Vite output comparison |
| Performance Tests | All build types | Build time, bundle size benchmarks |

## Technical Implementation

### Test Structure

```
packages/gdu/
├── config/
│   └── vite/
│       ├── __tests__/
│       │   ├── vite.config.test.ts
│       │   ├── integration/
│       │   │   ├── build-manifest.test.ts
│       │   │   ├── translation-hashing.test.ts
│       │   │   └── multi-env-build.test.ts
│       │   └── utils/
│       │       ├── externals.test.ts
│       │       └── environment.test.ts
│       └── plugins/
│           └── __tests__/
│               ├── GuruBuildManifest.test.ts
│               └── TranslationHashing.test.ts
```

### Unit Tests

```typescript
// packages/gdu/config/vite/plugins/__tests__/GuruBuildManifest.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GuruBuildManifestPlugin } from '../GuruBuildManifest';
import { build } from 'vite';
import { readFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('GuruBuildManifestPlugin', () => {
  const testOutputDir = join(__dirname, 'test-output');

  beforeEach(() => {
    mkdirSync(testOutputDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testOutputDir, { recursive: true, force: true });
  });

  it('should generate build-manifest.json with correct structure', async () => {
    const plugin = GuruBuildManifestPlugin({
      outputDir: testOutputDir,
      mountDOMId: 'test-app',
      mountDOMClass: 'mfe-container',
      publicPath: '/test/',
    });

    // Mock build and test
    const manifestPath = join(testOutputDir, 'build-manifest.json');
    // ... test implementation
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    expect(manifest).toMatchObject({
      hash: expect.any(String),
      mountDOMId: 'test-app',
      mountDOMClass: 'mfe-container',
      assets: {
        js: expect.any(Array),
        css: expect.any(Array),
      },
      chunks: {
        js: expect.any(Array),
        css: expect.any(Array),
      },
    });
  });

  it('should prefix all paths with publicPath', async () => {
    // Test implementation
  });

  it('should exclude chunks when includeChunks is false', async () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// packages/gdu/config/vite/__tests__/integration/build-manifest.test.ts
import { describe, it, expect } from 'vitest';
import { build } from 'vite';
import { createViteConfig } from '../../vite.config';
import { readFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';

describe('Build Manifest Integration', () => {
  it('should generate manifest matching webpack schema', async () => {
    // Build with Vite
    const config = createViteConfig('test', false, false);
    await build(config);

    // Load manifest
    const manifestPath = join(config.build.outDir, 'build-manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    // Validate against schema
    const schema = {
      type: 'object',
      required: ['hash', 'assets', 'mountDOMId'],
      properties: {
        hash: { type: 'string', pattern: '^[a-f0-9]{8}$' },
        mountDOMId: { type: 'string' },
        mountDOMClass: { type: 'string' },
        frameless: { type: 'boolean' },
        assets: {
          type: 'object',
          required: ['js', 'css'],
          properties: {
            js: { type: 'array', items: { type: 'string' } },
            css: { type: 'array', items: { type: 'string' } },
          },
        },
        chunks: {
          type: 'object',
          properties: {
            js: { type: 'array', items: { type: 'string' } },
            css: { type: 'array', items: { type: 'string' } },
          },
        },
        i18n: { type: 'object' },
      },
    };

    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(manifest);

    expect(valid).toBe(true);
    if (!valid) {
      console.error('Validation errors:', validate.errors);
    }
  });

  it('should include i18n information when translations exist', async () => {
    // Test implementation
  });
});
```

### Comparison Tests

```typescript
// packages/gdu/config/vite/__tests__/integration/webpack-vite-comparison.test.ts
import { describe, it, expect } from 'vitest';
import { build as viteBuild } from 'vite';
import webpack from 'webpack';
import { createViteConfig } from '../../vite.config';
import webpackConfig from '../../../webpack/webpack.config';

describe('Webpack vs Vite Output Comparison', () => {
  it('should produce functionally equivalent manifests', async () => {
    // Build with both
    const viteManifest = await buildAndGetManifest('vite');
    const webpackManifest = await buildAndGetManifest('webpack');

    // Compare structure (not exact match due to hashes)
    expect(Object.keys(viteManifest)).toEqual(Object.keys(webpackManifest));
    expect(viteManifest.assets.js.length).toBe(webpackManifest.assets.js.length);
    expect(viteManifest.assets.css.length).toBe(webpackManifest.assets.css.length);
  });

  it('should produce similar bundle sizes (±10%)', async () => {
    // Test implementation
  });
});
```

### Performance Tests

```typescript
// packages/gdu/config/vite/__tests__/performance.test.ts
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('Vite Build Performance', () => {
  it('should complete build in under 60 seconds for typical MFE', async () => {
    const start = performance.now();
    const config = createViteConfig('test', false, false);
    await build(config);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(60000); // 60 seconds
  });

  it('should be faster than webpack', async () => {
    const viteTime = await measureBuildTime('vite');
    const webpackTime = await measureBuildTime('webpack');

    // Vite should be at least 2x faster
    expect(viteTime).toBeLessThan(webpackTime / 2);
  });
});
```

### CI/CD Integration

```yaml
# .github/workflows/vite-tests.yml
name: Vite Build Tests

on:
  pull_request:
    paths:
      - 'packages/gdu/config/vite/**'
      - 'packages/gdu/commands/build/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run Vite unit tests
        run: yarn workspace @autoguru/gdu test:vite

      - name: Run integration tests
        run: yarn workspace @autoguru/gdu test:vite:integration

      - name: Compare webpack vs Vite builds
        run: yarn workspace @autoguru/gdu test:vite:comparison

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: packages/gdu/test-results/
```

## Definition of Done

- [x] Unit tests written for all plugins (>80% coverage)
- [x] Integration tests validate manifest structure
- [x] Comparison tests verify webpack compatibility
- [x] Performance benchmarks established
- [x] CI/CD job created and passing
- [x] Test documentation added

## Dependencies

**Blocked By**: AG-TBD-001, AG-TBD-002, AG-TBD-003
**Blocks**: AG-TBD-008 (needs passing tests before pilot migration)

## Story Points: 5

**Complexity**: Medium - Standard testing infrastructure but comprehensive coverage needed
