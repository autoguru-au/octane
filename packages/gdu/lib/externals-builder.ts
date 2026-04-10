import { existsSync, renameSync, rmSync } from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';

import { cyan } from 'kleur';

import {
	getDataDogVersion,
	getReactVersion,
} from '../config/shared/externals';

import { PROJECT_ROOT } from './roots';

interface ExternalDef {
	/** npm package name or sub-path (e.g. 'react-dom/client') */
	entryPoint: string;
	/** Output filename without path (e.g. 'react-dom-client@19.mjs') */
	outFile: string;
	/**
	 * Cross-dependencies to mark as external and rewrite to relative URLs
	 * (e.g. ./react@19.mjs). Keys are bare specifiers (or sub-path specifiers),
	 * values are the output filenames they should resolve to.
	 */
	externalRewrites: Record<string, string>;
}

/**
 * Bump this when the esbuild config or rewrite logic changes,
 * so stale cached bundles are invalidated.
 */
const CACHE_SCHEMA_VERSION = 2;

export function getExternalDefs(): ExternalDef[] {
	const reactVersion = getReactVersion();
	const datadogVersion = getDataDogVersion();

	const reactFile = `react@${reactVersion}.mjs`;
	const reactDomFile = `react-dom@${reactVersion}.mjs`;
	const jsxRuntimeFile = `jsx-runtime@${reactVersion}.mjs`;
	const browserRumFile = `browser-rum@${datadogVersion}.mjs`;

	// Shared React sub-path rewrites — prevents deep imports from bundling
	// a second React copy (dual-instance). Covers known sub-paths that
	// dependent packages may import internally.
	const reactRewrites: Record<string, string> = {
		react: reactFile,
		'react/jsx-runtime': jsxRuntimeFile,
		'react/jsx-dev-runtime': jsxRuntimeFile,
	};

	return [
		{
			entryPoint: 'react',
			outFile: reactFile,
			externalRewrites: {},
		},
		{
			entryPoint: 'react-dom',
			outFile: reactDomFile,
			externalRewrites: reactRewrites,
		},
		{
			entryPoint: 'react-dom/client',
			outFile: `react-dom-client@${reactVersion}.mjs`,
			externalRewrites: {
				...reactRewrites,
				'react-dom': reactDomFile,
			},
		},
		{
			entryPoint: 'react/jsx-runtime',
			outFile: jsxRuntimeFile,
			externalRewrites: {
				react: reactFile,
			},
		},
		{
			entryPoint: '@datadog/browser-rum',
			outFile: browserRumFile,
			externalRewrites: {},
		},
		{
			entryPoint: '@datadog/browser-rum-react',
			outFile: `browser-rum-react@${datadogVersion}.mjs`,
			externalRewrites: {
				...reactRewrites,
				'@datadog/browser-rum': browserRumFile,
			},
		},
		{
			entryPoint: '@datadog/browser-logs',
			outFile: `browser-logs@${datadogVersion}.mjs`,
			externalRewrites: {},
		},
	];
}

function getEsbuildVersion(): string {
	try {
		return require('esbuild/package.json').version;
	} catch {
		return 'unknown';
	}
}

function getCacheDir(): string {
	const reactVersion = getReactVersion();
	const datadogVersion = getDataDogVersion();
	const esbuildVersion = getEsbuildVersion();
	const hash = `v${CACHE_SCHEMA_VERSION}_es${esbuildVersion}_react${reactVersion}_dd${datadogVersion}`;
	return join(PROJECT_ROOT, 'node_modules', '.cache', 'gdu-externals', hash);
}

/**
 * Build all externals with esbuild if not already cached.
 * Returns the directory containing the built .mjs files.
 */
export async function buildExternalsIfNeeded(): Promise<string> {
	const cacheDir = getCacheDir();
	const defs = getExternalDefs();

	// Check if all files exist in cache
	const allCached = defs.every((def) =>
		existsSync(join(cacheDir, def.outFile)),
	);

	if (allCached) {
		return cacheDir;
	}

	console.log(cyan('Building shared externals...'));

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const esbuild = require('esbuild');

	// Build to a temp directory, then atomically rename on success.
	// This prevents a partial cache from being left behind if a build fails.
	const tmpDir = `${cacheDir}_tmp_${Date.now()}`;
	await mkdir(tmpDir, { recursive: true });

	try {
		await Promise.all(
			defs.map((def) => {
				const rewriteEntries = Object.entries(def.externalRewrites);

				return esbuild.build({
					entryPoints: [def.entryPoint],
					outfile: join(tmpDir, def.outFile),
					bundle: true,
					format: 'esm',
					platform: 'browser',
					target: 'es2022',
					minify: true,
					sourcemap: true,
					// Resolve modules from the MFE project's node_modules
					nodePaths: [join(PROJECT_ROOT, 'node_modules')],
					plugins:
						rewriteEntries.length > 0
							? [
									{
										name: 'rewrite-cross-deps',
										setup(build: any) {
											for (const [
												bare,
												outFile,
											] of rewriteEntries) {
												const escaped = bare.replace(
													/[.*+?^${}()|[\]\\]/g,
													'\\$&',
												);
												build.onResolve(
													{
														filter: new RegExp(
															`^${escaped}$`,
														),
													},
													() => ({
														path: `./${outFile}`,
														external: true,
													}),
												);
											}
										},
									},
								]
							: [],
				});
			}),
		);

		// Atomic swap — remove stale cache (if any), rename tmp → cache
		if (existsSync(cacheDir)) {
			rmSync(cacheDir, { recursive: true });
		}
		renameSync(tmpDir, cacheDir);
	} catch (err) {
		// Clean up temp directory on failure
		rmSync(tmpDir, { recursive: true, force: true });
		throw err;
	}

	return cacheDir;
}

/**
 * Copy the built external bundles into the MFE output directory
 * under _shared/externals/.
 */
export async function copyExternalsToOutput(
	outputPath: string,
): Promise<void> {
	const cacheDir = await buildExternalsIfNeeded();
	const defs = getExternalDefs();
	const destDir = join(outputPath, '_shared', 'externals');

	await mkdir(destDir, { recursive: true });

	await Promise.all(
		defs.map(async (def) => {
			const src = join(cacheDir, def.outFile);
			const dest = join(destDir, def.outFile);
			await copyFile(src, dest);

			// Copy sourcemap too if it exists
			const srcMap = `${src}.map`;
			if (existsSync(srcMap)) {
				await copyFile(srcMap, `${dest}.map`);
			}
		}),
	);
}
