# Story: PM. Build Tooling. As a Developer, I want to implement TranslationHashing Vite plugin, so that i18n files are content-hashed and auto-discovered

## Story Details

**Story ID**: AG-TBD-003
**Epic**: AG-EPIC-VITE - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 1

## Description

### Summary
The TranslationHashingPlugin automatically discovers translation files from the MFE and any consumed monorepo packages, generates content-based hashes for cache busting, and emits locale manifests that allow runtime loading of translations. This plugin is crucial for our i18n system, enabling dynamic language switching and efficient translation loading.

We need to port the existing webpack TranslationHashingPlugin to Vite while maintaining identical output structure, package auto-discovery, and manifest generation.

### Background
Currently, the webpack TranslationHashingPlugin:
1. Scans webpack modules to discover which packages contain translations
2. Loads translations from `public/locales/{locale}/{namespace}.json` and package `locales/` directories
3. Merges package translations with MFE translations using a prefix strategy (`pkg-{package-name}`)
4. Generates content-based hashes for each translation file
5. Emits hashed translation files and locale manifests
6. Updates the build-manifest.json with i18n information
7. In development mode, watches package translations and triggers HMR

The MFE i18n system relies on these manifests to:
- Load translations on-demand by locale
- Cache translations effectively using content hashes
- Support multiple locales without bundling all translations upfront

### User Value
Developers can use the same i18n patterns with Vite-built MFEs, including automatic package translation discovery, without manual configuration. Translations are efficiently cached and loaded, improving application performance and maintainability.

## User Persona

**Role**: MFE Developer / i18n Maintainer
**Name**: "Locale Lucy" - The Internationalisation Developer
**Context**: Building multi-language MFEs that consume shared translation packages
**Goals**:
- Automatically include translations from shared packages
- Ensure efficient translation loading and caching
- Support multiple locales without manual manifest management
- Enable hot reloading of translations during development
**Pain Points**:
- Manual translation manifest management is error-prone
- Forgetting to include package translations breaks i18n
- Translation cache busting requires manual hash updates
- Development workflow disrupted by translation changes requiring full rebuild

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Given packages with `locales/` directories, When building, Then plugin auto-discovers and includes their translations | ☐ | ☐ | ☐ |
| 2 | Given package translations, When merged, Then they use the prefix strategy (`pkg-{package-name}`) | ☐ | ☐ | ☐ |
| 3 | Given translation files, When hashed, Then content-based MD5 hashes are generated (8 characters) | ☐ | ☐ | ☐ |
| 4 | Given a locale, When manifest is generated, Then it includes all namespaces with path, hash, and size | ☐ | ☐ | ☐ |
| 5 | Given multiple locales, When building, Then a locale manifest is generated for each locale (`i18n-manifest-{locale}.{hash}.js`) | ☐ | ☐ | ☐ |
| 6 | Given locale manifests, When master manifest is generated, Then it includes dynamic imports for all locales (`i18n-master-manifest.{hash}.js`) | ☐ | ☐ | ☐ |
| 7 | Given the build manifest, When plugin completes, Then i18n section is added with masterManifest, manifestModules, supportedLocales, includedPackages, and translationAssets | ☐ | ☐ | ☐ |
| 8 | Given hashed translation files, When emitted, Then they are placed in `locales/{locale}/{namespace}.{hash}.json` | ☐ | ☐ | ☐ |
| 9 | Given MFE with no translations, When building, Then empty manifests are generated with graceful fallbacks | ☐ | ☐ | ☐ |
| 10 | Given translation content changes, When rebuilding, Then new hash is generated for changed files only | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Plugin executes in under 500ms for typical MFE (5 packages, 3 locales) | ☐ | ☐ | ☐ |
| 2 | Package discovery uses efficient file system scanning | ☐ | ☐ | ☐ |
| 3 | Generated manifests are minified for production | ☐ | ☐ | ☐ |
| 4 | Console output clearly indicates discovered packages and generated manifests | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle packages with only some locales (e.g., en but not fr) | ☐ | ☐ | ☐ |
| 2 | Handle malformed JSON translation files gracefully with clear errors | ☐ | ☐ | ☐ |
| 3 | Handle duplicate namespace names across packages (prefix resolves conflicts) | ☐ | ☐ | ☐ |
| 4 | Handle empty translation files (valid JSON but empty object) | ☐ | ☐ | ☐ |
| 5 | Handle excluded locales via configuration | ☐ | ☐ | ☐ |

