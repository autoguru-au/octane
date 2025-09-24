import crypto from 'crypto';
import { promises as fs, existsSync, watch, FSWatcher } from 'fs';
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

interface PackageI18nConfig {
	namespaces?: string[];
	localesPath?: string;
}

interface PluginOptions {
	publicPath?: string;
	outputPath?: string;
	localesDir?: string;
	hashLength?: number;
	excludeLocales?: string[];
	autoIncludePackageTranslations?: boolean;
	// Only 'prefix' strategy is supported to ensure clear separation and gitignore compatibility
	packageTranslationMergeStrategy?: 'prefix';
}

const pluginName = 'TranslationHashingPlugin';
const MAX_WATCHERS = 100; // Prevent resource exhaustion
const DEBOUNCE_MS = 300; // Debounce rapid file changes

export class TranslationHashingPlugin {
	private options: Required<PluginOptions>;
	private translationManifests: Map<string, LocaleManifest> = new Map();
	private manifestModules: Map<string, ManifestModule> = new Map();
	private packageTranslations: Map<string, Map<string, any>> = new Map();
	private discoveredPackages: Set<string> = new Set();
	private packagePaths: Map<string, string> = new Map();
	private watchers: Map<string, FSWatcher> = new Map();
	private translationVersions: Map<string, number> = new Map();
	private changeDebounceTimers: Map<string, NodeJS.Timeout> = new Map();
	private maxTranslationVersions = 1000; // LRU cache size limit

	constructor(options: PluginOptions = {}) {
		this.options = {
			publicPath: options.publicPath || '/locales/',
			outputPath: options.outputPath || 'locales/',
			localesDir: options.localesDir || 'public/locales',
			hashLength: options.hashLength || 8,
			excludeLocales: options.excludeLocales || [],
			autoIncludePackageTranslations:
				options.autoIncludePackageTranslations !== false,
			packageTranslationMergeStrategy: 'prefix', // Always use prefix for safety
		};
	}

