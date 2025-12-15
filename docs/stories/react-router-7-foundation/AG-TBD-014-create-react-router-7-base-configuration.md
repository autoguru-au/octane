# Story: GDU. Build Tooling. As a Developer, I want React Router 7 base configuration, so that I can build SSR applications with modern tooling

## Story Details

**Story ID**: AG-TBD-014
**Epic**: AG-TBD-001 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 8
**Sprint**: 7

## Description

### Summary
We need to create the foundational configuration for React Router 7 (RR7) that will replace our current Next.js setup for SSR applications. This config needs to support all the capabilities we currently have with Next.js, including multi-environment builds, proper code splitting, and integration with our existing `guru.config.js` system. React Router 7 uses Vite as its bundler, which is a significant shift from Next.js's webpack-based approach.

This is the first critical piece of infrastructure for the migration, establishing patterns that all subsequent SSR apps will follow.

### Background
Currently, we use Next.js 14 for SSR applications in the Octane monorepo. The `packages/gdu/config/next.config.ts` file provides a sophisticated configuration supporting multi-environment builds, security headers, custom webpack modifications, and integration with our Guru config system.

React Router 7 represents a modern approach to SSR with Vite as the bundler, offering faster builds and better DX. However, it requires a completely different configuration approach and we need to maintain feature parity with our current Next.js setup.

### User Value
Developers will be able to build SSR applications using React Router 7 with all the same capabilities as Next.js (multi-environment support, proper bundling, environment variables, etc.) while benefiting from faster build times and modern tooling.

## User Persona

**Role**: Full-Stack Developer
**Name**: "Dev Dan the SSR Developer"
**Context**: Building and maintaining SSR applications in the Octane monorepo
**Goals**:
- Build SSR apps with fast iteration cycles
- Deploy to multiple environments (dev, uat, preprod, prod)
- Maintain consistency with existing AutoGuru patterns
**Pain Points**:
- Next.js build times are slow in large monorepos
- Webpack configuration is complex and hard to debug
- Need better HMR performance

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Configuration file created at `packages/gdu/config/react-router/react-router.config.ts` | ☐ | ☐ | ☐ |
| 2 | Configuration exports a `createReactRouterConfig(buildEnv, options)` function matching Next.js API | ☐ | ☐ | ☐ |
| 3 | Vite is configured as the bundler with proper entry points for client and server | ☐ | ☐ | ☐ |
| 4 | Multi-environment builds work (dev, uat, preprod, prod, shared) with environment-specific output dirs | ☐ | ☐ | ☐ |
| 5 | `guru.config.js` options are respected (basePath, publicPath, mountDOMId, mountDOMClass) | ☐ | ☐ | ☐ |
| 6 | Code splitting is configured to create optimal chunks (vendor, mfe-configs, routes) | ☐ | ☐ | ☐ |
| 7 | TypeScript compilation is configured with proper paths and aliases | ☐ | ☐ | ☐ |
| 8 | Environment variables are loaded from `.env.defaults` and `.env.{env}` files | ☐ | ☐ | ☐ |
| 9 | React aliases are set to ensure single React version (no duplicate React instances) | ☐ | ☐ | ☐ |
| 10 | Vanilla Extract CSS is supported via Vite plugin | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Development builds complete within 5 seconds for typical changes | ☐ | ☐ | ☐ |
| 2 | Production builds complete within 2 minutes for full SSR app | ☐ | ☐ | ☐ |
| 3 | HMR updates reflect in browser within 500ms | ☐ | ☐ | ☐ |
| 4 | Build output is compatible with AWS Lambda deployment | ☐ | ☐ | ☐ |
| 5 | Configuration is fully typed with TypeScript | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle missing `guru.config.js` gracefully with defaults | ☐ | ☐ | ☐ |
| 2 | Support apps with and without basePath/publicPath | ☐ | ☐ | ☐ |
| 3 | Properly handle monorepo package resolution | ☐ | ☐ | ☐ |
| 4 | Work with both tenanted and non-tenanted applications | ☐ | ☐ | ☐ |

