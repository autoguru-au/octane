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

// Inline Vite types so tsc compiles without a vite dependency.
// At runtime, the actual Vite types are structurally compatible.

interface RollupInputOptions {
	input?: string | string[] | Record<string, string>;
	external?: string[];
	plugins?: unknown[];
}

interface RollupOutputOptions {
	format?: string;
	entryFileNames?: string;
	chunkFileNames?: string;
	assetFileNames?: string;
	paths?: Record<string, string>;
}

interface InlineConfig {
	resolve?: {
		alias?: Record<string, string>;
		extensions?: string[];
	};
	define?: Record<string, string>;
	build?: {
		target?: string;
		outDir?: string;
		emptyOutDir?: boolean;
		sourcemap?: boolean;
		minify?: string;
		rollupOptions?: RollupInputOptions & {
			output?: RollupOutputOptions;
		};
	};
	esbuild?: {
		target?: string;
		legalComments?: string;
		pure?: string[];
		jsx?: string;
		jsxImportSource?: string;
		jsxDev?: boolean;
	};
	plugins?: unknown[];
}

const { branch = 'null', commit = 'null' } = envCI();

const gduEntryPath = join(GDU_ROOT, 'entry');

/**
 * Load environment variables from .gdu_config/ and .gdu_app_config/ directories,
 * replicating dotenv-webpack behaviour.
 */
function loadEnvDefines(buildEnv: string): Record<string, string> {
	const defines: Record<string, string> = {};
	const appEnv = process.env.APP_ENV || buildEnv;

	for (const configsDir of getConfigsDirs()) {
		const defaultsPath = path.resolve(configsDir, '.env.defaults');
		const envPath = path.resolve(configsDir, `.env.${appEnv}`);

		for (const filePath of [defaultsPath, envPath]) {
			if (!fs.existsSync(filePath)) continue;

			const content = fs.readFileSync(filePath, 'utf-8');
			for (const line of content.split('\n')) {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith('#')) continue;

				const eqIndex = trimmed.indexOf('=');
				if (eqIndex === -1) continue;

				const key = trimmed.slice(0, eqIndex).trim();
				const value = trimmed.slice(eqIndex + 1).trim();
				defines[`process.env.${key}`] = JSON.stringify(value);
			}
		}
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
			target: 'es2020',
			outDir: guruConfig.outputPath,
			emptyOutDir: true,
			sourcemap: true,
			minify: 'esbuild',
			rollupOptions: {
				input: { main: join(gduEntryPath, 'spa', 'client.js') },
				external: externalKeys.length > 0 ? externalKeys : undefined,
				output: {
					format: 'es',
					entryFileNames: '[name]-[hash:8].js',
					chunkFileNames: 'chunks/[name]-[hash:8].js',
					assetFileNames: '[name]-[hash:8][extname]',
					...(externalKeys.length > 0
						? { paths: externalsMap }
						: {}),
				},
			},
		},

		esbuild: {
			target: 'es2020',
			jsx: 'automatic',
			jsxImportSource: 'react',
			jsxDev: false,
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
			rollupOptions: {
				...base.build?.rollupOptions,
				output: {
					...base.build?.rollupOptions?.output,
					// Rollup uses output.paths for external module URL rewriting;
					// Vite's `base` config handles asset publicPath prefixing.
				},
			},
		},
		// Vite uses `base` to prefix asset URLs in the output HTML/manifest.
		// This mirrors webpack's output.publicPath.
		...(publicPath !== '/' ? { base: publicPath } : {}),
	};
};
