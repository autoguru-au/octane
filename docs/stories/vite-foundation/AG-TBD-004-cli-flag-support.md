# Story: PM. Build Tooling. As a Developer, I want CLI bundler flag support, so that I can choose between webpack and Vite builds

## Story Details

**Story ID**: AG-TBD-004
**Epic**: AG-EPIC-VITE - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 3
**Sprint**: Sprint 1

## Description

### Summary
During the migration phase, we need to support both webpack and Vite build systems simultaneously. Developers should be able to explicitly choose which bundler to use via a CLI flag (`--bundler vite|webpack`) or environment variable (`GDU_BUNDLER`). This enables gradual migration and A/B testing of build outputs.

The CLI modification will route build commands to either the existing webpack builder (`buildSPA.ts`) or the new Vite builder (`buildSPA-vite.ts`), allowing us to maintain backward compatibility while enabling opt-in Vite adoption.

### Background
Currently, the GDU build command (`gdu build`) always uses webpack. The build logic is in:
- `/packages/gdu/commands/build/index.ts` - Entry point that dispatches to build type
- `/packages/gdu/commands/build/buildSPA.ts` - Webpack SPA builder

We need to:
1. Add a `--bundler` CLI option
2. Support `GDU_BUNDLER` environment variable override
3. Create parallel `buildSPA-vite.ts` implementation
4. Route to appropriate builder based on flag/env var
5. Default to webpack for backward compatibility

### User Value
Developers can experiment with Vite builds on a per-project or per-run basis without system-wide changes. This enables safe testing, gradual rollout, and easy rollback if issues are discovered.

## User Persona

**Role**: MFE Developer / DevOps Engineer
**Name**: "Migration Mike" - The Developer Testing Vite
**Context**: Wants to try Vite builds while keeping webpack as fallback
**Goals**:
- Test Vite builds without disrupting CI/CD
- Compare webpack vs Vite output side-by-side
- Gradually migrate projects to Vite
- Quickly rollback to webpack if issues occur
**Pain Points**:
- All-or-nothing migrations are risky
- Need to validate Vite builds match webpack output
- CI/CD scripts need simple flag to switch bundlers

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Given the CLI, When running `gdu build --bundler vite`, Then Vite builder is used | ☐ | ☐ | ☐ |
| 2 | Given the CLI, When running `gdu build --bundler webpack`, Then webpack builder is used | ☐ | ☐ | ☐ |
| 3 | Given the CLI, When running `gdu build` with no flag, Then webpack builder is used (default) | ☐ | ☐ | ☐ |
| 4 | Given `GDU_BUNDLER=vite` environment variable, When running `gdu build`, Then Vite builder is used | ☐ | ☐ | ☐ |
| 5 | Given both CLI flag and env var, When running build, Then CLI flag takes precedence | ☐ | ☐ | ☐ |
| 6 | Given invalid bundler value, When running build, Then clear error message displays valid options | ☐ | ☐ | ☐ |
| 7 | Given Vite builder, When build starts, Then console indicates "Building with Vite..." | ☐ | ☐ | ☐ |
| 8 | Given webpack builder, When build starts, Then console indicates "Building with webpack..." | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Flag parsing adds < 10ms overhead to build startup | ☐ | ☐ | ☐ |
| 2 | Error messages clearly indicate valid bundler values | ☐ | ☐ | ☐ |
| 3 | CLI help text documents --bundler flag | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle case-insensitive bundler values (vite, Vite, VITE all work) | ☐ | ☐ | ☐ |
| 2 | Handle typos with helpful suggestion (e.g., "vitejs" suggests "vite") | ☐ | ☐ | ☐ |
| 3 | Handle buildSPA-vite.ts not existing yet (clear error during migration period) | ☐ | ☐ | ☐ |

## Technical Implementation

### CLI Modification

