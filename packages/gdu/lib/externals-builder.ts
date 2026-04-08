import { existsSync } from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';

import { PROJECT_ROOT } from './roots';

/**
 * Reads the actual installed version of a package from node_modules,
 * rather than the semver range from package.json. This ensures the
 * version in the external URL matches the bundled code exactly.
 */
function getInstalledVersion(packageName: string): string | null {
	try {
		const pkgPath = join(
			PROJECT_ROOT,
			'node_modules',
			packageName,
			'package.json',
		);
		const pkg = JSON.parse(
			require('fs').readFileSync(pkgPath, 'utf8'),
		);
		return pkg.version || null;
	} catch {
		return null;
	}
}

export function getExternalsVersions(): {
	reactVersion: string;
	datadogVersion: string;
} {
	const reactVersion = getInstalledVersion('react') || '19';
	const datadogVersion =
		getInstalledVersion('@datadog/browser-rum') || '6.23.0';
	return { reactVersion, datadogVersion };
}

const EXTERNALS_BASE = '/_shared/externals';

interface ExternalDef {
	/** npm package name or sub-path (e.g. 'react-dom/client') */
	entryPoint: string;
	/** Output filename without path (e.g. 'react-dom-client@19.mjs') */
	outFile: string;
	/**
	 * Cross-dependencies to mark as external and rewrite to self-hosted
	 * root-relative URLs. Keys are bare specifiers, values are the output
	 * filenames they should resolve to.
	 */
	externalRewrites: Record<string, string>;
}

export function getExternalDefs(): ExternalDef[] {
	const { reactVersion, datadogVersion } = getExternalsVersions();

	const reactFile = `react@${reactVersion}.mjs`;
	const reactDomFile = `react-dom@${reactVersion}.mjs`;
	const browserRumFile = `browser-rum@${datadogVersion}.mjs`;

	return [
		{
			entryPoint: 'react',
			outFile: reactFile,
			externalRewrites: {},
		},
		{
			entryPoint: 'react-dom',
			outFile: reactDomFile,
			externalRewrites: {
				react: reactFile,
			},
		},
		{
			entryPoint: 'react-dom/client',
			outFile: `react-dom-client@${reactVersion}.mjs`,
			externalRewrites: {
				react: reactFile,
				'react-dom': reactDomFile,
			},
		},
		{
			entryPoint: 'react/jsx-runtime',
			outFile: `jsx-runtime@${reactVersion}.mjs`,
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
				react: reactFile,
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

function getCacheDir(): string {
	const { reactVersion, datadogVersion } = getExternalsVersions();
	const hash = `react${reactVersion}_dd${datadogVersion}`;
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

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const esbuild = require('esbuild');

	await mkdir(cacheDir, { recursive: true });

	for (const def of defs) {
		const rewriteEntries = Object.entries(def.externalRewrites);

		await esbuild.build({
			entryPoints: [def.entryPoint],
			outfile: join(cacheDir, def.outFile),
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
								setup(build) {
									for (const [
										bare,
										outFile,
									] of rewriteEntries) {
										// Match the bare specifier exactly and any sub-paths
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
												path: `${EXTERNALS_BASE}/${outFile}`,
												external: true,
											}),
										);
									}
								},
							},
						]
					: [],
		});
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

	for (const def of defs) {
		const src = join(cacheDir, def.outFile);
		const dest = join(destDir, def.outFile);
		await copyFile(src, dest);

		// Copy sourcemap too if it exists
		const srcMap = `${src}.map`;
		if (existsSync(srcMap)) {
			await copyFile(srcMap, `${dest}.map`);
		}
	}
}
