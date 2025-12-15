# Story: GDU. Build Tooling. As a Developer, I want build manifest generation for React Router 7, so that I can track and deploy application builds

## Story Details

**Story ID**: AG-TBD-018
**Epic**: AG-TBD-001 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Should Have
**Story Points**: 5
**Sprint**: 8

## Description

### Summary
We need to create a build manifest generation system for React Router 7 that tracks all build artifacts, their hashes, sizes, and metadata. This manifest is essential for deployment pipelines, cache invalidation, debugging build issues, and maintaining compatibility with our existing deployment tooling. The manifest should be similar to Next.js's `build-manifest.json` but adapted for React Router 7's Vite-based build output structure.

### Background
Our Next.js applications currently generate a `build-manifest.json` file during build that contains:
- List of all JavaScript bundles
- CSS files and their hashes
- Asset references
- Route-to-bundle mappings
- Build metadata (timestamps, versions, environment)

This manifest is used by:
- Deployment pipeline (Octopus Deploy) to know what files to deploy
- CloudFront cache invalidation to know which files changed
- Monitoring systems to track build sizes and performance
- Developers debugging production issues

React Router 7 uses Vite, which has its own manifest format, but we need to enhance it with AutoGuru-specific metadata and make it compatible with our tooling.

### User Value
Developers and deployment pipelines have reliable, consistent build metadata across all SSR applications, enabling automated deployments, cache invalidation, and build debugging.

## User Persona

**Role**: Developer / DevOps Engineer
**Name**: "Build Barry the Build Engineer"
**Context**: Building and deploying SSR applications
**Goals**:
- Know exactly what files are in each build
- Track build sizes and performance over time
- Invalidate CloudFront cache for changed files only
- Debug production build issues
- Automate deployment processes
**Pain Points**:
- Hard to know what changed between builds
- Cache invalidation is manual and error-prone
- Build debugging requires manual inspection
- Different frameworks have different manifest formats

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Vite plugin created at `packages/gdu/config/react-router/plugins/manifest-plugin.ts` | ☐ | ☐ | ☐ |
| 2 | Plugin generates `build-manifest.json` in output directory during build | ☐ | ☐ | ☐ |
| 3 | Manifest includes all client bundles (JS, CSS) with hashes and sizes | ☐ | ☐ | ☐ |
| 4 | Manifest includes server bundle metadata | ☐ | ☐ | ☐ |
| 5 | Manifest includes route-to-bundle mappings | ☐ | ☐ | ☐ |
| 6 | Manifest includes static assets (images, fonts) | ☐ | ☐ | ☐ |
| 7 | Manifest includes build metadata (timestamp, version, environment, git commit) | ☐ | ☐ | ☐ |
| 8 | Manifest includes bundle analysis data (size, gzip size, dependencies) | ☐ | ☐ | ☐ |
| 9 | Plugin integrates with React Router config | ☐ | ☐ | ☐ |
| 10 | Generated manifest is valid JSON and parseable | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Manifest generation adds < 1 second to build time | ☐ | ☐ | ☐ |
| 2 | Manifest file size < 100KB for typical application | ☐ | ☐ | ☐ |
| 3 | Plugin handles large builds (1000+ files) | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle builds with no CSS files | ☐ | ☐ | ☐ |
| 2 | Handle builds with dynamic imports | ☐ | ☐ | ☐ |
| 3 | Handle builds with shared chunks | ☐ | ☐ | ☐ |
| 4 | Gracefully handle missing git metadata | ☐ | ☐ | ☐ |

## Technical Implementation

### Build Tooling (Vite Plugin)

#### Component Structure
```
packages/gdu/config/react-router/plugins/
├── manifest-plugin.ts               # Main manifest plugin
├── manifest-types.ts                # TypeScript types
├── manifest-utils.ts                # Utility functions
└── __tests__/
    ├── manifest-plugin.test.ts      # Plugin tests
    └── manifest-utils.test.ts       # Utility tests
```

