import crypto from 'crypto';
import { existsSync, promises as fs } from 'fs';
import path from 'path';

import type { PluginContext, VitePlugin } from '../types';

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

interface TranslationHashingOptions {
	appDir: string;
	workspaceRoot: string;
	publicPath?: string;
	outputPath?: string;
	localesDir?: string;
	hashLength?: number;
	excludeLocales?: string[];
	autoIncludePackageTranslations?: boolean;
}

const PLUGIN_NAME = 'gdu-translation-hashing';

function generateContentHash(content: string, length: number): string {
	// eslint-disable-next-line sonarjs/hashing -- MD5 is used for cache-busting content hashes, not for security
	return crypto
		.createHash('md5')
		.update(content)
		.digest('hex')
		.slice(0, Math.max(0, length));
}

async function collectMfeLocales(
	localesPath: string,
	excludeLocales: string[],
): Promise<Set<string>> {
	const locales = new Set<string>();

	if (!existsSync(localesPath)) {
		return locales;
	}

	const entries = await fs.readdir(localesPath);

	for (const entry of entries) {
		const stat = await fs.stat(path.join(localesPath, entry));
		if (stat.isDirectory() && !excludeLocales.includes(entry)) {
			locales.add(entry);
		}
	}

	return locales;
}

async function loadMfeTranslations(
	mfeLocalesPath: string,
	locale: string,
): Promise<Record<string, unknown>> {
	const localePath = path.join(mfeLocalesPath, locale);
	const translations: Record<string, unknown> = {};

	if (!existsSync(localePath)) {
		return translations;
	}

	const files = await fs.readdir(localePath);

	for (const file of files) {
		if (!file.endsWith('.json')) continue;

		const namespace = file.replace('.json', '');
		const filePath = path.join(localePath, file);
		const content = await fs.readFile(filePath, 'utf8');

		try {
			translations[namespace] = JSON.parse(content);
		} catch {
			console.error(`[${PLUGIN_NAME}] Failed to parse ${filePath}`);
		}
	}

	return translations;
}

function getEffectiveNamespace(namespace: string, packageName: string): string {
	if (namespace.startsWith('pkg-')) {
		return namespace;
	}

	const simplifiedPackageName = packageName.replace('@autoguru/', '');
	return `pkg-${simplifiedPackageName}`;
}

interface ResolvedPackageLocales {
	localesPath: string;
	namespaceFilter?: string[];
}

function resolvePackageLocalesPath(
	packagePath: string,
): ResolvedPackageLocales | null {
	const packageJsonPath = path.join(packagePath, 'package.json');
	if (!existsSync(packageJsonPath)) return null;

	try {
		const raw = require(packageJsonPath) as { i18n?: PackageI18nConfig };

		if (raw.i18n) {
			const candidatePath = path.join(
				packagePath,
				raw.i18n.localesPath || 'locales',
			);
			if (!existsSync(candidatePath)) return null;
			return {
				localesPath: candidatePath,
				namespaceFilter: raw.i18n.namespaces,
			};
		}

		const defaultPath = path.join(packagePath, 'locales');
		return existsSync(defaultPath) ? { localesPath: defaultPath } : null;
	} catch {
		return null;
	}
}

async function discoverPackageTranslations(
	workspaceRoot: string,
): Promise<Map<string, Map<string, Record<string, unknown>>>> {
	const packageTranslations = new Map<
		string,
		Map<string, Record<string, unknown>>
	>();
	const packagesDir = path.join(workspaceRoot, 'packages');

	if (!existsSync(packagesDir)) {
		return packageTranslations;
	}

	const packageDirs = await fs.readdir(packagesDir);

	for (const packageDir of packageDirs) {
		const packagePath = path.join(packagesDir, packageDir);
		const stat = await fs.stat(packagePath);
		if (!stat.isDirectory()) continue;

		const resolved = resolvePackageLocalesPath(packagePath);
		if (!resolved) continue;

		const translations = await loadPackageLocales(
			resolved.localesPath,
			resolved.namespaceFilter,
		);

		if (translations.size > 0) {
			packageTranslations.set(`@autoguru/${packageDir}`, translations);
		}
	}

	return packageTranslations;
}

async function loadLocaleDirectory(
	localePath: string,
	namespaceFilter?: string[],
): Promise<Record<string, unknown>> {
	const files = await fs.readdir(localePath);
	const translations: Record<string, unknown> = {};

	for (const file of files) {
		if (!file.endsWith('.json')) continue;

		const namespace = file.replace('.json', '');
		if (namespaceFilter && !namespaceFilter.includes(namespace)) continue;

		const filePath = path.join(localePath, file);
		const content = await fs.readFile(filePath, 'utf8');

		try {
			translations[namespace] = JSON.parse(content);
		} catch {
			console.error(`[${PLUGIN_NAME}] Failed to parse ${filePath}`);
		}
	}

	return translations;
}

