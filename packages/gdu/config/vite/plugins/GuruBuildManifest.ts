import fs from 'fs';
import { join, resolve } from 'path';

// Inline Rollup/Vite types so tsc compiles without a vite dependency.
// At runtime, the actual Vite/Rollup types are structurally compatible.

interface RollupOutputChunk {
	type: 'chunk';
	fileName: string;
	isEntry: boolean;
	isDynamicEntry: boolean;
	viteMetadata?: { importedCss?: Set<string> };
}

interface RollupOutputAsset {
	type: 'asset';
	fileName: string;
}

type RollupOutputItem = RollupOutputChunk | RollupOutputAsset;

interface VitePlugin {
	name: string;
	apply?: 'build' | 'serve';
	generateBundle?: (
		options: unknown,
		bundle: Record<string, RollupOutputItem>,
	) => void;
}

interface Asset {
	js: string[];
	css: string[];
}

export interface Manifest {
	hash: string;
	mountDOMId?: string;
	mountDOMClass?: string;
	frameless?: boolean;
	assets: Asset;
	chunks?: Asset;
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
	return match?.[1] ?? '';
}

function ensureDirectoryExists(dir: string): void {
	const isAbsolutePathWithProjectRoot = dir.includes(process.cwd());
	const isPathWithinProjectRoot = !dir.startsWith('/');

	if (isAbsolutePathWithProjectRoot || isPathWithinProjectRoot) {
		let pathStep = process.cwd();
		const normalised = dir.replace(/^\.\//, '').replace(process.cwd(), '');

		for (const folder of normalised.split('/')) {
			pathStep = join(pathStep, folder);
			try {
				fs.mkdirSync(pathStep);
			} catch {
				// Directory already exists, continue
			}
		}
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

		generateBundle(_outputOptions, bundle) {
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
