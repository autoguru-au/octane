import crypto from 'crypto';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import { Compiler, Compilation, sources } from 'webpack';

interface TranslationInfo {
  path: string;
  hash: string;
  size: number;
}

interface LocaleManifest {
  [namespace: string]: TranslationInfo;
}

interface ManifestModule {
  name: string;
  hash: string;
}

interface PluginOptions {
  publicPath?: string;
  outputPath?: string;
  localesDir?: string;
  hashLength?: number;
  excludeLocales?: string[];
}

const pluginName = 'TranslationHashingPlugin';

export class TranslationHashingPlugin {
  private options: Required<PluginOptions>;
  private translationManifests: Map<string, LocaleManifest> = new Map();
  private manifestModules: Map<string, ManifestModule> = new Map();

  constructor(options: PluginOptions = {}) {
    this.options = {
      publicPath: options.publicPath || '/locales/',
      outputPath: options.outputPath || 'locales/',
      localesDir: options.localesDir || 'public/locales',
      hashLength: options.hashLength || 8,
      excludeLocales: options.excludeLocales || [],
    };
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async (_assets, callback) => {
          try {
            await this.processTranslations(compiler, compilation);
            callback();
          } catch (error) {
            callback(error as Error);
          }
        }
      );
    });

    // Hook into the emit phase to update the build manifest
    compiler.hooks.emit.tapAsync(pluginName, async (compilation, callback) => {
      try {
        await this.updateBuildManifest(compilation);
        callback();
      } catch (error) {
        callback(error as Error);
      }
    });
  }

  private async processTranslations(compiler: Compiler, compilation: Compilation) {
    const localesPath = path.join(compiler.context, this.options.localesDir);
    
    if (!existsSync(localesPath)) {
      console.log(`[${pluginName}] No locales directory found at ${localesPath}`);
      return;
    }

    console.log(`[${pluginName}] Processing translations from ${localesPath}`);
    
    // Get all locale directories
    const locales = await fs.readdir(localesPath);
    
    for (const locale of locales) {
      if (this.options.excludeLocales.includes(locale)) {
        continue;
      }
      
      const localePath = path.join(localesPath, locale);
      const stat = await fs.stat(localePath);
      
      if (stat.isDirectory()) {
        const manifest = await this.processLocale(localePath, locale, compilation);
        this.translationManifests.set(locale, manifest);
      }
    }

    // Generate per-locale manifest modules
    await this.generateManifestModules(compilation);
    
    // Generate master manifest module
    await this.generateMasterManifest(compilation);
  }

  private async processLocale(
    localePath: string,
    locale: string,
    compilation: Compilation
  ): Promise<LocaleManifest> {
    const manifest: LocaleManifest = {};
    const files = await fs.readdir(localePath);
    
    for (const file of files) {
      if (!file.endsWith('.json')) {
        continue;
      }
      
      const filePath = path.join(localePath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Generate content hash
      const hash = crypto
        .createHash('md5')
        .update(content)
        .digest('hex')
        .substring(0, this.options.hashLength);
      
      const namespace = file.replace('.json', '');
      const hashedFilename = `${namespace}.${hash}.json`;
      const outputPath = path.join(this.options.outputPath, locale, hashedFilename);
      
      // Add to compilation assets
      compilation.emitAsset(
        outputPath,
        new sources.RawSource(content, false)
      );
      
      manifest[namespace] = {
        path: `${this.options.publicPath}${locale}/${hashedFilename}`,
        hash: hash,
        size: content.length,
      };
      
      console.log(`[${pluginName}] Processed ${locale}/${namespace} -> ${hashedFilename}`);
    }
    
    return manifest;
  }

  private async generateManifestModules(compilation: Compilation) {
    for (const [locale, manifest] of this.translationManifests.entries()) {
      const moduleContent = this.createManifestModule(manifest);
      const moduleHash = crypto
        .createHash('md5')
        .update(moduleContent)
        .digest('hex')
        .substring(0, this.options.hashLength);
      
      const moduleName = `i18n-manifest-${locale}.${moduleHash}.js`;
      
      compilation.emitAsset(
        moduleName,
        new sources.RawSource(moduleContent, false)
      );
      
      this.manifestModules.set(locale, {
        name: moduleName,
        hash: moduleHash,
      });
      
      console.log(`[${pluginName}] Generated manifest module: ${moduleName}`);
    }
  }

  private createManifestModule(manifest: LocaleManifest): string {
    return `// Auto-generated translation manifest
export const manifest = ${JSON.stringify(manifest, null, 2)};

export const getTranslationPath = (namespace) => {
  const translation = manifest[namespace];
  if (!translation) {
    console.warn(\`Translation namespace "\${namespace}" not found in manifest\`);
    return null;
  }
  return translation.path;
};

export const getTranslationHash = (namespace) => {
  return manifest[namespace]?.hash;
};

export const getTranslationSize = (namespace) => {
  return manifest[namespace]?.size;
};

export const getAllNamespaces = () => {
  return Object.keys(manifest);
};

export const getManifestInfo = () => {
  return {
    namespaces: Object.keys(manifest),
    totalSize: Object.values(manifest).reduce((sum, info) => sum + info.size, 0),
    translations: manifest,
  };
};

export default manifest;
`;
  }

  private async generateMasterManifest(compilation: Compilation) {
    const imports: string[] = [];
    const mappings: string[] = [];
    
    for (const [locale, module] of this.manifestModules.entries()) {
      imports.push(`import manifest_${locale} from './${module.name}';`);
      mappings.push(`  '${locale}': () => import('./${module.name}')`);
    }
    
    const masterContent = `// Auto-generated master translation manifest
// Static imports for immediate availability
${imports.join('\n')}

// Dynamic imports for lazy loading
export const translationManifests = {
${mappings.join(',\n')}
};

// Static manifest access for SSR/preloading
export const staticManifests = {
${Array.from(this.manifestModules.keys()).map(locale => `  '${locale}': manifest_${locale}`).join(',\n')}
};

export const loadLocaleManifest = async (locale) => {
  const loader = translationManifests[locale];
  if (!loader) {
    console.warn(\`Locale "\${locale}" not found in translation manifests\`);
    return null;
  }
  
  try {
    const module = await loader();
    return module.default || module.manifest;
  } catch (error) {
    console.error(\`Failed to load manifest for locale "\${locale}":\`, error);
    return null;
  }
};

export const getStaticManifest = (locale) => {
  return staticManifests[locale] || null;
};

export const getSupportedLocales = () => {
  return Object.keys(translationManifests);
};

export const preloadLocales = async (locales = ['en']) => {
  const promises = locales.map(locale => loadLocaleManifest(locale));
  const results = await Promise.allSettled(promises);
  
  const loaded: Record<string, unknown | null> = {};
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      loaded[locales[index]] = result.value;
    }
  });
  
  return loaded;
};

// Initialize with detected locale
export const initializeI18n = async () => {
  const detectedLocale = (typeof navigator !== 'undefined' && typeof navigator.language === 'string' && navigator.language) 
    ? navigator.language.split('-')[0] 
    : 'en';
  
  const supportedLocales = getSupportedLocales();
  const locale = supportedLocales.includes(detectedLocale) ? detectedLocale : 'en';
  
  return loadLocaleManifest(locale);
};

export default translationManifests;
`;

    const masterHash = crypto
      .createHash('md5')
      .update(masterContent)
      .digest('hex')
      .substring(0, this.options.hashLength);
    
    const masterName = `i18n-master-manifest.${masterHash}.js`;
    
    compilation.emitAsset(
      masterName,
      new sources.RawSource(masterContent, false)
    );
    
    // Store the master manifest name for later use
    compilation.hooks.afterProcessAssets.tap(pluginName, () => {
      if (!compilation.assets['i18n-master-manifest.json']) {
        const metaInfo = {
          masterManifest: masterName,
          manifestModules: Object.fromEntries(this.manifestModules),
          locales: Array.from(this.translationManifests.keys()),
          generated: new Date().toISOString(),
        };
        
        compilation.emitAsset(
          'i18n-master-manifest.json',
          new sources.RawSource(JSON.stringify(metaInfo, null, 2), false)
        );
      }
    });
    
    console.log(`[${pluginName}] Generated master manifest: ${masterName}`);
  }

  private async updateBuildManifest(compilation: Compilation) {
    // Find the i18n master manifest metadata
    const metaAsset = compilation.getAsset('i18n-master-manifest.json');
    if (!metaAsset) {
      return;
    }
    
    const metaInfo = JSON.parse(metaAsset.source.source().toString());
    
    // Find and update the build manifest if it exists
    const buildManifestAsset = compilation.getAsset('build-manifest.json');
    if (buildManifestAsset) {
      try {
        const manifest = JSON.parse(buildManifestAsset.source.source().toString());
        
        // Add i18n information to the build manifest
        manifest.i18n = {
          masterManifest: metaInfo.masterManifest,
          manifestModules: metaInfo.manifestModules,
          supportedLocales: metaInfo.locales,
          translationAssets: {},
        };
        
        // Add translation file paths
        for (const [locale, localeManifest] of this.translationManifests.entries()) {
          manifest.i18n.translationAssets[locale] = {};
          for (const [namespace, info] of Object.entries(localeManifest)) {
            manifest.i18n.translationAssets[locale][namespace] = info.path;
          }
        }
        
        compilation.updateAsset(
          'build-manifest.json',
          new sources.RawSource(JSON.stringify(manifest, null, 2), false)
        );
        
        console.log(`[${pluginName}] Updated build-manifest.json with i18n information`);
      } catch (error) {
        console.error(`[${pluginName}] Failed to update build manifest:`, error);
      }
    }
  }
}