	apply(compiler: Compiler) {
		const isDevelopment = compiler.options.mode === 'development';

		// Clean up watchers on shutdown
		compiler.hooks.shutdown.tap(pluginName, () => {
			this.cleanupWatchers();
		});

		// Clean up watchers on compilation failure
		compiler.hooks.failed.tap(pluginName, () => {
			this.cleanupWatchers();
		});

		// Clean up watchers on watch run to handle restarts
		compiler.hooks.watchClose.tap(pluginName, () => {
			this.cleanupWatchers();
		});

		compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
			// Discover package translations if enabled
			if (this.options.autoIncludePackageTranslations) {
				compilation.hooks.finishModules.tapAsync(
					pluginName,
					async (modules, callback) => {
						try {
							await this.discoverPackageTranslations(
								modules,
								compiler,
							);

							// In development mode, copy package translations to public directory and set up watchers
							if (isDevelopment) {
								await this.copyPackageTranslationsToDev(
									compiler,
								);
								this.setupTranslationWatchers(
									compiler,
									compilation,
								);
							}

							callback();
						} catch (error) {
							callback(error as Error);
						}
					},
				);
			}

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
				},
			);
		});

		// Hook into the emit phase to update the build manifest
		compiler.hooks.emit.tapAsync(
			pluginName,
			async (compilation, callback) => {
				try {
					await this.updateBuildManifest(compilation);
					callback();
				} catch (error) {
					callback(error as Error);
				}
			},
		);
	}

	private async discoverPackageTranslations(
		modules: any,
		compiler: Compiler,
	) {
		const processedPackages = new Set<string>();
		await this.scanModules(modules, processedPackages, compiler);
	}

	private async scanModules(
		modules: any,
		processedPackages: Set<string>,
		compiler: Compiler,
	) {
		for (const module of modules) {
			const resourcePath = module.resource || module.userRequest || '';

			// Process monorepo packages
			await this.processMonorepoPackage(
				resourcePath,
				processedPackages,
				compiler,
			);

			// Process @autoguru packages
			if (resourcePath.includes('@autoguru/')) {
				await this.processAutoguruPackage(
					resourcePath,
					processedPackages,
					compiler,
				);
			}
		}
	}

	private async processMonorepoPackage(
		resourcePath: string,
		processedPackages: Set<string>,
		compiler: Compiler,
	) {
		if (!resourcePath.includes('/packages/')) {
			return;
		}

		const packageMatch = resourcePath.match(/\/packages\/([^/]+)/);
		if (!packageMatch) {
			return;
		}

		const packageName = packageMatch[1];

		// Skip if already processed
		if (processedPackages.has(packageName)) {
			return;
		}

		processedPackages.add(packageName);

		// Dynamically discover any package in /packages/ directory
		// First try as @autoguru scoped package
		const scopedPackageName = `@autoguru/${packageName}`;
		await this.checkPackageForTranslations(scopedPackageName, compiler);

		// Also try without scope for local packages
		await this.checkPackageForTranslations(packageName, compiler);
	}

	private async processAutoguruPackage(
		resourcePath: string,
		processedPackages: Set<string>,
		compiler: Compiler,
	) {
		const match = resourcePath.match(/@autoguru\/([^/]+)/);
		if (!match || processedPackages.has(match[1])) {
			return;
		}

		const packageName = `@autoguru/${match[1]}`;
		processedPackages.add(match[1]);

		await this.checkPackageForTranslations(packageName, compiler);
	}

	private async checkPackageForTranslations(
		packageName: string,
		compiler: Compiler,
	) {
		try {
			const { packagePath, packageJsonPath } = this.resolvePackagePaths(
				packageName,
				compiler,
			);

			if (!existsSync(packageJsonPath)) {
				return;
			}

			const packageJson = JSON.parse(
				await fs.readFile(packageJsonPath, 'utf8'),
			);
			await this.processPackageTranslations(
				packageName,
				packagePath,
				packageJson,
			);
		} catch (error) {
			console.warn(
				`[${pluginName}] Error checking package ${packageName}:`,
				error,
			);
		}
	}

	private resolvePackagePaths(packageName: string, compiler: Compiler) {
		// Try to find the package in the monorepo first (packages directory)
		const monorepoPackagePath = path.join(
			compiler.context,
			'../../packages',
			packageName.replace('@autoguru/', ''),
		);

		// Check if it's a monorepo package
		if (existsSync(monorepoPackagePath)) {
			return {
				packagePath: monorepoPackagePath,
				packageJsonPath: path.join(monorepoPackagePath, 'package.json'),
			};
		}

		// Fall back to node_modules
		const nodeModulesPath = path.join(
			compiler.context,
			'node_modules',
			packageName,
		);
		return {
			packagePath: nodeModulesPath,
			packageJsonPath: path.join(nodeModulesPath, 'package.json'),
		};
	}

	private async processPackageTranslations(
		packageName: string,
		packagePath: string,
		packageJson: any,
	) {
		// Check if package has i18n configuration
		if (packageJson.i18n) {
			const i18nConfig = packageJson.i18n as PackageI18nConfig;
			const localesPath = path.join(
				packagePath,
				i18nConfig.localesPath || 'locales',
			);

			if (existsSync(localesPath)) {
				this.discoveredPackages.add(packageName);
				this.packagePaths.set(packageName, packagePath);
				await this.loadPackageTranslations(
					packageName,
					localesPath,
					i18nConfig.namespaces,
				);
			}
			return;
		}

		// Check for default locales directory even without explicit config
		const defaultLocalesPath = path.join(packagePath, 'locales');
		if (existsSync(defaultLocalesPath)) {
			this.discoveredPackages.add(packageName);
			this.packagePaths.set(packageName, packagePath);
			await this.loadPackageTranslations(packageName, defaultLocalesPath);
		}
	}

	private async loadPackageTranslations(
		packageName: string,
		localesPath: string,
		namespaces?: string[],
	) {
		const packageTranslations = new Map<string, any>();

		try {
			const locales = await fs.readdir(localesPath);

			for (const locale of locales) {
				const localeTranslations = await this.loadLocaleTranslations(
					localesPath,
					locale,
					namespaces,
				);

				if (
					localeTranslations &&
					Object.keys(localeTranslations).length > 0
				) {
					packageTranslations.set(locale, localeTranslations);
				}
			}

			if (packageTranslations.size > 0) {
				this.packageTranslations.set(packageName, packageTranslations);
			}
		} catch (error) {
			console.error(
				`[${pluginName}] Error loading translations from ${packageName}:`,
				error,
			);
		}
	}

	private async loadLocaleTranslations(
		localesPath: string,
		locale: string,
		namespaces?: string[],
	): Promise<any | null> {
		const localePath = path.join(localesPath, locale);
		const stat = await fs.stat(localePath);

		if (!stat.isDirectory()) {
			return null;
		}

		const localeTranslations: any = {};
		const files = await fs.readdir(localePath);

		for (const file of files) {
			if (!file.endsWith('.json')) continue;

			const namespace = file.replace('.json', '');

			if (namespaces && !namespaces.includes(namespace)) {
				continue;
			}

			await this.loadTranslationFile(
				localePath,
				file,
				namespace,
				localeTranslations,
			);
		}

		return localeTranslations;
	}

	private async loadTranslationFile(
		localePath: string,
		file: string,
		namespace: string,
		localeTranslations: any,
	): Promise<void> {
		const filePath = path.join(localePath, file);
		const content = await fs.readFile(filePath, 'utf8');

		try {
			localeTranslations[namespace] = JSON.parse(content);
		} catch (error) {
			console.error(
				`[${pluginName}] Failed to parse ${filePath}:`,
				error,
			);
		}
	}

	private getEffectiveNamespace(
		namespace: string,
		packageName: string,
	): string {
		// Check if namespace already has the prefix to avoid double-prefixing
		if (namespace.startsWith('pkg-')) {
			return namespace;
		}

		// Apply prefix strategy for clear separation and gitignore compatibility
		const simplifiedPackageName = packageName.replace('@autoguru/', '');
		// Use simplified naming: pkg-[package-name] instead of pkg-[package-name]-[namespace]
		// This assumes namespace matches package name for package translations
		return `pkg-${simplifiedPackageName}`;
	}

	private async copyPackageTranslationsToDev(compiler: Compiler) {
		const publicLocalesPath = path.join(compiler.context, 'public/locales');

		for (const [packageName, packageTranslations] of this
			.packageTranslations) {
			for (const [locale, namespaces] of packageTranslations) {
				const targetLocalePath = path.join(publicLocalesPath, locale);

				// Ensure locale directory exists
				await fs.mkdir(targetLocalePath, { recursive: true });

				for (const [namespace, translations] of Object.entries(
					namespaces,
				)) {
					// Use getEffectiveNamespace to handle already-prefixed namespaces
					const effectiveNamespace = this.getEffectiveNamespace(
						namespace,
						packageName,
					);
					const targetFile = path.join(
						targetLocalePath,
						`${effectiveNamespace}.json`,
					);

					// Write the translation file
					await fs.writeFile(
						targetFile,
						JSON.stringify(translations, null, 2),
					);
				}
			}
		}
	}

	private async generateEmptyManifests(compilation: Compilation) {
		// Generate empty master manifest for MFEs without translations
		const emptyMasterContent = `// Auto-generated empty translation manifest for MFEs without translations
export const translationManifests = {};

export const staticManifests = {};

export const loadLocaleManifest = async (locale) => {
  console.warn(\`No translations available for locale "\${locale}"\`);
  return null;
};

export const getStaticManifest = (locale) => {
  return null;
};

export const getSupportedLocales = () => {
  return [];
};

export const preloadLocales = async (locales = []) => {
  return {};
};

export const initializeI18n = async () => {
  return null;
};

export default translationManifests;
`;

		// Generate a hash for consistency
		// eslint-disable-next-line sonarjs/hashing
		const masterHash = crypto
			.createHash('md5')
			.update(emptyMasterContent)
			.digest('hex')
			.slice(0, Math.max(0, this.options.hashLength));

		const masterName = `i18n-master-manifest.${masterHash}.js`;

		compilation.emitAsset(
			masterName,
			new sources.RawSource(emptyMasterContent, false),
		);

		// Create the metadata JSON file
		const metaInfo = {
			masterManifest: masterName,
			manifestModules: {},
			locales: [],
			generated: new Date().toISOString(),
			empty: true,
		};

		compilation.emitAsset(
			'i18n-master-manifest.json',
			new sources.RawSource(JSON.stringify(metaInfo, null, 2), false),
		);
	}

	private async processTranslations(
		compiler: Compiler,
		compilation: Compilation,
	) {
		const localesPath = path.join(
			compiler.context,
			this.options.localesDir,
		);

		const allLocales = await this.collectAllLocales(localesPath);

		if (allLocales.size === 0) {
			await this.generateEmptyManifests(compilation);
			return;
		}

		// Process each locale
		for (const locale of allLocales) {
			const manifest = await this.processLocaleWithPackages(
				localesPath,
				locale,
				compilation,
			);
			this.translationManifests.set(locale, manifest);
		}

		// Generate per-locale manifest modules
		await this.generateManifestModules(compilation);

		// Generate master manifest module
		await this.generateMasterManifest(compilation);
	}

	private async collectAllLocales(localesPath: string): Promise<Set<string>> {
		const allLocales = new Set<string>();

		// Add MFE locales
		await this.collectMfeLocales(localesPath, allLocales);

		// Add package locales
		this.collectPackageLocales(allLocales);

		return allLocales;
	}

	private async collectMfeLocales(
		localesPath: string,
		allLocales: Set<string>,
	): Promise<void> {
		if (!existsSync(localesPath)) {
			return;
		}

		const mfeLocales = await fs.readdir(localesPath);
		for (const locale of mfeLocales) {
			const stat = await fs.stat(path.join(localesPath, locale));
			if (
				stat.isDirectory() &&
				!this.options.excludeLocales.includes(locale)
			) {
				allLocales.add(locale);
			}
		}
	}

	private collectPackageLocales(allLocales: Set<string>): void {
		if (!this.options.autoIncludePackageTranslations) {
			return;
		}

		for (const [, packageTranslations] of this.packageTranslations) {
			for (const locale of packageTranslations.keys()) {
				if (!this.options.excludeLocales.includes(locale)) {
					allLocales.add(locale);
				}
			}
		}
	}

	private async processLocaleWithPackages(
		mfeLocalesPath: string,
		locale: string,
		compilation: Compilation,
	): Promise<LocaleManifest> {
		const processedTranslations: { [namespace: string]: any } = {};

		// Load MFE translations
		await this.loadMfeTranslations(
			mfeLocalesPath,
			locale,
			processedTranslations,
		);

		// Merge package translations
		await this.mergePackageTranslations(locale, processedTranslations);

		// Emit translations and build manifest
		return this.emitTranslationsAndBuildManifest(
			locale,
			processedTranslations,
			compilation,
		);
	}

	private async loadMfeTranslations(
		mfeLocalesPath: string,
		locale: string,
		processedTranslations: { [namespace: string]: any },
	): Promise<void> {
		const mfeLocalePath = path.join(mfeLocalesPath, locale);
		if (!existsSync(mfeLocalePath)) {
			return;
		}

		const files = await fs.readdir(mfeLocalePath);

		for (const file of files) {
			if (!file.endsWith('.json')) continue;

			const namespace = file.replace('.json', '');
			const filePath = path.join(mfeLocalePath, file);
			const content = await fs.readFile(filePath, 'utf8');

			try {
				processedTranslations[namespace] = JSON.parse(content);
			} catch (error) {
				console.error(
					`[${pluginName}] Failed to parse ${filePath}:`,
					error,
				);
			}
		}
	}

	private async mergePackageTranslations(
		locale: string,
		processedTranslations: { [namespace: string]: any },
	): Promise<void> {
		if (!this.options.autoIncludePackageTranslations) {
			return;
		}

		for (const [packageName, packageTranslations] of this
			.packageTranslations) {
			const packageLocaleTranslations = packageTranslations.get(locale);
			if (!packageLocaleTranslations) {
				continue;
			}

			this.mergeNamespaceTranslations(
				packageName,
				packageLocaleTranslations,
				processedTranslations,
			);
		}
	}

	private mergeNamespaceTranslations(
		packageName: string,
		packageLocaleTranslations: any,
		processedTranslations: { [namespace: string]: any },
	): void {
		for (const [namespace, translations] of Object.entries(
			packageLocaleTranslations,
		)) {
			const effectiveNamespace = this.getEffectiveNamespace(
				namespace,
				packageName,
			);
			this.applyMergeStrategy(
				effectiveNamespace,
				translations,
				processedTranslations,
			);
		}
	}

	private applyMergeStrategy(
		effectiveNamespace: string,
		translations: any,
		processedTranslations: { [namespace: string]: any },
	): void {
		// Always use prefix strategy - directly assign the translation
		processedTranslations[effectiveNamespace] = translations;
	}

	private emitTranslationsAndBuildManifest(
		locale: string,
		processedTranslations: { [namespace: string]: any },
		compilation: Compilation,
	): LocaleManifest {
		const manifest: LocaleManifest = {};

		for (const [namespace, translations] of Object.entries(
			processedTranslations,
		)) {
			const content = JSON.stringify(translations);
			const hash = this.generateContentHash(content);
			const hashedFilename = `${namespace}.${hash}.json`;
			const outputPath = path.join(
				this.options.outputPath,
				locale,
				hashedFilename,
			);

			compilation.emitAsset(
				outputPath,
				new sources.RawSource(content, false),
			);

			manifest[namespace] = {
				path: `/locales/${locale}/${hashedFilename}`,
				hash: hash,
				size: content.length,
			};
		}

		return manifest;
	}

	private generateContentHash(content: string): string {
		// eslint-disable-next-line sonarjs/hashing
		return crypto
			.createHash('md5')
			.update(content)
			.digest('hex')
			.slice(0, Math.max(0, this.options.hashLength));
	}

	private async generateManifestModules(compilation: Compilation) {
		for (const [locale, manifest] of this.translationManifests.entries()) {
			const moduleContent = this.createManifestModule(manifest);
			// eslint-disable-next-line sonarjs/hashing
			const moduleHash = crypto
				.createHash('md5')
				.update(moduleContent)
				.digest('hex')
				.slice(0, Math.max(0, this.options.hashLength));

			const moduleName = `i18n-manifest-${locale}.${moduleHash}.js`;

			compilation.emitAsset(
				moduleName,
				new sources.RawSource(moduleContent, false),
			);

			this.manifestModules.set(locale, {
				name: moduleName,
				hash: moduleHash,
			});
		}
	}

	private createManifestModule(manifest: LocaleManifest): string {
		// Include information about discovered packages in comments
		const packageInfo =
			this.discoveredPackages.size > 0
				? `// Includes translations from packages: ${Array.from(this.discoveredPackages).join(', ')}\n`
				: '';

		return `// Auto-generated translation manifest
${packageInfo}export const manifest = ${JSON.stringify(manifest, null, 2)};

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
${Array.from(this.manifestModules.keys())
	.map((locale) => `  '${locale}': manifest_${locale}`)
	.join(',\n')}
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

  const loaded = {};
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

		// eslint-disable-next-line sonarjs/hashing
		const masterHash = crypto
			.createHash('md5')
			.update(masterContent)
			.digest('hex')
			.slice(0, Math.max(0, this.options.hashLength));

		const masterName = `i18n-master-manifest.${masterHash}.js`;

		compilation.emitAsset(
			masterName,
			new sources.RawSource(masterContent, false),
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
					new sources.RawSource(
						JSON.stringify(metaInfo, null, 2),
						false,
					),
				);
			}
		});
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
				const manifest = JSON.parse(
					buildManifestAsset.source.source().toString(),
				);

				// Add i18n information to the build manifest
				manifest.i18n = {
					masterManifest: metaInfo.masterManifest,
					manifestModules: metaInfo.manifestModules,
					supportedLocales: metaInfo.locales,
					includedPackages: Array.from(this.discoveredPackages),
					translationAssets: {},
				};

				// Add translation file paths
				for (const [
					locale,
					localeManifest,
				] of this.translationManifests.entries()) {
					manifest.i18n.translationAssets[locale] = {};
					for (const [namespace, info] of Object.entries(
						localeManifest,
					)) {
						manifest.i18n.translationAssets[locale][namespace] =
							info.path;
					}
				}

				compilation.updateAsset(
					'build-manifest.json',
					new sources.RawSource(
						JSON.stringify(manifest, null, 2),
						false,
					),
				);
			} catch (error) {
				console.error(
					`[${pluginName}] Failed to update build manifest:`,
					error,
				);
			}
		}
	}

	/**
	 * Set up file watchers for package translation files in development mode
	 */
	private setupTranslationWatchers(
		compiler: Compiler,
		compilation: Compilation,
	) {
		// Clean up existing watchers first
		this.cleanupWatchers();

		for (const [, packagePath] of this.packagePaths) {
			if (!packagePath) continue;

			// Check watcher limit to prevent resource exhaustion
			if (this.watchers.size >= MAX_WATCHERS) {
				console.warn(
					`[${pluginName}] Maximum watchers (${MAX_WATCHERS}) reached, skipping additional watches`,
				);
				return;
			}

			const watchPaths = [];

			// Watch the package's locales directory
			const localesPath = path.join(packagePath, 'locales');
			if (existsSync(localesPath)) {
				watchPaths.push(localesPath);
			}

			// Also watch the package's src/locales if it exists
			const srcLocalesPath = path.join(packagePath, 'src', 'locales');
			if (existsSync(srcLocalesPath)) {
				watchPaths.push(srcLocalesPath);
			}

			watchPaths.forEach((watchPath) => {
				if (
					!this.watchers.has(watchPath) &&
					this.watchers.size < MAX_WATCHERS
				) {
					// Platform-specific watch options
					const watchOptions: any = { recursive: true };

					// Add platform-specific options for better reliability
					if (process.platform === 'darwin') {
						// macOS specific options
						watchOptions.persistent = true;
					} else if (process.platform === 'win32') {
						// Windows specific options
						watchOptions.persistent = true;
						// Windows may need longer delay for file system events
						watchOptions.interval = 100;
					}

					const watcher = watch(
						watchPath,
						watchOptions,
						async (_eventType, filename) => {
							// Handle both string and Buffer types for filename
							const fileStr = filename ? filename.toString() : '';
							if (fileStr && fileStr.endsWith('.json')) {
								// Debounce rapid file changes
								const changeKey = `${watchPath}/${fileStr}`;

								// Clear existing timer for this file
								if (this.changeDebounceTimers.has(changeKey)) {
									clearTimeout(
										this.changeDebounceTimers.get(
											changeKey,
										)!,
									);
								}

								// Set new debounced timer
								const timer = setTimeout(async () => {
									this.changeDebounceTimers.delete(changeKey);
									await this.handleTranslationChange(
										compiler,
										compilation,
										watchPath,
										fileStr,
									);
								}, DEBOUNCE_MS);

								this.changeDebounceTimers.set(changeKey, timer);
							}
						},
					);
					this.watchers.set(watchPath, watcher);
				}
			});
		}
	}

	/**
	 * Handle translation file changes and trigger HMR update
	 */
	private async handleTranslationChange(
		compiler: Compiler,
		_compilation: Compilation,
		watchPath: string,
		filename: string,
	) {
		// Path validation for security
		if (filename.includes('..') || filename.includes('~')) {
			console.warn(
				`[${pluginName}] Suspicious filename detected, ignoring: ${filename}`,
			);
			return;
		}

		const filePath = path.join(watchPath, filename);
		const normalizedPath = path.normalize(filePath);

		// Ensure the path is still within the watch directory
		if (!normalizedPath.startsWith(path.normalize(watchPath))) {
			console.warn(
				`[${pluginName}] Path traversal attempt detected, ignoring: ${filename}`,
			);
			return;
		}

		// Extract locale and namespace from the file path
		const match = normalizedPath.match(
			/locales[/\\]([^/\\]+)[/\\]([^/\\]+)\.json$/,
		);
		if (!match) return;

		const [, locale, namespace] = match;

		// Find which package this belongs to
		let packageName = '';
		for (const [pkgName, pkgPath] of this.packagePaths) {
			if (filePath.startsWith(pkgPath)) {
				packageName = pkgName;
				break;
			}
		}

		if (!packageName) return;

		const effectiveNamespace = this.getEffectiveNamespace(
			namespace,
			packageName,
		);

		try {
			// Check file size to prevent memory exhaustion
			const stats = await fs.stat(filePath);
			const maxFileSize = 10 * 1024 * 1024; // 10MB limit for translation files

			if (stats.size > maxFileSize) {
				console.warn(
					`[${pluginName}] Translation file too large (${stats.size} bytes), skipping: ${filePath}`,
				);
				return;
			}

			// Read the updated translation file
			const content = await fs.readFile(filePath, 'utf8');
			const translations = JSON.parse(content);

			// Update our in-memory cache
			if (!this.packageTranslations.has(packageName)) {
				this.packageTranslations.set(packageName, new Map());
			}
			const packageTranslations =
				this.packageTranslations.get(packageName)!;

			if (!packageTranslations.has(locale)) {
				packageTranslations.set(locale, {});
			}
			packageTranslations.get(locale)![namespace] = translations;

			// Copy the updated file to the public directory
			const publicLocalesPath = path.join(
				compiler.context,
				'public/locales',
			);
			const targetLocalePath = path.join(publicLocalesPath, locale);
			await fs.mkdir(targetLocalePath, { recursive: true });

			// Add a timestamp for cache busting with LRU cache management
			const version = Date.now();
			const versionKey = `${locale}/${effectiveNamespace}`;

			// Implement simple LRU cache for translation versions
			if (this.translationVersions.size >= this.maxTranslationVersions) {
				// Remove oldest entry (first in the Map)
				const firstKey = this.translationVersions.keys().next().value;
				this.translationVersions.delete(firstKey);
			}

			this.translationVersions.set(versionKey, version);

			const targetFile = path.join(
				targetLocalePath,
				`${effectiveNamespace}.json`,
			);
			await fs.writeFile(
				targetFile,
				JSON.stringify(translations, null, 2),
			);

			// Invalidate webpack's watching to trigger HMR
			if (compiler.watching) {
				compiler.watching.invalidate();
			}

			console.log(
				`[TranslationHashingPlugin] Updated ${locale}/${effectiveNamespace} from ${packageName}`,
			);
		} catch (error) {
			console.error(
				`[TranslationHashingPlugin] Error handling translation change:`,
				error,
			);
		}
	}

	/**
	 * Clean up all file watchers and timers
	 */
	private cleanupWatchers() {
		// Close all file watchers
		for (const [, watcher] of this.watchers) {
			watcher.close();
		}
		this.watchers.clear();

		// Clear all debounce timers
		for (const [, timer] of this.changeDebounceTimers) {
			clearTimeout(timer);
		}
		this.changeDebounceTimers.clear();
	}
}
