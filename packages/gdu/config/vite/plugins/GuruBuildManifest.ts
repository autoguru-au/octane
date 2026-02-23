import fs from 'fs';
import { resolve } from 'path';

import type { VitePlugin } from '../types';

interface Asset {
	js: string[];
	css: string[];
}

interface I18nManifestModule {
	name: string;
	hash: string;
}

interface I18nMetadata {
	masterManifest: string;
	manifestModules: Record<string, I18nManifestModule>;
	supportedLocales: string[];
}

export interface Manifest {
	hash: string;
	mountDOMId?: string;
	mountDOMClass?: string;
	frameless?: boolean;
	assets: Asset;
	chunks?: Asset;
	i18n?: I18nMetadata;
}

interface GuruBuildManifestOptions {
	mountDOMId?: string;
	mountDOMClass?: string;
	frameless?: boolean;
	outputDir?: string;
	includeChunks?: boolean;
	publicPath?: string;
}

const defaultOptions: Required<GuruBuildManifestOptions> = {
	mountDOMId: '',
	mountDOMClass: '',
	frameless: false,
	outputDir: process.cwd(),
	includeChunks: true,
	publicPath: '',
};

function extractHashFromFilename(filename: string): string {
	const match = /[.-]([a-zA-Z\d_-]{8,})\.js$/.exec(filename);
	if (!match) {
		console.warn(
			`Warning: Could not extract hash from entry filename: ${filename}`,
		);
	}
	return match?.[1] ?? '';
}

function ensureDirectoryExists(dir: string): void {
	fs.mkdirSync(dir, { recursive: true });
}

export function guruBuildManifest(
	options?: GuruBuildManifestOptions,
): VitePlugin {
	const opts = {
		...defaultOptions,
		...Object.fromEntries(
			Object.entries(options || {}).filter(([, v]) => v !== undefined),
		),
	};

	return {
		name: 'guru-build-manifest',
		apply: 'build',

		writeBundle(_outputOptions, bundle) {
			const result: Manifest = {
				hash: '',
				mountDOMId: opts.mountDOMId,
				mountDOMClass: opts.mountDOMClass,
				frameless: opts.frameless,
				assets: { js: [], css: [] },
				chunks: { js: [], css: [] },
			};

			const entryCssFiles = new Set<string>();

			// First pass: identify CSS files referenced by entry chunks
			for (const chunk of Object.values(bundle)) {
				if (chunk.type === 'chunk') {
					const referencedCss = chunk.viteMetadata?.importedCss;
					if (referencedCss) {
						for (const cssFile of referencedCss) {
							if (chunk.isEntry) {
								entryCssFiles.add(cssFile);
							}
						}
					}
				}
			}

			// Second pass: classify all bundle items
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (fileName.endsWith('.map')) continue;

				if (chunk.type === 'chunk') {
					const jsPath = `${opts.publicPath}${fileName}`;

					if (chunk.isEntry) {
						result.assets.js.push(jsPath);

						if (!result.hash) {
							result.hash = extractHashFromFilename(fileName);
						}
					} else if (opts.includeChunks) {
						result.chunks!.js.push(jsPath);
					}
				} else if (chunk.type === 'asset' && fileName.endsWith('.css')) {
					const cssPath = `${opts.publicPath}${fileName}`;

					if (entryCssFiles.has(fileName)) {
						result.assets.css.push(cssPath);
					} else if (opts.includeChunks) {
						result.chunks!.css.push(cssPath);
					}
				}
			}

			if (!opts.includeChunks) {
				result.chunks = undefined;
			}

			// Merge i18n metadata from TranslationHashingPlugin if present
			const i18nMetaEntry = bundle['i18n-master-manifest.json'];
			if (
				i18nMetaEntry &&
				i18nMetaEntry.type === 'asset' &&
				i18nMetaEntry.source
			) {
				try {
					const i18nMeta = JSON.parse(String(i18nMetaEntry.source));
					if (!i18nMeta.empty) {
						result.i18n = {
							masterManifest: i18nMeta.masterManifest,
							manifestModules: i18nMeta.manifestModules,
							supportedLocales: i18nMeta.locales,
						};
					}
				} catch (error) {
					console.warn(
						'[guru-build-manifest] Failed to parse i18n-master-manifest.json:',
						error,
					);
				}
			}

			ensureDirectoryExists(opts.outputDir);
			const file = resolve(opts.outputDir, 'build-manifest.json');
			const blob = JSON.stringify(result);

			try {
				fs.writeFileSync(file, blob, { flag: 'w' });
				console.log(`File successfully created - ${file}`);
			} catch (error) {
				console.error(error);
			}
		},
	};
}