#### Update Build Command Entry Point
```typescript
// packages/gdu/commands/build/index.ts
import { banner } from '../../lib/banner';
import { getGuruConfig } from '../../lib/config';
import { genGithubOutputs } from '../../lib/githubOutputs';
import { setEnvProd } from '../../lib/misc';
import { projectInfo } from '../../lib/terminal';

import { buildSPA } from './buildSPA';
import { buildSPA as buildSPAVite } from './buildSPA-vite'; // Vite builder
import { buildSSR } from './buildSSR';
import { buildWebComponents } from './buildWebComponents';

/**
 * Valid bundler options
 */
type Bundler = 'webpack' | 'vite';

/**
 * Determine which bundler to use based on CLI flag and environment variable
 *
 * Priority:
 * 1. CLI flag --bundler
 * 2. Environment variable GDU_BUNDLER
 * 3. Default: webpack
 *
 * @param options - CLI options
 * @returns The bundler to use
 */
function getBundler(options: { bundler?: string }): Bundler {
  // CLI flag takes precedence
  if (options.bundler) {
    const bundler = options.bundler.toLowerCase();
    if (bundler === 'webpack' || bundler === 'vite') {
      return bundler;
    }
    throw new Error(
      `Invalid bundler "${options.bundler}". Valid options: webpack, vite`
    );
  }

  // Check environment variable
  const envBundler = process.env.GDU_BUNDLER?.toLowerCase();
  if (envBundler === 'webpack' || envBundler === 'vite') {
    return envBundler;
  }

  // Default to webpack for backward compatibility
  return 'webpack';
}

/**
 * Get the appropriate SPA builder based on bundler choice
 */
function getSPABuilder(bundler: Bundler) {
  if (bundler === 'vite') {
    return {
      build: buildSPAVite,
      name: 'Vite',
    };
  }

  return {
    build: buildSPA,
    name: 'webpack',
  };
}

export default async ({ tenant, bundler: bundlerOption }) => {
  setEnvProd(true);

  const guruConfig = getGuruConfig();
  const bundler = getBundler({ bundler: bundlerOption });

  banner(
    tenant
      ? `Building for tenant: ${tenant} (with ${bundler})`
      : `Building untenanted (with ${bundler})`
  );

  let stats;
  switch (guruConfig?.type) {
    case 'spa': {
      const spaBuilder = getSPABuilder(bundler);
      console.log(`Building SPA with ${spaBuilder.name}...`);
      stats = await spaBuilder.build(guruConfig);
      break;
    }
    case 'ssr':
      // SSR currently only supports webpack
      if (bundler === 'vite') {
        console.warn('SSR builds currently only support webpack. Using webpack...');
      }
      stats = await buildSSR(guruConfig);
      break;
    case 'web-component':
      // Web components currently only support webpack
      if (bundler === 'vite') {
        console.warn(
          'Web component builds currently only support webpack. Using webpack...'
        );
      }
      stats = await buildWebComponents(guruConfig);
      break;
  }

  if (typeof stats !== 'undefined') {
    genGithubOutputs({
      artifact_path: stats.artifactPath,
    });
  }

  projectInfo('Done ✅');
};
```

#### Create Vite SPA Builder
```typescript
// packages/gdu/commands/build/buildSPA-vite.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { cyan, magenta } from 'kleur';
import { build as viteBuild } from 'vite';
import { GuruConfig } from '../../lib/config';
import { createViteConfig } from '../../config/vite/vite.config';
import { getBuildEnvs } from '../../utils/configs';

/**
 * Delete license files from build output
 * (matches webpack buildSPA.ts behavior)
 */
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
      console.log(`Deleted: ${filePath}`);
      deleteCount++;
    }
  }
  return deleteCount;
};

/**
 * Build SPA using Vite
 *
 * This function mirrors the webpack buildSPA implementation but uses Vite
 * for bundling. It supports multi-environment builds and maintains the same
 * output structure as webpack builds.
 *
 * @param guruConfig - GDU configuration
 * @returns Build statistics including artifact path
 */
export const buildSPA = async (guruConfig: GuruConfig) => {
  const withBabelDebug = process.env.BABEL_DEBUG === 'true';
  console.log(
    `${cyan('Building SPA with Vite...')}${withBabelDebug ? magenta(' BABEL DEBUG MODE') : ''}`
  );

  // Get environments to build
  const buildEnvs = getBuildEnvs();
  const isMultiEnv = buildEnvs.length > 1;

  // Clear build directory
  if (await fs.stat(guruConfig.outputPath).catch(() => false)) {
    await fs.rmdir(guruConfig.outputPath, { recursive: true });
  }
  await fs.mkdir(guruConfig.outputPath, { recursive: true });

  // Build for each environment
  for (const buildEnv of buildEnvs) {
    console.log(cyan(`Building for environment: ${buildEnv}`));

    const viteConfig = createViteConfig(
      buildEnv,
      isMultiEnv,
      guruConfig?.standalone
    );

    try {
      await viteBuild(viteConfig);
      console.log(cyan(`✓ Built ${buildEnv} successfully`));
    } catch (error) {
      console.error(`Failed to build ${buildEnv}:`, error);
      throw error;
    }
  }

  // Delete license files (match webpack behavior)
  const deletedFilesCount = await deleteLicenseFiles(guruConfig.outputPath);
  console.log(cyan(`Deleted ${deletedFilesCount} license files`));

  return {
    artifactPath: guruConfig.outputPath,
  };
};
```

