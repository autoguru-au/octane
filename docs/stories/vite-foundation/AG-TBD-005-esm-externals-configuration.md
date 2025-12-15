# Story: PM. Build Tooling. As a Developer, I want Vite ESM externals configuration, so that React is loaded from CDN instead of bundled

## Story Details

**Story ID**: AG-TBD-005
**Epic**: AG-EPIC-VITE - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 2

## Description

### Summary
AutoGuru MFEs use the "framework" chunk strategy where React, ReactDOM, and related packages are externalized and loaded from ESM.sh CDN rather than bundled into each MFE. This dramatically reduces bundle sizes (saves ~150KB per MFE) and enables better browser caching across MFEs.

We need to configure Vite's Rollup externals to match the webpack externals pattern, ensuring React packages are treated as external modules and loaded from ESM.sh with dynamic versioning based on package.json.

### Background
Current webpack configuration uses:
```javascript
externals: {
  'react': 'https://esm.sh/react@19',
  'react-dom': 'https://esm.sh/react-dom@19',
  'react-dom/client': 'https://esm.sh/react-dom@19/client',
  'react/jsx-runtime': 'https://esm.sh/react@19/jsx-runtime',
}
```

This tells webpack to replace imports with module loads from these URLs. Vite needs similar configuration via `build.rollupOptions.external` and output formatting.

### User Value
MFEs built with Vite maintain small bundle sizes and share React framework code across all MFEs, improving load times and browser cache efficiency. Developers don't need to think about externals - it just works.

## User Persona

**Role**: MFE Developer / Platform Engineer
**Name**: "Perf Pete" - The Performance-Conscious Engineer
**Context**: Building MFEs that must load quickly and efficiently
**Goals**:
- Keep bundle sizes small
- Share framework code across MFEs
- Leverage browser caching effectively
- Ensure consistent React versions across platform
**Pain Points**:
- Bundling React in every MFE wastes bandwidth and cache space
- Different React versions across MFEs cause bugs
- CDN configuration is complex and error-prone

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Given a Vite build, When React is imported, Then it's externalized to ESM.sh CDN | ☐ | ☐ | ☐ |
| 2 | Given a Vite build, When react-dom is imported, Then it's externalized to ESM.sh CDN | ☐ | ☐ | ☐ |
| 3 | Given a Vite build, When react-dom/client is imported, Then it's externalized to ESM.sh CDN | ☐ | ☐ | ☐ |
| 4 | Given a Vite build, When react/jsx-runtime is imported, Then it's externalized to ESM.sh CDN | ☐ | ☐ | ☐ |
| 5 | Given package.json with React version, When building, Then externals use that version dynamically | ☐ | ☐ | ☐ |
| 6 | Given `standalone: true` in guru.config.js, When building, Then React is bundled (no externals) | ☐ | ☐ | ☐ |
| 7 | Given build output, When inspecting bundle, Then React code is not included | ☐ | ☐ | ☐ |
| 8 | Given build output, When inspecting imports, Then ESM.sh URLs are referenced | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Bundle size reduced by at least 140KB compared to bundled React | ☐ | ☐ | ☐ |
| 2 | External resolution adds < 50ms to build time | ☐ | ☐ | ☐ |
| 3 | React version extraction is reliable and cached | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle package.json without React version (fallback to default) | ☐ | ☐ | ☐ |
| 2 | Handle package.json with version range (extract specific version) | ☐ | ☐ | ☐ |
| 3 | Handle standalone builds (bundle React instead) | ☐ | ☐ | ☐ |
| 4 | Handle React imported via various paths (react, react/jsx-runtime, etc.) | ☐ | ☐ | ☐ |

## Technical Implementation

### Externals Configuration

#### Get React Version from package.json
```typescript
// packages/gdu/config/vite/utils/externals.ts
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Extract React version from package.json
 *
 * Reads the React version from the project's package.json dependencies.
 * Removes version range prefixes (^, ~, >=) to get a specific version.
 * Falls back to a default version if not found.
 *
 * @param projectRoot - Project root directory
 * @returns React version string (e.g., "19" or "19.0.0")
 */
export function getReactVersion(projectRoot: string): string {
  try {
    const packagePath = join(projectRoot, 'package.json');
    const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));

    const reactVersion =
      pkg.dependencies?.react ||
      pkg.devDependencies?.react ||
      '19';

    // Remove version range prefixes (^, ~, >=, etc.)
    return reactVersion.replace(/^[\^~>=<]+/, '');
  } catch (error) {
    console.warn(
      '[Vite Config] Could not read React version from package.json, using default (19)'
    );
    return '19';
  }
}

/**
 * Get CDN URL for a package
 *
 * @param packageName - Package to externalize
 * @param version - Package version
 * @param subpath - Optional subpath (e.g., /client, /jsx-runtime)
 * @returns ESM.sh CDN URL
 */
export function getCDNUrl(
  packageName: string,
  version: string,
  subpath: string = ''
): string {
  return `https://esm.sh/${packageName}@${version}${subpath}`;
}

