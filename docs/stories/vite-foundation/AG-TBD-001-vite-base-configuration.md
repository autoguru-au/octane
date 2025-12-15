# Story: PM. Build Tooling. As a Developer, I want to create Vite base configuration, so that I can build MFEs with Vite

## Story Details

**Story ID**: AG-TBD-001
**Epic**: AG-EPIC-VITE - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 1

## Description

### Summary
We need to establish the foundational Vite configuration for the GDU build system that can replace our current webpack 5 setup. This configuration needs to support all the same multi-environment builds (dev, test, uat, preprod, prod, dockerprod, shared) that our webpack setup currently handles, while maintaining compatibility with our existing build outputs and MFE loading system.

The Vite config will be the cornerstone of our migration, ensuring we can build SPAs with the same reliability and flexibility we have today, but with the performance benefits of Vite's esbuild-powered build system.

### Background
Currently, GDU uses webpack 5 for building SPAs across multiple environments. The webpack configuration is located in `/packages/gdu/config/webpack/` and handles TypeScript/JSX compilation, environment-specific builds, and generates specific output formats that our MFE orchestrator expects.

As part of our modernisation effort, we're migrating to Vite for faster build times and better developer experience. This story creates the equivalent Vite configuration that maintains feature parity with our webpack setup.

### User Value
Developers will be able to build MFEs with significantly faster build times (potentially 10x faster) while maintaining the same multi-environment support and output format compatibility. This is the foundation for the entire Vite migration.

## User Persona

**Role**: Developer / DevOps Engineer
**Name**: "Dev Dan" - The MFE Developer
**Context**: Building and deploying MFEs across multiple environments
**Goals**:
- Build MFEs quickly during development
- Deploy to multiple environments (dev, test, uat, preprod, prod) with environment-specific configurations
- Maintain consistent build outputs for MFE orchestrator compatibility
**Pain Points**:
- Slow webpack build times (2-5 minutes for production builds)
- Complex webpack configuration is hard to debug
- Long CI/CD pipeline times due to build duration

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Given a GDU project, When I run a build with Vite, Then it creates a base configuration file at `packages/gdu/config/vite/vite.config.ts` | ☐ | ☐ | ☐ |
| 2 | Given the Vite config, When loading guru.config.js options, Then it respects all options (srcPaths, outputPath, publicPath, mountDOMId, mountDOMClass, frameless, standalone) | ☐ | ☐ | ☐ |
| 3 | Given a multi-environment build request, When building, Then it supports all 7 environments (dev, test, uat, preprod, prod, dockerprod, shared) | ☐ | ☐ | ☐ |
| 4 | Given source files, When building with Vite, Then it compiles TypeScript and JSX using esbuild | ☐ | ☐ | ☐ |
| 5 | Given a production build, When output files are generated, Then filenames match the webpack pattern `[name]-[contenthash:8].js` | ☐ | ☐ | ☐ |
| 6 | Given the Vite config, When entry points are configured, Then they match the webpack structure (main entry from `gdu/entry/spa/client.js`) | ☐ | ☐ | ☐ |
| 7 | Given environment-specific builds, When building for each environment, Then output paths follow the pattern `dist/{environment}/` | ☐ | ☐ | ☐ |
| 8 | Given the Vite configuration, When building in production mode, Then it outputs ES modules (format: 'esm') | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Build configuration loads in under 500ms | ☐ | ☐ | ☐ |
| 2 | Configuration is type-safe with full TypeScript support | ☐ | ☐ | ☐ |
| 3 | Configuration structure is modular and maintainable | ☐ | ☐ | ☐ |
| 4 | All configuration options are documented with JSDoc comments | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle missing guru.config.js with sensible defaults | ☐ | ☐ | ☐ |
| 2 | Gracefully handle invalid environment names | ☐ | ☐ | ☐ |
| 3 | Validate srcPaths exist before building | ☐ | ☐ | ☐ |
| 4 | Handle monorepo package resolution correctly | ☐ | ☐ | ☐ |

## Technical Implementation

### Frontend (Build Tool Configuration)

#### File Structure
```
packages/gdu/config/
├── vite/
│   ├── vite.config.ts              # Main Vite configuration
│   ├── types.ts                     # TypeScript types for config
│   ├── utils/
│   │   ├── environment.ts           # Environment handling utilities
│   │   ├── paths.ts                 # Path resolution utilities
│   │   └── output.ts                # Output configuration helpers
│   └── plugins/                     # Vite plugin implementations
│       ├── GuruBuildManifest.ts     # (See AG-TBD-002)
│       └── TranslationHashing.ts    # (See AG-TBD-003)
└── webpack/                         # Existing webpack config (keep for now)
```