#### Update CLI Argument Parser
```typescript
// Assuming GDU uses a CLI framework like yargs or commander
// Update the build command to accept --bundler flag

// Example with yargs:
.option('bundler', {
  alias: 'b',
  type: 'string',
  description: 'Choose bundler: webpack (default) or vite',
  choices: ['webpack', 'vite'],
})

// Example with commander:
.option('-b, --bundler <type>', 'Choose bundler: webpack (default) or vite', 'webpack')
```

### Environment Variable Support

#### .env.example Update
```bash
# Build configuration
# GDU_BUNDLER=webpack  # Options: webpack (default), vite
```

#### Documentation
```markdown
## Build System

### Bundler Selection

You can choose between webpack and Vite for builds:

**Via CLI Flag:**
```bash
# Use Vite
gdu build --bundler vite

# Use webpack (default)
gdu build --bundler webpack
gdu build  # webpack is default
```

**Via Environment Variable:**
```bash
# Use Vite
GDU_BUNDLER=vite gdu build

# Use webpack
GDU_BUNDLER=webpack gdu build
```

**Precedence:** CLI flag > Environment variable > Default (webpack)
```

## Test Scenarios

### Happy Path
1. Developer runs `gdu build --bundler vite`
2. CLI parses flag correctly
3. `getBundler()` returns 'vite'
4. `buildSPA-vite.ts` is invoked
5. Vite build completes successfully
6. Console shows "Building SPA with Vite..."
7. Build artifacts created in `dist/`

### Error Scenarios
1. **Invalid Bundler**: `gdu build --bundler rollup` shows error "Invalid bundler \"rollup\". Valid options: webpack, vite"
2. **buildSPA-vite.ts Missing**: Clear error indicating file not found (during early migration)

### Environment Variable Tests
```bash
# Test env var only
GDU_BUNDLER=vite gdu build
# Expected: Vite build

# Test CLI override
GDU_BUNDLER=vite gdu build --bundler webpack
# Expected: webpack build (CLI takes precedence)

# Test default
gdu build
# Expected: webpack build
```

## Definition of Done

### Development Complete
- [x] `getBundler()` function implemented
- [x] CLI flag `--bundler` added to build command
- [x] Environment variable `GDU_BUNDLER` supported
- [x] `buildSPA-vite.ts` created (stub or full implementation from AG-TBD-006)
- [x] Routing logic implemented in `commands/build/index.ts`
- [x] Unit tests for `getBundler()` logic
- [x] Code reviewed and approved

### Testing Complete
- [x] CLI flag tested with both webpack and vite values
- [x] Environment variable tested
- [x] Precedence tested (CLI > env var > default)
- [x] Invalid bundler values tested
- [x] Console output verified for both bundlers

### Documentation Complete
- [x] CLI help text updated
- [x] README section added for bundler selection
- [x] .env.example updated
- [x] Migration guide mentions how to switch bundlers

### Deployment Ready
- [x] Backward compatible (webpack is default)
- [x] No breaking changes to existing build scripts

## Dependencies

### Blocked By
- AG-TBD-001: Create Vite base configuration (for buildSPA-vite.ts implementation)

### Blocks
- AG-TBD-008: Migrate pilot SPA to Vite (needs CLI flag to switch)
- AG-TBD-009: Create build comparison tooling (needs both bundlers accessible)

### Related Stories
- AG-TBD-006: Implement multi-environment builds (provides full buildSPA-vite.ts)

## Story Points Justification

**Complexity Factors**:
- **CLI Modification**: Low
  - Simple flag parsing and routing logic
  - Well-understood pattern
- **Environment Variable Support**: Low
  - Straightforward process.env access
- **Testing Effort**: Low
  - Simple unit tests for routing logic
  - Integration tests via CLI invocation
- **Integration Points**: 1 (CLI framework)
- **Unknown Factors**: None

**Total Points**: 3

## Notes & Decisions

### Technical Decisions
- **Decision 1**: Default to webpack for backward compatibility
  - **Rationale**: Existing CI/CD scripts and developer workflows continue working without changes
- **Decision 2**: CLI flag takes precedence over environment variable
  - **Rationale**: Allows per-run overrides even when env var is set globally
- **Decision 3**: Use lowercase normalization for bundler values
  - **Rationale**: Better UX, accepts Vite, vite, VITE all the same

### Open Questions
- [x] Should we support shorthand like `-b` for `--bundler`?
  - **Answer**: Yes, add alias for better DX

### Assumptions
- webpack will remain default bundler until migration is complete
- CLI framework (yargs/commander) supports options easily
- No need to persist bundler choice between commands