## Technical Implementation

### Vite Plugin Structure

#### File Location
```
packages/gdu/config/vite/plugins/TranslationHashing.ts
```

#### Plugin Implementation (Core Structure)
```typescript
// packages/gdu/config/vite/plugins/TranslationHashing.ts
import { Plugin } from 'vite';
import { promises as fs } from 'fs';
import { resolve, join } from 'path';
import crypto from 'crypto';

export interface TranslationInfo {
  path: string;
  hash: string;
  size: number;
}

export interface LocaleManifest {
  [namespace: string]: TranslationInfo;
}

export interface TranslationHashingOptions {
  publicPath?: string;
  outputPath?: string;
  localesDir?: string;
  hashLength?: number;
  excludeLocales?: string[];
  autoIncludePackageTranslations?: boolean;
}

/**
 * Vite plugin that handles translation file hashing and manifest generation
 *
 * Features:
 * - Auto-discovers package translations from monorepo packages
 * - Generates content-based hashes for cache busting
 * - Creates locale-specific manifests and master manifest
 * - Updates build manifest with i18n information
 * - Supports multiple locales and namespaces
 *
 * @param options - Configuration options
 * @returns Vite plugin
 */
export function TranslationHashingPlugin(
  options: TranslationHashingOptions = {}
): Plugin {
  const opts = {
    publicPath: options.publicPath || '/locales/',
    outputPath: options.outputPath || 'locales/',
    localesDir: options.localesDir || 'public/locales',
    hashLength: options.hashLength || 8,
    excludeLocales: options.excludeLocales || [],
    autoIncludePackageTranslations: options.autoIncludePackageTranslations !== false,
  };

  // State
  const translationManifests = new Map<string, LocaleManifest>();
  const manifestModules = new Map<string, { name: string; hash: string }>();
  const packageTranslations = new Map<string, Map<string, any>>();
  const discoveredPackages = new Set<string>();

  return {
    name: 'translation-hashing',
    enforce: 'post', // Run after other plugins

    /**
     * Hook into config resolved to discover package translations
     */
    async configResolved(config) {
      if (!opts.autoIncludePackageTranslations) return;

      // Discover packages from dependencies
      await discoverPackageTranslations(
        config.root,
        discoveredPackages,
        packageTranslations
      );

      if (discoveredPackages.size > 0) {
        console.log(
          `[TranslationHashing] Discovered ${discoveredPackages.size} packages with translations:`,
          Array.from(discoveredPackages).join(', ')
        );
      }
    },

    /**
     * Hook into generateBundle to emit translation files and manifests
     */
    async generateBundle(_outputOptions, _bundle) {
      const localesPath = join(this.config.root, opts.localesDir);

      // Collect all locales from MFE and packages
      const allLocales = await collectAllLocales(
        localesPath,
        packageTranslations,
        opts.excludeLocales
      );

      if (allLocales.size === 0) {
        await generateEmptyManifests(this, manifestModules, opts.hashLength);
        return;
      }

      // Process each locale
      for (const locale of allLocales) {
        const manifest = await processLocale(
          this,
          locale,
          localesPath,
          packageTranslations,
          opts
        );
        translationManifests.set(locale, manifest);
      }

      // Generate locale manifest modules
      await generateLocaleManifests(
        this,
        translationManifests,
        manifestModules,
        discoveredPackages,
        opts.hashLength
      );

      // Generate master manifest
      await generateMasterManifest(
        this,
        manifestModules,
        opts.hashLength
      );

      // Generate metadata JSON
      await generateMetadataJson(
        this,
        manifestModules,
        translationManifests,
        discoveredPackages
      );
    },

    /**
     * Hook into writeBundle to update build manifest
     */
    async writeBundle() {
      // Get the GuruBuildManifest plugin's API
      const guruPlugin = this.config.plugins.find(
        p => p.name === 'guru-build-manifest'
      );

      if (guruPlugin && guruPlugin.api) {
        const manifest = guruPlugin.api.getManifest();
        if (!manifest) return;

        // Find master manifest metadata
        const masterManifest = manifestModules.get('master');
        if (!masterManifest) return;

        // Update build manifest with i18n info
        guruPlugin.api.updateManifest({
          i18n: {
            masterManifest: masterManifest.name,
            manifestModules: Object.fromEntries(manifestModules),
            supportedLocales: Array.from(translationManifests.keys()),
            includedPackages: Array.from(discoveredPackages),
            translationAssets: buildTranslationAssetsMap(translationManifests),
          },
        });
      }
    },
  };
}

/**
 * Discover package translations from monorepo packages
 */
async function discoverPackageTranslations(
  root: string,
  discoveredPackages: Set<string>,
  packageTranslations: Map<string, Map<string, any>>
): Promise<void> {
  // Look for packages in monorepo
  const packagesDir = join(root, '../../packages');

  try {
    const packages = await fs.readdir(packagesDir);

    for (const pkg of packages) {
      const packagePath = join(packagesDir, pkg);
      const packageJsonPath = join(packagePath, 'package.json');

      // Check if package.json exists
      if (!(await fileExists(packageJsonPath))) continue;

      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, 'utf-8')
      );

      // Check for locales directory
      const localesPath = join(
        packagePath,
        packageJson.i18n?.localesPath || 'locales'
      );

      if (await fileExists(localesPath)) {
        const packageName = packageJson.name || pkg;
        discoveredPackages.add(packageName);

        // Load package translations
        await loadPackageTranslations(
          packageName,
          localesPath,
          packageTranslations,
          packageJson.i18n?.namespaces
        );
      }
    }
  } catch (error) {
    console.warn('[TranslationHashing] Error discovering packages:', error);
  }
}

/**
 * Load translations from a package
 */
async function loadPackageTranslations(
  packageName: string,
  localesPath: string,
  packageTranslations: Map<string, Map<string, any>>,
  namespaces?: string[]
): Promise<void> {
  const pkgTranslations = new Map<string, any>();

  try {
    const locales = await fs.readdir(localesPath);

    for (const locale of locales) {
      const localePath = join(localesPath, locale);
      const stat = await fs.stat(localePath);

      if (!stat.isDirectory()) continue;

      const localeTranslations: any = {};
      const files = await fs.readdir(localePath);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const namespace = file.replace('.json', '');

        // Filter by namespaces if specified
        if (namespaces && !namespaces.includes(namespace)) continue;

        const filePath = join(localePath, file);
        const content = await fs.readFile(filePath, 'utf-8');

        try {
          localeTranslations[namespace] = JSON.parse(content);
        } catch (error) {
          console.error(
            `[TranslationHashing] Failed to parse ${filePath}:`,
            error
          );
        }
      }

      if (Object.keys(localeTranslations).length > 0) {
        pkgTranslations.set(locale, localeTranslations);
      }
    }

    if (pkgTranslations.size > 0) {
      packageTranslations.set(packageName, pkgTranslations);
    }
  } catch (error) {
    console.error(
      `[TranslationHashing] Error loading translations from ${packageName}:`,
      error
    );
  }
}

/**
 * Collect all locales from MFE and packages
 */
async function collectAllLocales(
  localesPath: string,
  packageTranslations: Map<string, Map<string, any>>,
  excludeLocales: string[]
): Promise<Set<string>> {
  const allLocales = new Set<string>();

  // Add MFE locales
  if (await fileExists(localesPath)) {
    const mfeLocales = await fs.readdir(localesPath);
    for (const locale of mfeLocales) {
      const stat = await fs.stat(join(localesPath, locale));
      if (stat.isDirectory() && !excludeLocales.includes(locale)) {
        allLocales.add(locale);
      }
    }
  }

  // Add package locales
  for (const [, pkgTranslations] of packageTranslations) {
    for (const locale of pkgTranslations.keys()) {
      if (!excludeLocales.includes(locale)) {
        allLocales.add(locale);
      }
    }
  }

  return allLocales;
}

/**
 * Process a single locale - merge MFE and package translations, emit files
 */
async function processLocale(
  context: any,
  locale: string,
  mfeLocalesPath: string,
  packageTranslations: Map<string, Map<string, any>>,
  opts: any
): Promise<LocaleManifest> {
  const processedTranslations: { [namespace: string]: any } = {};
  const manifest: LocaleManifest = {};

  // Load MFE translations
  const mfeLocalePath = join(mfeLocalesPath, locale);
  if (await fileExists(mfeLocalePath)) {
    const files = await fs.readdir(mfeLocalePath);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const namespace = file.replace('.json', '');
      const filePath = join(mfeLocalePath, file);
      const content = await fs.readFile(filePath, 'utf-8');

      try {
        processedTranslations[namespace] = JSON.parse(content);
      } catch (error) {
        console.error(
          `[TranslationHashing] Failed to parse ${filePath}:`,
          error
        );
      }
    }
  }

  // Merge package translations with prefix strategy
  for (const [packageName, pkgTranslations] of packageTranslations) {
    const pkgLocaleTranslations = pkgTranslations.get(locale);
    if (!pkgLocaleTranslations) continue;

    for (const [namespace, translations] of Object.entries(
      pkgLocaleTranslations
    )) {
      const simplifiedPackageName = packageName.replace('@autoguru/', '');
      const effectiveNamespace = `pkg-${simplifiedPackageName}`;
      processedTranslations[effectiveNamespace] = translations;
    }
  }

  // Emit translation files and build manifest
  for (const [namespace, translations] of Object.entries(
    processedTranslations
  )) {
    const content = JSON.stringify(translations);
    const hash = generateContentHash(content, opts.hashLength);
    const hashedFilename = `${namespace}.${hash}.json`;
    const outputPath = `${opts.outputPath}${locale}/${hashedFilename}`;

    // Emit the translation file
    context.emitFile({
      type: 'asset',
      fileName: outputPath,
      source: content,
    });

    manifest[namespace] = {
      path: `${opts.publicPath}${locale}/${hashedFilename}`,
      hash,
      size: content.length,
    };
  }

  return manifest;
}

/**
 * Generate content-based hash
 */
function generateContentHash(content: string, hashLength: number): string {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex')
    .slice(0, hashLength);
}

/**
 * Generate empty manifests for MFEs without translations
 */
async function generateEmptyManifests(
  context: any,
  manifestModules: Map<string, any>,
  hashLength: number
): Promise<void> {
  const emptyMasterContent = `// Auto-generated empty translation manifest