## Technical Implementation

### Frontend (Configuration Structure)

#### Component Structure
```
packages/gdu/config/
├── react-router/
│   ├── index.ts                     # Main export
│   ├── react-router.config.ts       # Core configuration
│   ├── vite.config.ts               # Vite-specific config
│   ├── plugins/
│   │   ├── env-plugin.ts            # Environment variable injection
│   │   ├── define-plugin.ts         # Global defines
│   │   └── vanilla-extract.ts       # Vanilla Extract integration
│   └── types.ts                     # TypeScript types
```

#### Core Configuration API
```typescript
// packages/gdu/config/react-router/react-router.config.ts
import type { GuruConfig } from '../../lib/config';

export interface ReactRouterConfigOptions {
  isDebug?: boolean;
  plugins?: any[];
}

export const createReactRouterConfig = (
  buildEnv: string,
  options: ReactRouterConfigOptions = {}
) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const env = process.env.APP_ENV || (isDev ? 'dev' : buildEnv);
  const guruConfig = getGuruConfig();

  return {
    // Vite configuration
    vite: createViteConfig(env, guruConfig, options),

    // React Router specific
    ssr: true,
    serverBuildFile: 'server.js',
    publicPath: guruConfig?.publicPath ?? '/',
    basePath: guruConfig?.basePath ?? '',

    // Build output
    buildDirectory: `dist/${env}`,
    serverBuildDirectory: `dist/${env}/server`,
    clientBuildDirectory: `dist/${env}/client`,

    // Routes
    appDirectory: 'app',
    routes: (defineRoutes) => {
      // Support guru config route patterns
      return defineRoutes((route) => {
        // Auto-discover routes from app/ directory
      });
    },
  };
};
```

#### Vite Configuration
```typescript
// packages/gdu/config/react-router/vite.config.ts
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export const createViteConfig = (env: string, guruConfig: GuruConfig, options) => {
  return defineConfig({
    // Build configuration
    build: {
      target: 'es2020',
      outDir: `dist/${env}/client`,
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk
            vendor: ['react', 'react-dom'],
            // MFE configs chunk (matching Next.js pattern)
            'mfe-configs': [/packages\/global-configs/],
          },
        },
      },
      // Source maps
      sourcemap: !isProductionEnv(env),
      minify: isProductionEnv(env) ? 'esbuild' : false,
    },

    // Resolution
    resolve: {
      alias: {
        // Ensure single React instance
        'react': resolve(PROJECT_ROOT, '../../node_modules/react'),
        'react-dom': resolve(PROJECT_ROOT, '../../node_modules/react-dom'),
        '@autoguru/icons': resolve(PROJECT_ROOT, '../../node_modules/@autoguru/icons'),
      },
      dedupe: ['react', 'react-dom'],
    },

    // Plugins
    plugins: [
      tsconfigPaths(),
      vanillaExtractPlugin(),
      envPlugin(env),
      definePlugin(guruConfig, options.isDebug),
      ...(options.plugins || []),
    ],

    // Dev server (for local development)
    server: {
      port: guruConfig?.port || 3000,
      strictPort: false,
    },

    // SSR options
    ssr: {
      noExternal: [
        // List packages that should be bundled for SSR
        '@autoguru/overdrive',
        '@vanilla-extract/css',
      ],
    },
  });
};
```

#### Environment Variable Plugin
```typescript
// packages/gdu/config/react-router/plugins/env-plugin.ts
import Dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

export const envPlugin = (env: string): Plugin => {
  return {
    name: 'gdu-env-plugin',
    config: () => {
      const configsDirs = getConfigsDirs();

      // Load .env.defaults
      configsDirs.forEach((dir) => {
        const defaultsPath = resolve(dir, '.env.defaults');
        try {
          const parsed = Dotenv.parse(readFileSync(defaultsPath));
          Object.assign(process.env, parsed);
        } catch {}
      });

      // Load .env.{env}
      configsDirs.forEach((dir) => {
        const envPath = resolve(dir, `.env.${env}`);
        try {
          const parsed = Dotenv.parse(readFileSync(envPath));
          Object.assign(process.env, parsed);
        } catch {}
      });

      return {
        define: {
          // Make env vars available to client
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          'process.env.APP_ENV': JSON.stringify(env),
        },
      };
    },
  };
};
```