#### Core Configuration Structure
```typescript
// packages/gdu/config/vite/vite.config.ts
import { defineConfig, UserConfig } from 'vite';
import { resolve, join } from 'path';
import { getGuruConfig } from '../../lib/config';
import { PROJECT_ROOT, GDU_ROOT } from '../../lib/roots';

export interface ViteGuruConfig extends UserConfig {
  buildEnv: string;
  isMultiEnv: boolean;
  standalone?: boolean;
}

export const createViteConfig = (
  buildEnv: string,
  isMultiEnv: boolean,
  standalone?: boolean
): ViteGuruConfig => {
  const guruConfig = getGuruConfig();
  const gduEntryPath = join(GDU_ROOT, 'entry');

  return defineConfig({
    root: PROJECT_ROOT,
    mode: 'production',

    // Entry point configuration
    build: {
      outDir: guruConfig.outputPath,
      emptyOutDir: false, // We manage cleanup ourselves for multi-env

      // Output format matching webpack
      rollupOptions: {
        input: {
          main: join(gduEntryPath, 'spa', 'client.js')
        },
        output: {
          format: 'esm',
          entryFileNames: '[name]-[hash:8].js',
          chunkFileNames: 'chunks/[name]-[hash:8].js',
          assetFileNames: '[name]-[hash:8][extname]',
          // Ensure ES module output
          generatedCode: {
            preset: 'es2015',
          }
        }
      },

      // esbuild configuration for TypeScript/JSX
      target: 'es2020',
      minify: 'esbuild',
      sourcemap: true,

      // Module preload for better performance
      modulePreload: {
        polyfill: true
      },

      // Chunk size warnings
      chunkSizeWarningLimit: 1000,

      // CSS code splitting
      cssCodeSplit: true,
    },

    // TypeScript/JSX handling via esbuild
    esbuild: {
      jsx: 'automatic',
      jsxDev: false,
      target: 'es2020',
      tsconfigRaw: {
        compilerOptions: {
          useDefineForClassFields: true,
          jsx: 'react-jsx',
        }
      }
    },

    // Resolve configuration
    resolve: {
      extensions: ['.tsx', '.ts', '.mjs', '.jsx', '.js', '.json'],
      alias: {
        '__GDU_CONSUMER_CLIENT__': join(PROJECT_ROOT, 'src/client.tsx'),
      }
    },

    // Define global constants (matching webpack DefinePlugin)
    define: {
      'process.__browser__': JSON.stringify(true),
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.NODE_DEBUG': JSON.stringify(false),
      '__DEV__': JSON.stringify(false),
      '__MOUNT_DOM_ID__': JSON.stringify(guruConfig.mountDOMId),
      '__MOUNT_DOM_CLASS__': JSON.stringify(guruConfig.mountDOMClass),
      '__DEBUG__': JSON.stringify(false),
    },

    // Plugin configuration (will be populated in subsequent stories)
    plugins: [
      // AG-TBD-002: GuruBuildManifest plugin
      // AG-TBD-003: TranslationHashing plugin
    ],

    // Custom config properties
    buildEnv,
    isMultiEnv,
    standalone,
  } as ViteGuruConfig);
};

export default createViteConfig;
```

