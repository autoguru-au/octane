# Story: PM. Build Tooling. As a Developer, I want multi-environment Vite builds, so that I can deploy to dev, test, uat, preprod, and prod

## Story Details

**Story ID**: AG-TBD-006
**Epic**: AG-EPIC-VITE - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 8
**Sprint**: Sprint 2

## Description

### Summary
AutoGuru deploys MFEs to multiple environments with environment-specific configurations. We need to implement parallel multi-environment builds with Vite that match the webpack behavior: building for all environments (dev, test, uat, preprod, prod, dockerprod, shared) in a single command, each with its own configuration, output directory, and .env file.

### Background
Webpack currently supports `getBuildEnvs()` which determines which environments to build based on CI/CD context or local configuration. Each environment gets:
- Separate output directory (`dist/{env}/`)
- Environment-specific .env file (`.env.{env}_{tenant}`)
- Unique public path with tokenization (`#{PUBLIC_PATH_BASE}` for prod, full CDN URLs for others)
- Isolated build cache

### User Value
Developers can deploy to multiple environments from a single build command, ensuring consistency and reducing CI/CD time through parallel builds.

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Given build command, When executed, Then all 7 environments build in parallel | ☐ | ☐ | ☐ |
| 2 | Given each environment, When building, Then output goes to `dist/{env}/` | ☐ | ☐ | ☐ |
| 3 | Given each environment, When building, Then corresponding `.env.{env}` file is loaded | ☐ | ☐ | ☐ |
| 4 | Given prod environment, When building, Then public path uses `#{PUBLIC_PATH_BASE}` token | ☐ | ☐ | ☐ |
| 5 | Given non-prod environments, When building, Then public path uses full CDN URL | ☐ | ☐ | ☐ |
| 6 | Given each environment, When building, Then build cache is isolated in `.build_cache/vite/{env}/` | ☐ | ☐ | ☐ |
| 7 | Given build completion, When inspecting output, Then all environments have build-manifest.json | ☐ | ☐ | ☐ |
| 8 | Given parallel builds, When one fails, Then others continue and final exit code reflects failure | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Parallel builds complete faster than sequential (at least 40% improvement) | ☐ | ☐ | ☐ |
| 2 | Memory usage stays under 4GB for all parallel builds | ☐ | ☐ | ☐ |
| 3 | Each environment build has clear console output with environment name | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle missing .env file for environment (use defaults) | ☐ | ☐ | ☐ |
| 2 | Handle single environment build (when only prod is requested) | ☐ | ☐ | ☐ |
| 3 | Handle build cache conflicts between environments | ☐ | ☐ | ☐ |

## Technical Implementation

### Multi-Environment Build Logic

```typescript
// packages/gdu/commands/build/buildSPA-vite.ts (complete implementation)
import { promises as fs } from 'fs';
import { join } from 'path';
import { cyan, green, red } from 'kleur';
import { build as viteBuild } from 'vite';
import { GuruConfig } from '../../lib/config';
import { createViteConfig } from '../../config/vite/vite.config';
import { getBuildEnvs } from '../../utils/configs';

/**
 * Build SPA using Vite with multi-environment support
 */
export const buildSPA = async (guruConfig: GuruConfig) => {
  console.log(cyan('Building SPA with Vite...'));

  const buildEnvs = getBuildEnvs();
  const isMultiEnv = buildEnvs.length > 1;

  console.log(
    cyan(`Building for ${buildEnvs.length} environment(s): ${buildEnvs.join(', ')}`)
  );

  // Clear build directory
  if (await fs.stat(guruConfig.outputPath).catch(() => false)) {
    await fs.rm(guruConfig.outputPath, { recursive: true });
  }
  await fs.mkdir(guruConfig.outputPath, { recursive: true });

  // Build environments in parallel
  const buildPromises = buildEnvs.map(buildEnv =>
    buildEnvironment(buildEnv, isMultiEnv, guruConfig)
  );

  const results = await Promise.allSettled(buildPromises);

  // Report results
  let failedCount = 0;
  results.forEach((result, index) => {
    const env = buildEnvs[index];
    if (result.status === 'fulfilled') {
      console.log(green(`✓ Built ${env} successfully`));
    } else {
      console.error(red(`✗ Failed to build ${env}:`), result.reason);
      failedCount++;
    }
  });

  if (failedCount > 0) {
    throw new Error(`${failedCount} environment(s) failed to build`);
  }

  // Delete license files
  const deletedFilesCount = await deleteLicenseFiles(guruConfig.outputPath);
  console.log(cyan(`Deleted ${deletedFilesCount} license files`));

  return {
    artifactPath: guruConfig.outputPath,
  };
};

/**
 * Build a single environment
 */
async function buildEnvironment(
  buildEnv: string,
  isMultiEnv: boolean,
  guruConfig: GuruConfig
): Promise<void> {
  const startTime = Date.now();
  console.log(cyan(`[${buildEnv}] Starting build...`));

  // Load environment variables
  await loadEnvironmentVars(buildEnv);

  // Create Vite config for this environment
  const viteConfig = createViteConfig(
    buildEnv,
    isMultiEnv,
    guruConfig?.standalone
  );

  try {
    await viteBuild(viteConfig);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(green(`[${buildEnv}] Build completed in ${duration}s`));
  } catch (error) {
    console.error(red(`[${buildEnv}] Build failed:`), error);
    throw error;
  }
}

/**
 * Load environment-specific .env file
 */
async function loadEnvironmentVars(buildEnv: string): Promise<void> {
  const dotenv = await import('dotenv');
  const { getConfigsDirs } = await import('../../utils/configs');

  const configsDirs = getConfigsDirs();

  for (const configsDir of configsDirs) {
    // Load defaults
    const defaultsPath = join(configsDir, '.env.defaults');
    if (await fileExists(defaultsPath)) {
      dotenv.config({ path: defaultsPath });
    }

    // Load environment-specific
    const envPath = join(configsDir, `.env.${buildEnv}`);
    if (await fileExists(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }

  // Set APP_ENV
  process.env.APP_ENV = buildEnv;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

const deleteLicenseFiles = async (dir: string): Promise<number> => {
  let deleteCount = 0;
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      deleteCount += await deleteLicenseFiles(filePath);
    } else if (file.endsWith('.LICENSE.txt')) {
      await fs.unlink(filePath);
      deleteCount++;
    }
  }
  return deleteCount;
};
```