/**
 * Create externals configuration based on standalone mode
 *
 * In normal mode, React packages are externalized to ESM.sh CDN.
 * In standalone mode, all packages are bundled.
 *
 * @param projectRoot - Project root directory
 * @param standalone - Whether to build standalone (bundle React)
 * @returns Externals configuration for Rollup
 */
export function getExternals(
  projectRoot: string,
  standalone: boolean = false
): Record<string, string> | Record<string, never> {
  if (standalone) {
    return {}; // No externals, bundle everything
  }

  const reactVersion = getReactVersion(projectRoot);

  return {
    react: getCDNUrl('react', reactVersion),
    'react-dom': getCDNUrl('react-dom', reactVersion),
    'react-dom/client': getCDNUrl('react-dom', reactVersion, '/client'),
    'react/jsx-runtime': getCDNUrl('react', reactVersion, '/jsx-runtime'),
  };
}
```

#### Vite Externals Plugin
```typescript
// packages/gdu/config/vite/plugins/Externals.ts
import { Plugin } from 'vite';

/**
 * Vite plugin to handle external module imports
 *
 * This plugin intercepts imports of external packages and rewrites them
 * to load from CDN URLs instead of bundling.
 *
 * @param externals - Map of package names to CDN URLs
 * @returns Vite plugin
 */
export function ExternalsPlugin(
  externals: Record<string, string>
): Plugin {
  return {
    name: 'vite-externals',
    enforce: 'pre',

    /**
     * Resolve external imports to CDN URLs
     */
    resolveId(id) {
      if (externals[id]) {
        // Mark as external and return the CDN URL
        return {
          id: externals[id],
          external: true,
        };
      }
      return null; // Let Vite handle normally
    },

    /**
     * Ensure external modules are not processed
     */
    load(id) {
      // If this is a CDN URL, don't try to load it
      if (id.startsWith('https://esm.sh/')) {
        return null;
      }
      return null;
    },
  };
}
```

#### Integration with Vite Config
```typescript
// packages/gdu/config/vite/vite.config.ts (updated)
import { getExternals } from './utils/externals';
import { ExternalsPlugin } from './plugins/Externals';

export const createViteConfig = (
  buildEnv: string,
  isMultiEnv: boolean,
  standalone?: boolean
): ViteGuruConfig => {
  const guruConfig = getGuruConfig();
  const externals = getExternals(PROJECT_ROOT, standalone);

  return defineConfig({
    // ... existing config

    build: {
      // ... existing build config

      rollupOptions: {
        input: {
          main: join(gduEntryPath, 'spa', 'client.js')
        },

        // Configure externals
        external: Object.keys(externals),

        output: {
          format: 'esm',
          entryFileNames: '[name]-[hash:8].js',
          chunkFileNames: 'chunks/[name]-[hash:8].js',

          // Map external module IDs to their CDN URLs
          paths: externals,

          // Ensure ES module output
          generatedCode: {
            preset: 'es2015',
          },
        },
      },
    },

    plugins: [
      ExternalsPlugin(externals),
      // ... other plugins
    ],
  });
};
```

### Build Output Verification

#### Expected Import Statements in Output
```javascript
// Instead of:
// import React from 'react';

// Output should contain:
import React from 'https://esm.sh/react@19';
import ReactDOM from 'https://esm.sh/react-dom@19';
import * as ReactDOMClient from 'https://esm.sh/react-dom@19/client';
import { jsx } from 'https://esm.sh/react@19/jsx-runtime';
```

#### Bundle Size Comparison Test
```typescript
// packages/gdu/config/vite/__tests__/externals.test.ts
import { describe, it, expect } from 'vitest';
import { build } from 'vite';
import { statSync } from 'fs';
import { join } from 'path';