#### Manifest Types
```typescript
// packages/gdu/config/react-router/plugins/manifest-types.ts

export interface BuildManifest {
  version: string;                    // Manifest schema version
  buildTime: string;                  // ISO timestamp
  buildEnvironment: string;           // dev, uat, preprod, prod
  appName: string;                    // Application name
  appVersion: string;                 // From package.json
  gitCommit?: string;                 // Git commit hash
  gitBranch?: string;                 // Git branch
  nodeVersion: string;                // Node.js version

  // Client bundles
  client: {
    entrypoints: Record<string, BundleInfo>;  // Main entry points
    chunks: Record<string, BundleInfo>;       // Code-split chunks
    css: Record<string, AssetInfo>;           // CSS files
    assets: Record<string, AssetInfo>;        // Static assets
  };

  // Server bundle
  server: {
    entrypoint: BundleInfo;
    chunks?: Record<string, BundleInfo>;
  };

  // Routes mapping
  routes: Record<string, RouteManifest>;

  // Build statistics
  stats: BuildStats;
}

export interface BundleInfo {
  file: string;                       // Relative path
  hash: string;                       // Content hash
  size: number;                       // Size in bytes
  gzipSize?: number;                  // Gzipped size
  imports?: string[];                 // Imported bundles
  dynamicImports?: string[];          // Dynamic imports
  css?: string[];                     // Associated CSS
}

export interface AssetInfo {
  file: string;
  hash: string;
  size: number;
  type: 'image' | 'font' | 'css' | 'other';
}

export interface RouteManifest {
  path: string;                       // Route path
  bundles: string[];                  // Required bundles
  css?: string[];                     // Required CSS
  preload?: string[];                 // Files to preload
}

export interface BuildStats {
  totalSize: number;                  // Total bundle size
  totalGzipSize?: number;             // Total gzipped size
  bundleCount: number;                // Number of bundles
  assetCount: number;                 // Number of assets
  routeCount: number;                 // Number of routes
  largestBundle: {
    file: string;
    size: number;
  };
}
```

#### Manifest Plugin
```typescript
// packages/gdu/config/react-router/plugins/manifest-plugin.ts
import { Plugin } from 'vite';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { gzip } from 'zlib';
import { promisify } from 'util';
import { execSync } from 'child_process';
import type { BuildManifest, BundleInfo, AssetInfo } from './manifest-types';

const gzipAsync = promisify(gzip);

export interface ManifestPluginOptions {
  appName: string;
  appVersion: string;
  environment: string;
  includeGzipSize?: boolean;
  includeGitMetadata?: boolean;
}

export const manifestPlugin = (options: ManifestPluginOptions): Plugin => {
  return {
    name: 'gdu-manifest-plugin',

    apply: 'build', // Only run during build

    async closeBundle() {
      // This hook runs after bundle is written
      // We can now analyze the output

      const manifest = await generateManifest(this, options);

      // Write manifest to output directory
      const manifestPath = join(
        // @ts-ignore - accessing internal config
        this.outputOptions().dir || 'dist',
        'build-manifest.json'
      );

      writeFileSync(
        manifestPath,
        JSON.stringify(manifest, null, 2),
        'utf-8'
      );

      console.log(`✓ Build manifest generated: ${manifestPath}`);
      console.log(`  Total size: ${formatBytes(manifest.stats.totalSize)}`);
      console.log(`  Bundles: ${manifest.stats.bundleCount}`);
      console.log(`  Routes: ${manifest.stats.routeCount}`);
    },
  };
};

async function generateManifest(
  context: any,
  options: ManifestPluginOptions
): Promise<BuildManifest> {
  // Get Vite's built-in manifest
  const viteManifest = context.getModuleInfo?.() || {};

  // Read bundle information
  const bundles = await analyzeBundles(context, options);

  // Get git metadata
  const gitMetadata = options.includeGitMetadata
    ? getGitMetadata()
    : {};

  // Build the manifest
  const manifest: BuildManifest = {
    version: '1.0',
    buildTime: new Date().toISOString(),
    buildEnvironment: options.environment,
    appName: options.appName,
    appVersion: options.appVersion,
    nodeVersion: process.version,
    ...gitMetadata,

    client: bundles.client,
    server: bundles.server,
    routes: bundles.routes,
    stats: calculateStats(bundles),
  };

  return manifest;
}

async function analyzeBundles(context: any, options: ManifestPluginOptions) {
  // This is a simplified example
  // In reality, we'd need to parse Vite's output

  const client = {
    entrypoints: {},
    chunks: {},
    css: {},
    assets: {},
  };

  const server = {
    entrypoint: {
      file: 'server.js',
      hash: 'xxx',
      size: 0,
    },
  };

  const routes = {};

  // Iterate through bundle output
  // Read file sizes, generate hashes, etc.

  return { client, server, routes };
}

function getGitMetadata() {
  try {
    const gitCommit = execSync('git rev-parse HEAD')
      .toString()
      .trim();
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trim();

    return { gitCommit, gitBranch };
  } catch {
    return {};
  }
}

function calculateStats(bundles: any): BuildStats {
  let totalSize = 0;
  let totalGzipSize = 0;
  let bundleCount = 0;
  let assetCount = 0;
  let largestBundle = { file: '', size: 0 };

  // Calculate from bundles
  // ...

  return {
    totalSize,
    totalGzipSize,
    bundleCount,
    assetCount,
    routeCount: Object.keys(bundles.routes).length,
    largestBundle,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
```