#### Define Plugin
```typescript
// packages/gdu/config/react-router/plugins/define-plugin.ts
import type { Plugin } from 'vite';
import type { GuruConfig } from '../../../lib/config';

export const definePlugin = (
  guruConfig: GuruConfig | null,
  isDebug: boolean
): Plugin => {
  return {
    name: 'gdu-define-plugin',
    config: () => {
      const isDev = process.env.NODE_ENV !== 'production';

      return {
        define: {
          // Match Next.js defines
          'process.__browser__': 'false',
          '__DEV__': JSON.stringify(isDev),
          '__DEBUG__': JSON.stringify(isDebug),
          '__MOUNT_DOM_ID__': JSON.stringify(guruConfig?.mountDOMId || 'root'),
          '__MOUNT_DOM_CLASS__': JSON.stringify(guruConfig?.mountDOMClass || ''),
          '__GDU_APP_NAME__': JSON.stringify(getProjectName()),
        },
      };
    },
  };
};
```

### Backend (N/A for this story)

### Integration Points

#### Guru Config System
- Read `guru.config.js` from project root
- Apply `basePath`, `publicPath`, `mountDOMId`, `mountDOMClass`
- Support `srcPaths` configuration
- Honor `type: 'ssr'` designation

#### Environment System
- Load from `getConfigsDirs()` (supports multiple config directories)
- Merge `.env.defaults` with `.env.{env}`
- Make variables available to both client and server builds

#### TypeScript
- Use `tsconfig-paths` for path resolution
- Support monorepo workspace references
- Preserve source maps for debugging

## UI/UX Specifications

N/A - This is a build configuration story

## Test Scenarios

### Happy Path
1. Developer runs `gdu build --env dev` in an SSR app
2. Configuration loads `guru.config.js`
3. Vite builds both client and server bundles
4. Output appears in `dist/dev/client` and `dist/dev/server`
5. All environment variables are properly injected
6. Code is split into optimal chunks

### Error Scenarios
1. **Missing guru.config.js**: Falls back to sensible defaults
2. **Invalid Environment**: Shows clear error message
3. **TypeScript Errors**: Displays with proper file locations
4. **Plugin Failures**: Fails fast with descriptive error

### Build Tests
1. **Multi-Environment**: Build for dev, uat, preprod, prod
2. **Code Splitting**: Verify vendor and mfe-configs chunks exist
3. **Environment Variables**: Verify correct vars in each environment
4. **Vanilla Extract**: Verify CSS is properly extracted and optimized
5. **TypeScript Paths**: Verify monorepo imports resolve correctly

## Definition of Done

### Development Complete
- [ ] `react-router.config.ts` created and exported
- [ ] Vite configuration supports SSR builds
- [ ] All environment handling ported from Next.js
- [ ] Code splitting configured
- [ ] TypeScript types defined
- [ ] Unit tests written (>80% coverage)
- [ ] Code reviewed and approved

### Testing Complete
- [ ] Test build in all environments (dev, uat, preprod, prod)
- [ ] Verify multi-environment output directories
- [ ] Test with sample SSR application
- [ ] Verify code splitting output
- [ ] Test environment variable injection
- [ ] Confirm TypeScript compilation works
- [ ] Verify Vanilla Extract support

### Documentation Complete
- [ ] Configuration options documented in code comments
- [ ] Migration notes added (differences from Next.js)
- [ ] README created in `config/react-router/`
- [ ] TypeScript types have JSDoc

### Deployment Ready
- [ ] Configuration tested with pilot app
- [ ] Performance benchmarks recorded
- [ ] Breaking changes documented
- [ ] Migration path defined

## Dependencies

### Blocked By
- None (foundational story)