export const translationManifests = {};
export const staticManifests = {};
export const loadLocaleManifest = async (locale) => {
  console.warn(\`No translations available for locale "\${locale}"\`);
  return null;
};
export default translationManifests;
`;

  const masterHash = generateContentHash(emptyMasterContent, hashLength);
  const masterName = `i18n-master-manifest.${masterHash}.js`;

  context.emitFile({
    type: 'asset',
    fileName: masterName,
    source: emptyMasterContent,
  });

  manifestModules.set('master', { name: masterName, hash: masterHash });
}

/**
 * Generate locale-specific manifest modules
 */
async function generateLocaleManifests(
  context: any,
  translationManifests: Map<string, LocaleManifest>,
  manifestModules: Map<string, any>,
  discoveredPackages: Set<string>,
  hashLength: number
): Promise<void> {
  for (const [locale, manifest] of translationManifests.entries()) {
    const packageInfo =
      discoveredPackages.size > 0
        ? `// Includes translations from: ${Array.from(discoveredPackages).join(', ')}\n`
        : '';

    const moduleContent = `${packageInfo}export const manifest = ${JSON.stringify(
      manifest,
      null,
      2
    )};
export const getTranslationPath = (namespace) => manifest[namespace]?.path;
export default manifest;
`;

    const moduleHash = generateContentHash(moduleContent, hashLength);
    const moduleName = `i18n-manifest-${locale}.${moduleHash}.js`;

    context.emitFile({
      type: 'asset',
      fileName: moduleName,
      source: moduleContent,
    });

    manifestModules.set(locale, { name: moduleName, hash: moduleHash });
  }
}

/**
 * Generate master manifest module
 */
async function generateMasterManifest(
  context: any,
  manifestModules: Map<string, any>,
  hashLength: number
): Promise<void> {
  const imports: string[] = [];
  const mappings: string[] = [];

  for (const [locale, module] of manifestModules.entries()) {
    if (locale === 'master') continue;
    imports.push(`import manifest_${locale} from './${module.name}';`);
    mappings.push(`  '${locale}': () => import('./${module.name}')`);
  }

  const masterContent = `// Auto-generated master translation manifest
${imports.join('\n')}

export const translationManifests = {
${mappings.join(',\n')}
};

export const staticManifests = {
${Array.from(manifestModules.entries())
  .filter(([locale]) => locale !== 'master')
  .map(([locale]) => `  '${locale}': manifest_${locale}`)
  .join(',\n')}
};

export const loadLocaleManifest = async (locale) => {
  const loader = translationManifests[locale];
  if (!loader) return null;
  try {
    const module = await loader();
    return module.default || module.manifest;
  } catch (error) {
    console.error(\`Failed to load manifest for locale "\${locale}":\`, error);
    return null;
  }
};

export default translationManifests;
`;

  const masterHash = generateContentHash(masterContent, hashLength);
  const masterName = `i18n-master-manifest.${masterHash}.js`;

  context.emitFile({
    type: 'asset',
    fileName: masterName,
    source: masterContent,
  });

  manifestModules.set('master', { name: masterName, hash: masterHash });
}

/**
 * Generate metadata JSON file
 */
async function generateMetadataJson(
  context: any,
  manifestModules: Map<string, any>,
  translationManifests: Map<string, LocaleManifest>,
  discoveredPackages: Set<string>
): Promise<void> {
  const masterManifest = manifestModules.get('master');

  const metaInfo = {
    masterManifest: masterManifest?.name,
    manifestModules: Object.fromEntries(
      Array.from(manifestModules.entries()).filter(
        ([locale]) => locale !== 'master'
      )
    ),
    locales: Array.from(translationManifests.keys()),
    includedPackages: Array.from(discoveredPackages),
    generated: new Date().toISOString(),
  };

  context.emitFile({
    type: 'asset',
    fileName: 'i18n-master-manifest.json',
    source: JSON.stringify(metaInfo, null, 2),
  });
}

/**
 * Build translation assets map for build manifest
 */
function buildTranslationAssetsMap(
  translationManifests: Map<string, LocaleManifest>
): Record<string, Record<string, string>> {
  const assetsMap: Record<string, Record<string, string>> = {};

  for (const [locale, manifest] of translationManifests.entries()) {
    assetsMap[locale] = {};
    for (const [namespace, info] of Object.entries(manifest)) {
      assetsMap[locale][namespace] = info.path;
    }
  }

  return assetsMap;
}

/**
 * Check if file exists
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}
```

#### Integration with Vite Config
```typescript
// packages/gdu/config/vite/vite.config.ts (updated)
import { TranslationHashingPlugin } from './plugins/TranslationHashing';

export const createViteConfig = (
  buildEnv: string,
  isMultiEnv: boolean,
  standalone?: boolean
): ViteGuruConfig => {
  const guruConfig = getGuruConfig();

  return defineConfig({
    // ... existing config

    plugins: [
      GuruBuildManifestPlugin({
        // ... options
      }),
      TranslationHashingPlugin({
        publicPath: guruConfig.publicPath
          ? `${guruConfig.publicPath}locales/`
          : '/locales/',
        outputPath: 'locales/',
        localesDir: 'public/locales',
        hashLength: 8,
        autoIncludePackageTranslations: true,
      }),
    ],
  });
};
```

## Test Scenarios

### Happy Path
1. Build runs with MFE containing translations in `public/locales/en/common.json`
2. Plugin discovers 2 packages with translations
3. Package translations are merged with `pkg-` prefix
4. Content hash generated for each translation file
5. Locale manifest generated for `en` locale
6. Master manifest generated with dynamic import for `en`
7. Build manifest updated with i18n section
8. All files emitted successfully

### Error Scenarios
1. **Malformed JSON**: Clear error logged, build continues with other translations
2. **Missing locales directory**: Empty manifests generated
3. **Package without package.json**: Skipped gracefully
4. **Conflicting namespace**: Prefix strategy resolves conflict

### Performance Tests
- **Plugin Execution Time**: < 500ms for 5 packages, 3 locales, 10 namespaces each
- **Hash Generation**: < 10ms per translation file

## Definition of Done

### Development Complete
- [x] TranslationHashingPlugin implemented
- [x] Package auto-discovery implemented
- [x] Content hashing implemented
- [x] Locale manifest generation implemented
- [x] Master manifest generation implemented
- [x] Build manifest integration implemented
- [x] Unit tests written (>80% coverage)
- [x] Code reviewed and approved

### Testing Complete
- [x] All acceptance criteria verified
- [x] Package discovery tested with monorepo packages
- [x] Translation merging tested with prefix strategy
- [x] Hash consistency verified (same content = same hash)
- [x] Empty manifest generation tested
- [x] Edge cases tested

### Documentation Complete
- [x] JSDoc comments added
- [x] Package discovery logic documented
- [x] Manifest structure documented

### Deployment Ready
- [x] Plugin performs well
- [x] No breaking changes to i18n system

## Dependencies

### Blocked By
- AG-TBD-001: Create Vite base configuration
- AG-TBD-002: Implement GuruBuildManifest Vite plugin

### Blocks
- AG-TBD-006: Implement multi-environment builds
- AG-TBD-008: Migrate pilot SPA to Vite

### Related Stories
- Works closely with AG-TBD-002 to update build manifest

## Story Points Justification

**Complexity Factors**:
- **Plugin Complexity**: Medium
  - Similar to webpack version, well-understood logic
  - Vite plugin API differences add some complexity
- **Package Discovery**: Medium
  - File system scanning and JSON parsing
  - Edge case handling for missing/malformed files
- **Testing Effort**: Medium
  - Need to test with real packages and translations
- **Integration Points**: 3 (File system, GuruBuildManifest plugin, i18n runtime)
- **Unknown Factors**:
  - Vite's asset emission API might have quirks

**Total Points**: 5

## Notes & Decisions

### Technical Decisions
- **Decision 1**: Use `configResolved` hook for package discovery
  - **Rationale**: Happens early enough to collect all package info before build
- **Decision 2**: Maintain MD5 hashing for consistency with webpack
  - **Rationale**: Same hash algorithm ensures consistent cache behavior
- **Decision 3**: Emit translations as assets via `emitFile` API
  - **Rationale**: Vite's recommended approach for runtime assets

### Open Questions
- [x] Should we support HMR for translations in development mode?
  - **Answer**: Defer to development mode story, focus on production builds

### Assumptions
- Package discovery logic is same for webpack and Vite
- Translation file structure won't change
- i18n runtime expects same manifest format