#### Enhanced Implementation with Vite Integration
```typescript
// More complete implementation
import type { Plugin, Manifest as ViteManifest } from 'vite';
import { readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { createHash } from 'crypto';
import { gzipSync } from 'zlib';

export const manifestPlugin = (options: ManifestPluginOptions): Plugin => {
  let config: any;
  let clientManifest: ViteManifest | null = null;

  return {
    name: 'gdu-manifest-plugin',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async writeBundle(outputOptions, bundle) {
      const outDir = outputOptions.dir || config.build.outDir;

      // Read Vite's manifest if it exists
      const viteManifestPath = join(outDir, 'manifest.json');
      try {
        clientManifest = JSON.parse(readFileSync(viteManifestPath, 'utf-8'));
      } catch {
        // No Vite manifest, build our own
      }

      // Analyze the bundle
      const bundleInfo = await analyzeBundleOutput(bundle, outDir, options);

      // Generate our manifest
      const manifest = createBuildManifest(bundleInfo, options);

      // Write manifest
      const manifestPath = join(outDir, 'build-manifest.json');
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      // Log summary
      logBuildSummary(manifest);
    },
  };
};

async function analyzeBundleOutput(
  bundle: any,
  outDir: string,
  options: ManifestPluginOptions
) {
  const bundles: Record<string, BundleInfo> = {};
  const assets: Record<string, AssetInfo> = {};

  for (const [fileName, chunk] of Object.entries(bundle)) {
    const filePath = join(outDir, fileName);
    const fileContent = readFileSync(filePath);
    const hash = createHash('md5').update(fileContent).digest('hex').slice(0, 8);
    const size = fileContent.length;

    const info: BundleInfo = {
      file: fileName,
      hash,
      size,
    };

    // Calculate gzip size if requested
    if (options.includeGzipSize) {
      info.gzipSize = gzipSync(fileContent).length;
    }

    // Handle chunks
    if ((chunk as any).type === 'chunk') {
      const chunkInfo = chunk as any;

      info.imports = chunkInfo.imports || [];
      info.dynamicImports = chunkInfo.dynamicImports || [];

      // Extract CSS imports
      if (chunkInfo.viteMetadata?.importedCss) {
        info.css = Array.from(chunkInfo.viteMetadata.importedCss);
      }

      bundles[fileName] = info;
    } else {
      // Asset
      assets[fileName] = {
        file: fileName,
        hash,
        size,
        type: getAssetType(fileName),
      };
    }
  }

  return { bundles, assets };
}

function getAssetType(fileName: string): AssetInfo['type'] {
  if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(fileName)) return 'image';
  if (/\.(woff2?|ttf|eot|otf)$/i.test(fileName)) return 'font';
  if (/\.css$/i.test(fileName)) return 'css';
  return 'other';
}

function createBuildManifest(
  bundleInfo: any,
  options: ManifestPluginOptions
): BuildManifest {
  // Separate entry points from chunks
  const entrypoints: Record<string, BundleInfo> = {};
  const chunks: Record<string, BundleInfo> = {};
  const css: Record<string, AssetInfo> = {};
  const assets: Record<string, AssetInfo> = {};

  for (const [name, bundle] of Object.entries(bundleInfo.bundles)) {
    // Determine if entry point based on name or metadata
    if (name.includes('entry') || name.includes('index')) {
      entrypoints[name] = bundle as BundleInfo;
    } else {
      chunks[name] = bundle as BundleInfo;
    }
  }

  // Separate CSS from other assets
  for (const [name, asset] of Object.entries(bundleInfo.assets)) {
    const assetInfo = asset as AssetInfo;
    if (assetInfo.type === 'css') {
      css[name] = assetInfo;
    } else {
      assets[name] = assetInfo;
    }
  }

  return {
    version: '1.0',
    buildTime: new Date().toISOString(),
    buildEnvironment: options.environment,
    appName: options.appName,
    appVersion: options.appVersion,
    nodeVersion: process.version,
    ...getGitMetadata(),

    client: {
      entrypoints,
      chunks,
      css,
      assets,
    },

    server: {
      entrypoint: {
        file: 'server.js',
        hash: 'tbd',
        size: 0,
      },
    },

    routes: {}, // Would need React Router metadata

    stats: calculateStats({ entrypoints, chunks, css, assets }),
  };
}
```

