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

function collectEntryCssFiles(
	bundle: Record<
		string,
		{
			type: string;
			isEntry?: boolean;
			viteMetadata?: { importedCss?: Set<string> };
		}
	>,
): Set<string> {
	const entryCssFiles = new Set<string>();
	for (const chunk of Object.values(bundle)) {
		if (chunk.type !== 'chunk' || !chunk.isEntry) continue;
		const referencedCss = chunk.viteMetadata?.importedCss;
		if (!referencedCss) continue;
		for (const cssFile of referencedCss) {
			entryCssFiles.add(cssFile);
		}
	}
	return entryCssFiles;
}

function classifyChunk(
	fileName: string,
	chunk: { type: string; isEntry?: boolean },
	result: Manifest,
	opts: Required<GuruBuildManifestOptions>,
): void {
	const jsPath = `${opts.publicPath}${fileName}`;
	if (chunk.isEntry) {
		result.assets.js.push(jsPath);
		if (!result.hash) {
			result.hash = extractHashFromFilename(fileName);
		}
	} else if (opts.includeChunks) {
		result.chunks!.js.push(jsPath);
	}
}

function classifyCssAsset(
	fileName: string,
	entryCssFiles: Set<string>,
	result: Manifest,
	opts: Required<GuruBuildManifestOptions>,
): void {
	const cssPath = `${opts.publicPath}${fileName}`;
	if (entryCssFiles.has(fileName)) {
		result.assets.css.push(cssPath);
	} else if (opts.includeChunks) {
		result.chunks!.css.push(cssPath);
	}
}

function mergeI18nMetadata(
	result: Manifest,
	bundle: Record<string, { type: string; source?: string | Uint8Array }>,
): void {
	const i18nMetaEntry = bundle['i18n-master-manifest.json'];
	if (
		!i18nMetaEntry ||
		i18nMetaEntry.type !== 'asset' ||
		!i18nMetaEntry.source
	) {
		return;
	}
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

			const entryCssFiles = collectEntryCssFiles(bundle as any);

			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (fileName.endsWith('.map')) continue;

				if (chunk.type === 'chunk') {
					classifyChunk(fileName, chunk, result, opts);
				} else if (
					chunk.type === 'asset' &&
					fileName.endsWith('.css')
				) {
					classifyCssAsset(fileName, entryCssFiles, result, opts);
				}
			}

			if (!opts.includeChunks) {
				result.chunks = undefined;
			}

			mergeI18nMetadata(result, bundle as any);

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
