import fs from 'fs';
import path, { join, resolve } from 'path';

import envCI from 'env-ci';

import {
	getGuruConfig,
	getProjectFolderName,
	getProjectName,
} from '../../lib/config';
import { GDU_ROOT, PROJECT_ROOT } from '../../lib/roots';
import { getBuildEnvs, getConfigsDirs } from '../../utils/configs';
import { getExternals, getPublicPath } from '../shared/externals';

import { guruBuildManifest } from './plugins/GuruBuildManifest';
import { rolldownExternalShim } from './plugins/rolldownExternalShim';
import type { InlineConfig } from './types';

const { branch = 'null', commit = 'null' } = envCI();

const gduEntryPath = join(GDU_ROOT, 'entry');

function stripQuotes(value: string): string {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1);
	}
	return value;
}

function parseEnvFile(filePath: string): Record<string, string> {
	const defines: Record<string, string> = {};
	if (!fs.existsSync(filePath)) return defines;

	const content = fs.readFileSync(filePath, 'utf8');
	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const eqIndex = trimmed.indexOf('=');
		if (eqIndex === -1) continue;

		const key = trimmed.slice(0, eqIndex).trim();
		const value = stripQuotes(trimmed.slice(eqIndex + 1).trim());
		defines[`process.env.${key}`] = JSON.stringify(value);
	}

	return defines;
}

/**
 * Load environment variables from .gdu_config/ and .gdu_app_config/ directories,
 * replicating dotenv-webpack behaviour.
 */
function loadEnvDefines(buildEnv: string): Record<string, string> {
	const defines: Record<string, string> = {};
	const appEnv = process.env.APP_ENV || buildEnv;

	for (const configsDir of getConfigsDirs()) {
		Object.assign(
			defines,
			parseEnvFile(path.resolve(configsDir, '.env.defaults')),
		);
		Object.assign(
			defines,
			parseEnvFile(path.resolve(configsDir, `.env.${appEnv}`)),
		);
	}

	return defines;
}

export const baseViteOptions = ({
	buildEnv,
	isMultiEnv,
	standalone,
}: {
	buildEnv: string;
	isMultiEnv: boolean;
	standalone?: boolean;
}): InlineConfig => {
	const guruConfig = getGuruConfig();
	const externalsMap = getExternals(standalone);
	const externalKeys = Object.keys(externalsMap);

	const envDefines = loadEnvDefines(buildEnv);

	return {
		resolve: {
			alias: {
				'~': PROJECT_ROOT,
				__GDU_CONSUMER_CLIENT__: join(PROJECT_ROOT, 'src/client.tsx'),
			},
			extensions: ['.tsx', '.ts', '.mjs', '.jsx', '.js', '.json'],
		},

		define: {
			'process.__browser__': JSON.stringify(true),
			'process.env.NODE_ENV': JSON.stringify('production'),
			'process.env.NODE_DEBUG': JSON.stringify(false),
			'process.env.browser': JSON.stringify(true),
			// Omitted: process.env.nextTick + global.Writable — not used by pilot app (Node polyfills for legacy deps)
			__DEV__: JSON.stringify(false),
			__MOUNT_DOM_ID__: JSON.stringify(guruConfig.mountDOMId),
			__MOUNT_DOM_CLASS__: JSON.stringify(guruConfig.mountDOMClass),
			__DEBUG__: JSON.stringify(false),
			__GDU_APP_NAME__: JSON.stringify(getProjectName()),
			__GDU_BUILD_INFO__: JSON.stringify({ commit, branch }),
			...envDefines,
		},

		build: {
			target: 'es2022',
			outDir: guruConfig.outputPath,
			emptyOutDir: true,
			sourcemap: 'hidden',
			minify: true,
			reportCompressedSize: false,
			chunkSizeWarningLimit: 1000,
			rolldownOptions: {
				input: { main: join(gduEntryPath, 'spa', 'client.js') },
				external: externalKeys.length > 0 ? externalKeys : undefined,
				output: {
					format: 'es',
					entryFileNames: '[name]-[hash:8].js',
					chunkFileNames: 'chunks/[name]-[hash:8].js',
					assetFileNames: '[name]-[hash:8][extname]',
					...(externalKeys.length > 0 ? { paths: externalsMap } : {}),
					manualChunks(id) {
						if (id.includes('packages/global-configs')) {
							return 'mfe-configs';
						}
						return null;
					},
				},
			},
		},

		oxc: {
			target: 'es2022',
			jsx: {
				runtime: 'automatic',
				importSource: 'react',
				development: false,
			},
		},

		// esbuild is deprecated in Vite 8 (OXC handles transforms via `oxc` above)
		// but the renderChunk pass still applies pure + legalComments settings.
		esbuild: {
			legalComments: 'none',
			pure: [
				'console.log',
				'console.info',
				'console.debug',
				'console.warn',
			],
		},

		plugins: [
			// Runtime plugins (vanillaExtractPlugin, tsconfigPaths, relayPlugin) are
			// injected by buildSPA-vite.ts and runSPA-vite.ts to avoid tsc dependency on vite.
			rolldownExternalShim(externalsMap),
			guruBuildManifest({
				mountDOMId: guruConfig.mountDOMId,
				mountDOMClass: guruConfig.mountDOMClass,
				frameless: guruConfig.frameless,
				outputDir:
					!isMultiEnv && buildEnv === 'prod'
						? resolve(PROJECT_ROOT, 'dist')
						: resolve(PROJECT_ROOT, 'dist', buildEnv),
				includeChunks: true,
			}),
		],
	};
};

type BuildEnv = ReturnType<typeof getBuildEnvs>[number];

export const makeViteConfig = (
	buildEnv: BuildEnv,
	isMultiEnv: boolean,
	standalone?: boolean,
): InlineConfig => {
	const { outputPath, isTenanted } = getGuruConfig();

	const outDir = `${outputPath}/${!isMultiEnv && buildEnv === 'prod' ? '' : buildEnv}`;
	const publicPath = getPublicPath({
		buildEnv,
		isDev: false,
		projectFolderName: getProjectFolderName(),
		isTenanted,
	});

	const base = baseViteOptions({ buildEnv, isMultiEnv, standalone });

	return {
		...base,
		build: {
			...base.build,
			outDir,
			rolldownOptions: {
				...base.build?.rolldownOptions,
				output: {
					...base.build?.rolldownOptions?.output,
					// Rolldown uses output.paths for external module URL rewriting;
					// Vite's `base` config handles asset publicPath prefixing.
				},
			},
		},
		// Vite uses `base` to prefix asset URLs in the output HTML/manifest.
		// This mirrors webpack's output.publicPath.
		...(publicPath === '/' ? {} : { base: publicPath }),
	};
};