### Environment-Specific Configuration

```typescript
// packages/gdu/config/vite/utils/environment.ts (expanded)
import { resolve } from 'path';
import { getProjectFolderName } from '../../../lib/config';

export type BuildEnv = 'dev' | 'test' | 'uat' | 'preprod' | 'prod' | 'dockerprod' | 'shared';

export interface EnvironmentConfig {
  name: BuildEnv;
  outputPath: string;
  publicPath: string;
  cacheDir: string;
}

/**
 * Get public path for an environment
 *
 * - prod: Uses tokenized path for template replacement
 * - others: Uses full CDN URL with tenant and environment
 */
export function getPublicPath(buildEnv: string): string {
  const projectFolderName = getProjectFolderName();

  if (buildEnv === 'prod') {
    return `#{PUBLIC_PATH_BASE}/${projectFolderName}/`;
  }

  const [agEnv, tenant] = buildEnv.split('-');

  return `https://mfe.${tenant}-${agEnv}.autoguru.com/${projectFolderName}/`;
}

/**
 * Get configuration for a specific build environment
 */
export function getEnvironmentConfig(
  buildEnv: string,
  projectRoot: string,
  isMultiEnv: boolean
): EnvironmentConfig {
  return {
    name: buildEnv as BuildEnv,
    outputPath: resolve(
      projectRoot,
      'dist',
      !isMultiEnv && buildEnv === 'prod' ? '' : buildEnv
    ),
    publicPath: getPublicPath(buildEnv),
    cacheDir: resolve(projectRoot, '.build_cache', 'vite', buildEnv),
  };
}
```

### Updated Vite Config with Environment Support

```typescript
// packages/gdu/config/vite/vite.config.ts (updated with environment config)
import { defineConfig } from 'vite';
import { getEnvironmentConfig } from './utils/environment';

export const createViteConfig = (
  buildEnv: string,
  isMultiEnv: boolean,
  standalone?: boolean
) => {
  const guruConfig = getGuruConfig();
  const envConfig = getEnvironmentConfig(buildEnv, PROJECT_ROOT, isMultiEnv);
  const externals = getExternals(PROJECT_ROOT, standalone);

  return defineConfig({
    root: PROJECT_ROOT,
    mode: 'production',
    cacheDir: envConfig.cacheDir, // Isolated cache per environment

    build: {
      outDir: envConfig.outputPath,
      emptyOutDir: true,

      rollupOptions: {
        input: {
          main: join(GDU_ROOT, 'entry', 'spa', 'client.js')
        },
        external: Object.keys(externals),
        output: {
          format: 'esm',
          entryFileNames: '[name]-[hash:8].js',
          chunkFileNames: 'chunks/[name]-[hash:8].js',
          paths: externals,
        },
      },

      target: 'es2020',
      minify: 'esbuild',
      sourcemap: true,
    },

    // ... rest of config

    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.APP_ENV': JSON.stringify(buildEnv),
      // ... other defines
    },

    plugins: [
      GuruBuildManifestPlugin({
        mountDOMId: guruConfig.mountDOMId,
        mountDOMClass: guruConfig.mountDOMClass,
        frameless: guruConfig.frameless,
        outputDir: envConfig.outputPath,
        publicPath: envConfig.publicPath,
        includeChunks: true,
      }),
      TranslationHashingPlugin({
        publicPath: `${envConfig.publicPath}locales/`,
        outputPath: 'locales/',
        localesDir: 'public/locales',
        hashLength: 8,
        autoIncludePackageTranslations: true,
      }),
      // ... other plugins
    ],
  });
};
```

## Story Points: 8

**Complexity**: High
- Parallel build orchestration
- Environment-specific configuration
- Cache isolation
- Error handling across multiple builds

## Dependencies

**Blocked By**: AG-TBD-001, AG-TBD-002, AG-TBD-003, AG-TBD-005
**Blocks**: AG-TBD-008 (Pilot SPA Migration)

## Notes

- Parallel builds should use `Promise.allSettled()` to ensure all environments attempt build even if one fails
- Cache isolation is critical to prevent cross-environment contamination
- Public path tokenization for prod enables deployment-time path injection