#### Integration with React Router Config
```typescript
// packages/gdu/config/react-router/vite.config.ts (modified)
import { manifestPlugin } from './plugins/manifest-plugin';

export const createViteConfig = (env: string, guruConfig: GuruConfig, options) => {
  return defineConfig({
    // ... existing config ...

    plugins: [
      // ... existing plugins ...

      // Add manifest plugin
      manifestPlugin({
        appName: getProjectName(),
        appVersion: require(join(PROJECT_ROOT, 'package.json')).version,
        environment: env,
        includeGzipSize: true,
        includeGitMetadata: true,
      }),
    ],
  });
};
```

### Usage in Deployment

```typescript
// Example: Reading manifest in deployment script
import { readFileSync } from 'fs';
import type { BuildManifest } from './manifest-types';

const manifest: BuildManifest = JSON.parse(
  readFileSync('./dist/prod/build-manifest.json', 'utf-8')
);

console.log(`Deploying ${manifest.appName} v${manifest.appVersion}`);
console.log(`Built at: ${manifest.buildTime}`);
console.log(`Git commit: ${manifest.gitCommit}`);
console.log(`Total size: ${manifest.stats.totalSize} bytes`);

// Get list of files to upload to S3
const clientFiles = [
  ...Object.values(manifest.client.entrypoints).map(b => b.file),
  ...Object.values(manifest.client.chunks).map(b => b.file),
  ...Object.values(manifest.client.css).map(a => a.file),
  ...Object.values(manifest.client.assets).map(a => a.file),
];

// Get list of files that changed (for cache invalidation)
const previousManifest = loadPreviousManifest();
const changedFiles = findChangedFiles(manifest, previousManifest);

console.log(`Files to invalidate: ${changedFiles.join(', ')}`);
```

## UI/UX Specifications

N/A - Build tooling story

## Test Scenarios

### Happy Path
1. Run `gdu build --env prod`
2. Build completes successfully
3. `build-manifest.json` created in output directory
4. Manifest contains all expected fields
5. All file paths are valid and relative
6. All file sizes are accurate

### Validation Tests
1. **Schema Validation**: Manifest matches TypeScript types
2. **File Existence**: All referenced files exist
3. **Hash Verification**: File hashes match file contents
4. **Size Accuracy**: File sizes match actual file sizes
5. **Git Metadata**: Git commit and branch captured correctly

### Edge Case Tests
1. **No CSS**: Build with no CSS files
2. **Large Build**: Build with 1000+ files
3. **No Git**: Build outside git repository
4. **Dynamic Imports**: Build with dynamic imports

## Definition of Done

### Development Complete
- [ ] Manifest plugin created
- [ ] TypeScript types defined
- [ ] Plugin integrates with Vite config
- [ ] Git metadata extraction implemented
- [ ] Gzip size calculation implemented
- [ ] Bundle analysis implemented
- [ ] Unit tests written (>80% coverage)
- [ ] Code reviewed and approved

### Testing Complete
- [ ] Manifest generated successfully
- [ ] All fields populated correctly
- [ ] File paths are valid
- [ ] Hashes are accurate
- [ ] Sizes are correct
- [ ] Git metadata captured
- [ ] Schema validation passes