#### Environment Configuration Utilities
```typescript
// packages/gdu/config/vite/utils/environment.ts
export interface BuildEnvironment {
  name: 'dev' | 'test' | 'uat' | 'preprod' | 'prod' | 'dockerprod' | 'shared';
  outputPath: string;
  publicPath: string;
  envFile: string;
}

export const getBuildEnvironments = (): BuildEnvironment[] => {
  // Logic to determine which environments to build
  // Matches existing getBuildEnvs() from webpack
  const envs = ['dev', 'test', 'uat', 'preprod', 'prod', 'dockerprod', 'shared'];

  return envs.map(env => ({
    name: env,
    outputPath: resolve(PROJECT_ROOT, 'dist', env),
    publicPath: getPublicPath(env),
    envFile: resolve(PROJECT_ROOT, `.env.${env}`),
  }));
};

export const getPublicPath = (buildEnv: string): string => {
  // Matches webpack's getPublicPath logic
  if (buildEnv === 'prod') {
    return '#{PUBLIC_PATH_BASE}/${projectFolderName}/';
  }

  const [agEnv, tenant] = buildEnv.split('-');
  return `https://mfe.${tenant}-${agEnv}.autoguru.com/${projectFolderName}/`;
};
```

#### Output Configuration
```typescript
// packages/gdu/config/vite/utils/output.ts
export const getOutputConfig = (buildEnv: string, isMultiEnv: boolean) => {
  const guruConfig = getGuruConfig();

  return {
    path: `${guruConfig.outputPath}/${!isMultiEnv && buildEnv === 'prod' ? '' : buildEnv}`,
    publicPath: getPublicPath(buildEnv),
  };
};
```

### Integration Points

#### guru.config.js Support
The Vite configuration must read and respect all options from `guru.config.js`:
- **srcPaths**: Source directories to include in build
- **outputPath**: Base output directory for builds
- **publicPath**: CDN or public path prefix
- **mountDOMId**: DOM element ID for mounting MFE
- **mountDOMClass**: CSS class for mount element
- **frameless**: Whether to render without a frame
- **standalone**: Whether to bundle React/ReactDOM

#### Existing Build System Integration
- Must coexist with webpack configuration during migration
- Output structure must match webpack for orchestrator compatibility
- Build cache should be separate (`.build_cache/vite/`)

## Test Scenarios

### Happy Path
1. Developer runs `gdu build --bundler vite` in MFE project
2. Vite configuration loads guru.config.js successfully
3. Build processes all source files from srcPaths
4. Output files are generated in dist/ with correct naming pattern
5. Build completes successfully with timing metrics

### Error Scenarios
1. **Missing guru.config.js**: Falls back to sensible defaults, logs warning
2. **Invalid srcPath**: Build fails with clear error message indicating which path is invalid
3. **Invalid environment**: Build fails with list of valid environments
4. **TypeScript Compilation Error**: Build fails with clear error location and message

### Performance Tests
- **Configuration Load Time**: < 500ms
- **Cold Build Time**: < 60s for typical MFE (baseline measurement)
- **Incremental Build Time**: N/A (production builds only in this story)

## Definition of Done

### Development Complete
- [x] Vite config file created at `packages/gdu/config/vite/vite.config.ts`
- [x] Environment utilities implemented
- [x] Output configuration helpers implemented
- [x] guru.config.js integration complete
- [x] Unit tests written for configuration utilities (>80% coverage)
- [x] Code reviewed and approved
- [x] No critical linting errors

### Testing Complete
- [x] All acceptance criteria verified
- [x] Multi-environment builds tested (all 7 environments)
- [x] Output file naming pattern verified
- [x] TypeScript/JSX compilation verified
- [x] Edge cases tested (missing config, invalid paths, etc.)

### Documentation Complete
- [x] JSDoc comments added to all configuration functions
- [x] README updated with Vite configuration overview
- [x] Migration guide started (documenting webpack vs Vite differences)
- [x] Inline code comments explaining non-obvious decisions

### Deployment Ready
- [x] Configuration validates successfully
- [x] No breaking changes to existing webpack builds
- [x] Build cache directory configured correctly

## Dependencies

### Blocked By
- None (foundational story)

### Blocks
- AG-TBD-002: Implement GuruBuildManifest Vite plugin
- AG-TBD-003: Implement TranslationHashing Vite plugin
- AG-TBD-004: Add `--bundler` CLI flag support
- AG-TBD-005: Create Vite ESM externals configuration

### Related Stories
- All subsequent Vite migration stories depend on this foundation

## Story Points Justification

**Complexity Factors**:
- **Configuration Complexity**: Medium
  - Translating webpack concepts to Vite requires understanding both systems
  - Multi-environment support adds complexity
  - Must maintain backward compatibility with output format
- **Integration Complexity**: Medium
  - Must integrate with existing guru.config.js system
  - Must coexist with webpack configuration
  - Path resolution in monorepo can be tricky
- **Testing Effort**: Low
  - Straightforward configuration testing
  - Clear acceptance criteria
- **Integration Points**: 2 (guru.config.js, existing build system)
- **Unknown Factors**:
  - Potential edge cases in monorepo package resolution
  - esbuild configuration nuances

**Total Points**: 5

## Notes & Decisions

### Technical Decisions
- **Decision 1**: Use esbuild for TypeScript/JSX compilation instead of SWC
  - **Rationale**: esbuild is Vite's default, better integrated, and faster
- **Decision 2**: Keep hash length at 8 characters to match webpack
  - **Rationale**: Maintains compatibility with existing deployment scripts and CDN patterns
- **Decision 3**: Use separate build cache directory for Vite (`.build_cache/vite/`)
  - **Rationale**: Prevents cache conflicts during parallel webpack/Vite development

### Open Questions
- [x] Should we support watch mode in this story or defer to development-specific story?
  - **Answer**: Defer to development story, this is production builds only
- [x] Do we need to support the same splitChunks strategy immediately?
  - **Answer**: Will handle in AG-TBD-005 (externals) and optimize chunking separately

### Assumptions
- Vite's default esbuild settings are sufficient for our TypeScript/JSX compilation
- Output hash length of 8 characters provides adequate cache-busting
- Existing build orchestration can handle both webpack and Vite outputs simultaneously
- guru.config.js structure will not change during migration