### Blocks
- AG-TBD-015: Lambda Web Adapter integration (needs build output format)
- AG-TBD-016: Security headers (needs middleware hooks)
- AG-TBD-018: Build manifest generation (needs build configuration)
- AG-TBD-020: Pilot app migration (needs working config)

### Related Stories
- AG-TBD-001: Overall epic
- AG-TBD-013: Vite baseline configuration (if separate)

## Story Points Justification

**Complexity Factors**:
- **Frontend Complexity**: High
  - Porting complex Next.js configuration to React Router 7/Vite paradigm
  - Multiple Vite plugins to create
  - Environment variable system integration
  - Code splitting strategy

- **Backend Complexity**: N/A

- **Testing Effort**: Medium
  - Need to test multiple build environments
  - Verify output compatibility with Lambda
  - Test with various guru.config.js configurations

- **Integration Points**: 4
  - Guru config system
  - Environment loading system
  - TypeScript configuration
  - Vanilla Extract

- **Unknown Factors**:
  - React Router 7 is relatively new, documentation may be incomplete
  - Vite SSR patterns differ significantly from webpack
  - May need custom plugins for AutoGuru-specific needs

**Total Points**: 8

## Notes & Decisions

### Technical Decisions
- **Use Vite over webpack**: React Router 7 is built on Vite, not configurable
- **Maintain createXConfig API**: Keeps parity with `createNextJSConfig` for easier migration
- **Plugin-based architecture**: Separates concerns (env, defines, vanilla-extract)
- **Manual chunks for code splitting**: Explicit control over bundle composition
- **Dedupe React**: Critical to prevent multiple React instances in monorepo

### Open Questions
- [ ] Should we support custom Vite plugins via guru.config.js?
- [ ] How do we handle Next.js image optimization in React Router 7?
- [ ] Do we need a compatibility layer for Next.js-specific APIs?
- [ ] Should we create a CLI command like `gdu create-rr7-app`?

### Assumptions
- React Router 7 stable release is available
- Vite 5.x is compatible with our tooling
- Lambda Web Adapter works with Vite SSR output
- Existing SSR apps can be gradually migrated

### Migration Notes from Next.js

#### Key Differences
1. **Bundler**: Webpack → Vite
2. **Config location**: `next.config.ts` → `react-router.config.ts`
3. **Build output**: `.next/` → `dist/{env}/client` + `dist/{env}/server`
4. **Dev server**: `next dev` → `vite dev` (via React Router)
5. **Image optimization**: Built-in → Requires custom solution or service

#### What We're NOT Porting
- `next/image` optimization (need alternative)
- `next/font` optimization (use Vite solution)
- Automatic static optimization (different in RR7)
- API routes (RR7 uses different pattern)

#### What We're Keeping
- Multi-environment builds
- Security headers (in middleware)
- Environment variable system
- Code splitting strategy
- TypeScript support
- Vanilla Extract support

### Files to Create

```
packages/gdu/config/react-router/
├── index.ts                          # Main export
├── react-router.config.ts            # Core configuration
├── vite.config.ts                    # Vite configuration factory
├── plugins/
│   ├── env-plugin.ts                 # Environment variables
│   ├── define-plugin.ts              # Global defines
│   └── index.ts                      # Plugin exports
├── types.ts                          # TypeScript types
├── README.md                         # Documentation
└── __tests__/
    ├── react-router.config.test.ts   # Config tests
    ├── vite.config.test.ts           # Vite config tests
    └── plugins.test.ts               # Plugin tests
```

### Files to Modify

```
packages/gdu/config/index.ts          # Export new React Router config
packages/gdu/lib/config.ts            # Add RR7 type to GuruConfig
packages/gdu/package.json             # Add React Router 7 dependencies
```

### New Dependencies

```json
{
  "dependencies": {
    "@react-router/dev": "^7.0.0",
    "react-router": "^7.0.0",
    "vite": "^5.0.0",
    "vite-tsconfig-paths": "^4.2.0",
    "@vanilla-extract/vite-plugin": "^4.0.0"
  }
}
```