### Documentation Complete
- [ ] Manifest schema documented
- [ ] Plugin options documented
- [ ] Usage examples provided
- [ ] Integration guide written

### Deployment Ready
- [ ] Tested with pilot application
- [ ] Deployment scripts updated to use manifest
- [ ] CI/CD pipeline integration verified

## Dependencies

### Blocked By
- AG-TBD-014: React Router config (need build configuration)

### Blocks
- None (nice-to-have feature)

### Related Stories
- AG-TBD-017: CDK infrastructure (may use manifest)
- AG-TBD-020: Pilot migration (will test manifest)

## Story Points Justification

**Complexity Factors**:
- **Frontend Complexity**: N/A

- **Backend Complexity**: Medium
  - Vite plugin development
  - Bundle analysis logic
  - File hashing and size calculation
  - Git metadata extraction
  - JSON schema design

- **Testing Effort**: Medium
  - Unit tests for plugin
  - Integration tests with real builds
  - Schema validation tests
  - Edge case testing

- **Integration Points**: 2
  - Vite build system
  - Deployment pipeline

- **Unknown Factors**: Low
  - Well-understood problem
  - Vite has good plugin API

**Total Points**: 5

## Notes & Decisions

### Technical Decisions
- **Vite plugin**: Best way to hook into build process
- **JSON format**: Compatible with existing tooling
- **Separate from Vite manifest**: Our manifest is more comprehensive
- **Include gzip sizes**: Helpful for performance tracking
- **Git metadata**: Essential for traceability

### Open Questions
- [ ] Should we include dependency tree in manifest?
- [ ] Do we need route-to-bundle mappings (React Router specific)?
- [ ] Should we track build time performance metrics?
- [ ] Do we need a manifest diff tool?

### Assumptions
- Deployment pipeline can parse JSON
- Git is available in CI/CD environment
- Build output structure is consistent
- Manifest schema won't change frequently

### Future Enhancements
- Bundle size trending over time
- Visual bundle analyzer integration
- Automatic size budget enforcement
- Manifest diffing for deployments
- Bundle dependency graph visualization

### Files to Create

```
packages/gdu/config/react-router/plugins/
├── manifest-plugin.ts               # Main plugin
├── manifest-types.ts                # TypeScript types
├── manifest-utils.ts                # Utilities
└── __tests__/
    ├── manifest-plugin.test.ts      # Plugin tests
    └── manifest-utils.test.ts       # Utility tests
```

### Files to Modify

```
packages/gdu/config/react-router/vite.config.ts    # Add plugin
```

### Example Manifest Output

```json
{
  "version": "1.0",
  "buildTime": "2025-01-15T10:30:00.000Z",
  "buildEnvironment": "prod",
  "appName": "fleet-platform",
  "appVersion": "2.5.0",
  "gitCommit": "abc123def456",
  "gitBranch": "main",
  "nodeVersion": "v20.9.0",
  "client": {
    "entrypoints": {
      "index.js": {
        "file": "assets/index-abc123.js",
        "hash": "abc123",
        "size": 245678,
        "gzipSize": 89012,
        "imports": ["vendor-xyz789.js"],
        "css": ["index-abc123.css"]
      }
    },
    "chunks": {
      "vendor.js": {
        "file": "assets/vendor-xyz789.js",
        "hash": "xyz789",
        "size": 567890,
        "gzipSize": 189012
      }
    },
    "css": {
      "index.css": {
        "file": "assets/index-abc123.css",
        "hash": "abc123",
        "size": 12345,
        "type": "css"
      }
    },
    "assets": {
      "logo.png": {
        "file": "assets/logo-def456.png",
        "hash": "def456",
        "size": 45678,
        "type": "image"
      }
    }
  },
  "server": {
    "entrypoint": {
      "file": "server.js",
      "hash": "server123",
      "size": 123456
    }
  },
  "routes": {},
  "stats": {
    "totalSize": 994043,
    "totalGzipSize": 278024,
    "bundleCount": 2,
    "assetCount": 2,
    "routeCount": 0,
    "largestBundle": {
      "file": "assets/vendor-xyz789.js",
      "size": 567890
    }
  }
}
```