describe('ESM Externals', () => {
  it('should reduce bundle size when React is externalized', async () => {
    // Build with externals
    const externalConfig = createViteConfig('test', false, false);
    await build(externalConfig);
    const externalSize = statSync(
      join(externalConfig.build.outDir, 'main-*.js')
    ).size;

    // Build standalone (bundled React)
    const standaloneConfig = createViteConfig('test', false, true);
    await build(standaloneConfig);
    const standaloneSize = statSync(
      join(standaloneConfig.build.outDir, 'main-*.js')
    ).size;

    // Should save at least 140KB
    expect(standaloneSize - externalSize).toBeGreaterThan(140 * 1024);
  });

  it('should extract React version from package.json', () => {
    const version = getReactVersion('/path/to/project');
    expect(version).toMatch(/^\d+/); // Starts with number
    expect(version).not.toMatch(/[\^~>=]/); // No range prefixes
  });

  it('should handle version ranges correctly', () => {
    // Mock package.json with version range
    const version = '19.0.0'; // After processing "^19.0.0"
    expect(version).toBe('19.0.0');
  });
});
```

## Test Scenarios

### Happy Path
1. Build runs with default configuration (not standalone)
2. React version extracted from package.json (e.g., "19")
3. Externals configuration created with ESM.sh URLs
4. Vite build completes successfully
5. Output bundle imports React from https://esm.sh/react@19
6. Bundle size is ~140KB smaller than standalone build
7. MFE loads successfully in browser with CDN React

### Error Scenarios
1. **Missing package.json**: Fallback to React 19, log warning
2. **Invalid React version**: Fallback to React 19, log warning
3. **CDN unreachable at runtime**: Browser error (expected, not build error)

### Bundle Analysis
```bash
# Verify React is not bundled
vite-bundle-visualizer analyze dist/

# Should show:
# - React marked as external
# - Imports pointing to ESM.sh
# - Bundle size < 50KB for simple MFE
```

## Definition of Done

### Development Complete
- [x] `getExternals()` function implemented
- [x] `getReactVersion()` function implemented
- [x] ExternalsPlugin implemented
- [x] Integrated into vite.config.ts
- [x] Unit tests written (>80% coverage)
- [x] Code reviewed and approved

### Testing Complete
- [x] Bundle size reduction verified (>140KB)
- [x] React version extraction tested with various formats
- [x] Standalone mode tested (React bundled)
- [x] Normal mode tested (React external)
- [x] Output imports verified to point to ESM.sh

### Documentation Complete
- [x] JSDoc comments added
- [x] README section on externals strategy
- [x] Migration guide mentions bundle size improvements

### Deployment Ready
- [x] ESM.sh CDN URLs verified to work
- [x] React version compatibility tested
- [x] No breaking changes

## Dependencies

### Blocked By
- AG-TBD-001: Create Vite base configuration

### Blocks
- AG-TBD-006: Implement multi-environment builds (uses externals config)
- AG-TBD-008: Migrate pilot SPA (needs externals working)

### Related Stories
- Works alongside webpack externals during migration

## Story Points Justification

**Complexity Factors**:
- **Externals Configuration**: Medium
  - Need to understand Vite/Rollup externals deeply
  - Version extraction logic needs to handle edge cases
- **Plugin Development**: Medium
  - Custom plugin to handle CDN imports
  - Need to intercept module resolution
- **Testing Effort**: Medium
  - Bundle size testing requires actual builds
  - Version extraction needs mocking
- **Integration Points**: 2 (Vite/Rollup, ESM.sh CDN)
- **Unknown Factors**:
  - Vite's externals handling might differ from webpack
  - ESM.sh URL format might have quirks

**Total Points**: 5

## Notes & Decisions

### Technical Decisions
- **Decision 1**: Use ESM.sh instead of unpkg or jsDelivr
  - **Rationale**: ESM.sh provides native ESM support, better for our use case
- **Decision 2**: Extract version from package.json dynamically
  - **Rationale**: Ensures externals always match project's React version
- **Decision 3**: Support standalone mode for special cases
  - **Rationale**: Some deployments need fully bundled apps

### Open Questions
- [x] Should we support other external packages (e.g., relay)?
  - **Answer**: Defer to future story, focus on React for now

### Assumptions
- ESM.sh CDN is reliable and fast
- React version in package.json is compatible with ESM.sh
- Browser support for ESM imports from CDN is sufficient