async function loadPackageLocales(
	localesPath: string,
	namespaceFilter?: string[],
): Promise<Map<string, Record<string, unknown>>> {
	const localeMap = new Map<string, Record<string, unknown>>();
	const locales = await fs.readdir(localesPath);

	for (const locale of locales) {
		const localePath = path.join(localesPath, locale);
		const stat = await fs.stat(localePath);
		if (!stat.isDirectory()) continue;

		const translations = await loadLocaleDirectory(
			localePath,
			namespaceFilter,
		);
		if (Object.keys(translations).length > 0) {
			localeMap.set(locale, translations);
		}
	}

	return localeMap;
}

function mergePackageTranslations(
	locale: string,
	mfeTranslations: Record<string, unknown>,
	packageTranslations: Map<string, Map<string, Record<string, unknown>>>,
): Record<string, unknown> {
	const merged = { ...mfeTranslations };

	for (const [packageName, localeMap] of packageTranslations) {
		const packageLocaleData = localeMap.get(locale);
		if (!packageLocaleData) continue;

		for (const [namespace, translations] of Object.entries(
			packageLocaleData,
		)) {
			const effectiveNamespace = getEffectiveNamespace(
				namespace,
				packageName,
			);
			merged[effectiveNamespace] = translations;
		}
	}

	return merged;
}

function createManifestModule(
	manifest: LocaleManifest,
	discoveredPackages: string[],
): string {
	const packageInfo =
		discoveredPackages.length > 0
			? `// Includes translations from packages: ${discoveredPackages.join(', ')}\n`
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

function createMasterManifest(
	manifestModules: Map<string, ManifestModule>,
): string {
	const imports: string[] = [];
	const mappings: string[] = [];

	for (const [locale, module] of manifestModules.entries()) {
		imports.push(`import manifest_${locale} from './${module.name}';`);
		mappings.push(`  '${locale}': () => import('./${module.name}')`);
	}

	return `// Auto-generated master translation manifest
// Static imports for immediate availability
${imports.join('\n')}

// Dynamic imports for lazy loading
export const translationManifests = {
${mappings.join(',\n')}
};

// Static manifest access for SSR/preloading
export const staticManifests = {
${Array.from(manifestModules.keys())
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

// Initialise with detected locale
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
}

function createEmptyMasterContent(): string {
	return `// Auto-generated empty translation manifest for MFEs without translations
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
}

function addPackageLocalesToSet(
	allLocales: Set<string>,
	packageTranslations: Map<string, Map<string, Record<string, unknown>>>,
	excludeLocales: string[],
): void {
	for (const [, localeMap] of packageTranslations) {
		for (const locale of localeMap.keys()) {
			if (!excludeLocales.includes(locale)) {
				allLocales.add(locale);
			}
		}
	}
}

function emitEmptyManifest(ctx: PluginContext, hashLength: number): void {
	const emptyContent = createEmptyMasterContent();
	const emptyHash = generateContentHash(emptyContent, hashLength);
	const masterJsName = `i18n-master-manifest.${emptyHash}.js`;

	ctx.emitFile({
		type: 'asset',
		fileName: masterJsName,
		source: emptyContent,
	});
	ctx.emitFile({
		type: 'asset',
		fileName: 'i18n-master-manifest.json',
		source: JSON.stringify(
			{
				masterManifest: masterJsName,
				manifestModules: {},
				locales: [],
				generated: new Date().toISOString(),
				empty: true,
			},
			null,
			2,
		),
	});

	console.log(
		`[${PLUGIN_NAME}] No translations found — emitted empty manifest`,
	);
}

function emitLocaleTranslations(
	ctx: PluginContext,
	merged: Record<string, unknown>,
	locale: string,
	opts: { outputPath: string; hashLength: number },
): LocaleManifest {
	const manifest: LocaleManifest = {};

	for (const [namespace, translations] of Object.entries(merged)) {
		const content = JSON.stringify(translations);
		const hash = generateContentHash(content, opts.hashLength);
		const hashedFilename = `${namespace}.${hash}.json`;

		ctx.emitFile({
			type: 'asset',
			fileName: `${opts.outputPath}${locale}/${hashedFilename}`,
			source: content,
		});

		manifest[namespace] = {
			path: `/locales/${locale}/${hashedFilename}`,
			hash,
			size: content.length,
		};
	}

	return manifest;
}

function updateBuildManifest(
	bundle: Record<string, { type: string; source?: string | Uint8Array }>,
	metaInfo: Record<string, unknown>,
	discoveredPackages: string[],
	translationManifests: Map<string, LocaleManifest>,
): void {
	const entry = bundle['build-manifest.json'];
	if (!entry || entry.type !== 'asset' || !('source' in entry)) return;

	try {
		const buildManifest = JSON.parse(String(entry.source));

		buildManifest.i18n = {
			masterManifest: metaInfo.masterManifest,
			manifestModules: metaInfo.manifestModules,
			supportedLocales: metaInfo.locales,
			includedPackages: discoveredPackages,
			translationAssets: {} as Record<string, Record<string, string>>,
		};

		for (const [locale, localeManifest] of translationManifests.entries()) {
			buildManifest.i18n.translationAssets[locale] = {};
			for (const [namespace, info] of Object.entries(localeManifest)) {
				buildManifest.i18n.translationAssets[locale][namespace] =
					info.path;
			}
		}

		(entry as { source: string }).source = JSON.stringify(
			buildManifest,
			null,
			2,
		);
	} catch (error) {
		console.error(
			`[${PLUGIN_NAME}] Failed to update build manifest:`,
			error,
		);
	}
}

export function translationHashingPlugin(
	options: TranslationHashingOptions,
): VitePlugin {
	const opts = {
		publicPath: options.publicPath || '/locales/',
		outputPath: options.outputPath || 'locales/',
		localesDir: options.localesDir || 'public/locales',
		hashLength: options.hashLength || 8,
		excludeLocales: options.excludeLocales || [],
		autoIncludePackageTranslations:
			options.autoIncludePackageTranslations !== false,
		appDir: options.appDir,
		workspaceRoot: options.workspaceRoot,
	};

	return {
		name: PLUGIN_NAME,
		apply: 'build',

		async generateBundle(this: PluginContext, _outputOptions, _bundle) {
			const localesPath = path.join(opts.appDir, opts.localesDir);
			const allLocales = await collectMfeLocales(
				localesPath,
				opts.excludeLocales,
			);

			let packageTranslations = new Map<
				string,
				Map<string, Record<string, unknown>>
			>();

			if (opts.autoIncludePackageTranslations) {
				packageTranslations = await discoverPackageTranslations(
					opts.workspaceRoot,
				);
				addPackageLocalesToSet(
					allLocales,
					packageTranslations,
					opts.excludeLocales,
				);
			}

			const discoveredPackages = Array.from(packageTranslations.keys());

			if (allLocales.size === 0) {
				emitEmptyManifest(this, opts.hashLength);
				return;
			}

			// Process each locale
			const translationManifests = new Map<string, LocaleManifest>();
			for (const locale of allLocales) {
				const mfeTranslations = await loadMfeTranslations(
					localesPath,
					locale,
				);
				const merged = mergePackageTranslations(
					locale,
					mfeTranslations,
					packageTranslations,
				);
				translationManifests.set(
					locale,
					emitLocaleTranslations(this, merged, locale, opts),
				);
			}

			// Generate per-locale manifest modules
			const manifestModules = new Map<string, ManifestModule>();
			for (const [locale, manifest] of translationManifests.entries()) {
				const moduleContent = createManifestModule(
					manifest,
					discoveredPackages,
				);
				const moduleHash = generateContentHash(
					moduleContent,
					opts.hashLength,
				);
				const moduleName = `i18n-manifest-${locale}.${moduleHash}.js`;

				this.emitFile({
					type: 'asset',
					fileName: moduleName,
					source: moduleContent,
				});
				manifestModules.set(locale, {
					name: moduleName,
					hash: moduleHash,
				});
			}

			// Generate master manifest
			const masterContent = createMasterManifest(manifestModules);
			const masterHash = generateContentHash(
				masterContent,
				opts.hashLength,
			);
			const masterJsName = `i18n-master-manifest.${masterHash}.js`;

			this.emitFile({
				type: 'asset',
				fileName: masterJsName,
				source: masterContent,
			});

			const metaInfo = {
				masterManifest: masterJsName,
				manifestModules: Object.fromEntries(manifestModules),
				locales: Array.from(translationManifests.keys()),
				generated: new Date().toISOString(),
			};

			this.emitFile({
				type: 'asset',
				fileName: 'i18n-master-manifest.json',
				source: JSON.stringify(metaInfo, null, 2),
			});

			updateBuildManifest(
				_bundle as any,
				metaInfo,
				discoveredPackages,
				translationManifests,
			);

			const totalNamespaces = Array.from(
				translationManifests.values(),
			).reduce((sum, manifest) => sum + Object.keys(manifest).length, 0);
			console.log(
				`[${PLUGIN_NAME}] Emitted ${totalNamespaces} hashed translation files across ${allLocales.size} locales` +
					(discoveredPackages.length > 0
						? ` (${discoveredPackages.length} packages included)`
						: ''),
			);
		},
	};
}
