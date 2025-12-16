import path, { resolve } from 'path';

import Dotenv from 'dotenv-webpack';
import { DefinePlugin } from 'webpack';

import { getGuruConfig, getProjectName } from '../lib/config';
import { isProductionBuild } from '../lib/misc';
import { PROJECT_ROOT } from '../lib/roots';
import { getConfigsDirs } from '../utils/configs';

type CSPKey =
	| 'frame-ancestors'
	| 'frame-src'
	| 'style-src'
	| 'img-src'
	| 'font-src'
	| 'worker-src'
	| 'child-src'
	| 'object-src'
	| 'connect-src'
	| 'script-src-elem'
	| 'script-src';

interface CSPItem {
	key: CSPKey;
	values: string[];
}

export const CSPDefaultsList: CSPItem[] = [
	{
		key: 'frame-ancestors',
		values: ['https://*.autoguru.com.au', 'https://*.autoguru.com'],
	},
	{
		key: 'frame-src',
		values: [
			"'self'",
			'https://*.autoguru.com.au',
			'https://*.autoguru.com',
			'https://www.youtube.com',
			'https://www.google.com',
			'https://*.doubleclick.net',
			'https://*.googleadservices.com',
		],
	},
	{
		key: 'style-src',
		values: [
			"'self'",
			"'unsafe-inline'",
			'https://*.autoguru.com.au',
			'https://*.autoguru.com',
			'https://*.googleapis.com',
			'https://*.googleadservices.com',
		],
	},
	{
		key: 'img-src',
		values: [
			"'self'",
			'data:',
			'https://*.autoguru.com.au',
			'https://*.autoguru.com',
			'https://*.autoguru.au',
			'https://*.googletagmanager.com',
			'https://*.googleapis.com',
			'https://*.google-analytics.com',
			'https://*.heapanalytics.com/',
			'https://heapanalytics.com/',
			'https://*.tvsquared.com',
			'https://*.google.com',
			'https://*.google.com.au',
			'https://*.googleadservices.com',
			'https://*.gstatic.com',
			'https://*.quantserve.com',
		],
	},
	{
		key: 'font-src',
		values: [
			'https://*.autoguru.com.au',
			'https://*.autoguru.com',
			'https://*.googleapis.com',
			'https://*.gstatic.com',
		],
	},
	{
		key: 'worker-src',
		values: ["'self'", 'blob:'],
	},
	{
		key: 'child-src',
		values: ["'self'", 'blob:'],
	},
	{
		key: 'object-src',
		values: ["'none'"],
	},
	{
		key: 'connect-src',
		values: [
			"'self'",
			'*.autoguru.com.au',
			'*.autoguru.com',
			'https://*.googletagmanager.com',
			'https://*.google-analytics.com',
			'https://*.google.com',
			'https://*.google.com.au',
			'https://*.googleapis.com',
			'https://*.gstatic.com',
			'https://*.googleadservices.com',
			'https://*.heapanalytics.com',
			'https://*.doubleclick.net',
			'https://*.mapbox.com',
			'https://*.quantserve.com',
			'https://*.wisepops.com',
			'https://*.tvsquared.com',
			'https://*.quantcount.com',
			'https://*.nr-data.net',
		],
	},
	{
		key: 'script-src-elem',
		values: [
			"'self'",
			"'unsafe-inline'",
			'https://*.autoguru.com.au',
			'https://*.autoguru.com',
			'https://*.google-analytics.com',
			'https://*.googletagmanager.com',
			'https://*.googleapis.com',
			'https://*.gstatic.com',
			'https://*.google.com',
			'https://*.google.com.au',
			'https://*.gstatic.com',
			'https://*.googleadservices.com',
			'https://*.heapanalytics.com',
			'https://*.doubleclick.net',
			'https://*.mapbox.com',
			'https://*.quantserve.com',
			'https://*.wisepops.com',
			'https://*.tvsquared.com',
			'https://*.quantcount.com',
		],
	},
	{
		key: 'script-src',
		values: [
			"'self'",
			"'unsafe-eval'",
			'https://*.autoguru.com.au',
			'https://*.autoguru.com',
			'https://*.googleadservices.com',
			'https://*.googleapis.com',
			'https://*.googletagmanager.com',
			'https://*.google.com.au',
			'https://*.gstatic.com',
			'https://*.heapanalytics.com',
			'https://*.quantserve.com',
			'https://*.wisepops.com',
			'https://*.tvsquared.com',
			'https://*.quantcount.com',
		],
	},
];

export const generateCSP = (cspList: CSPItem[]): string =>
	cspList.reduce(
		(policies, csp, currentIndex) =>
			// eslint-disable-next-line unicorn/no-negated-condition
			`${policies}${currentIndex !== 0 ? '; ' : ''}${
				csp.key
			} ${csp.values.join(' ')}`,
		'',
	);

export const defaultSecurityHeaders = [
	{
		key: 'X-DNS-Prefetch-Control',
		value: 'on',
	},
	{
		key: 'X-XSS-Protection',
		value: '1; mode=block',
	},
	{
		key: 'X-Frame-Options',
		value: 'SAMEORIGIN https://*.autoguru.com.au',
	},
	{
		key: 'Strict-Transport-Security',
		value: 'max-age=63072000; includeSubDomains; preload',
	},
	{
		key: 'X-Content-Type-Options',
		value: 'nosniff',
	},
	{
		key: 'X-Frame-Options',
		value: 'SAMEORIGIN',
	},
	{
		key: 'Referrer-Policy',
		value: 'strict-origin-when-cross-origin',
	},
];

const productionEnvs = new Set(['prod', 'dockerprod', 'preprod', 'shared']);

export const createNextJSConfig = (
	buildEnv,
	transpilePackages = [] as string[],
	isDebug = false,
) => {
	const isDev = !isProductionBuild();
	const env = process.env.APP_ENV || (isDev ? 'dev' : buildEnv);
	const isProductionSite = productionEnvs.has(process.env.APP_ENV);
	const guruConfig = getGuruConfig();
	const basePath = guruConfig?.basePath ?? '';
	const assetPrefix = guruConfig?.publicPath ?? '';

	return {
		distDir: `dist/${env}`,
		reactStrictMode: !isProductionSite,
		generateEtags: true,
		poweredByHeader: !isProductionSite,
		transpilePackages,
		basePath,
		assetPrefix,
		cacheMaxMemorySize: 0,
		i18n: {
			locales: ['en'],
			defaultLocale: 'en',
		},
		typescript: {
			// Skip type checking at build time to save time. Type checking done automatically in PRs
			ignoreBuildErrors: true,
		},
		images: {
			minimumCacheTTL: 3_153_600_000,
			formats: ['image/avif', 'image/webp'],
			deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
			imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
			remotePatterns: [
				{
					protocol: 'https',
					hostname: '**.autoguru.com.au',
				},
				{
					protocol: 'https',
					hostname: '**.autoguru.com',
				},
				{
					protocol: 'https',
					hostname: '**.autoguru.co.nz',
				},
			],
		},
		webpack: (defaultConfig) => {
			defaultConfig.plugins.push(
				new DefinePlugin({
					'process.__browser__': JSON.stringify(false),
					'process.env.NODE_ENV': JSON.stringify(
						isDev ? 'development' : 'production',
					),
					__DEV__: JSON.stringify(isDev),
					__MOUNT_DOM_ID__: guruConfig.mountDOMId,
					__MOUNT_DOM_CLASS__: guruConfig.mountDOMClass,
					__DEBUG__: JSON.stringify(isDebug),
					__GDU_APP_NAME__: JSON.stringify(getProjectName()),
				}),
			);
			defaultConfig.plugins.push(
				new DefinePlugin({
					__DEBUG__: isDebug,
				}),
			);
			// Read defaults
			getConfigsDirs()
				.flatMap((configsDir) => [
					new Dotenv({
						path: path.resolve(configsDir, '.env.defaults'),
						prefix: 'process.env.',
						ignoreStub: true,
					}), // Read env
					new Dotenv({
						path: path.resolve(configsDir, `.env.${env}`),
						prefix: 'process.env.',
						ignoreStub: true,
					}),
				])
				.forEach((plugin) => defaultConfig.plugins.push(plugin));

			// ONLY ONE COPY OF EACH
			defaultConfig.resolve.alias['react'] = resolve(
				PROJECT_ROOT,
				'../../',
				'node_modules/react/',
			);

			defaultConfig.resolve.alias['react-dom'] = resolve(
				PROJECT_ROOT,
				'../../',
				'node_modules/react-dom/',
			);
			defaultConfig.resolve.alias['@autoguru/icons'] = resolve(
				PROJECT_ROOT,
				'../../',
				'node_modules/@autoguru/icons/',
			);
			defaultConfig.resolve.alias['next'] = resolve(
				PROJECT_ROOT,
				'../../',
				'node_modules/next/',
			);
			defaultConfig.resolve.preferRelative = true;

			// Configure webpack parser to ignore import attributes (Next.js 13+ compatibility)
			defaultConfig.module.parser = {
				...defaultConfig.module.parser,
				javascript: {
					...(defaultConfig.module.parser as any)?.javascript,
					importAttributes: false,
				},
			};

			// Add refresh stubs for .css.ts and .css.js files BEFORE any transforms
			// This ensures $RefreshSig$ and $RefreshReg$ are defined when
			// Vanilla Extract's child compiler evaluates the code
			// Note: .css.js files come from pre-built packages like @autoguru/overdrive
			defaultConfig.module.rules.unshift({
				test: /\.css\.(ts|js)$/,
				enforce: 'pre',
				use: [
					{
						loader: require.resolve(
							'./webpack/loaders/vanillaExtractRefreshStub',
						),
					},
				],
			});

			defaultConfig.optimization.splitChunks = {
				// eslint-disable-next-line unicorn/no-useless-fallback-in-spread
				...(defaultConfig.optimization?.splitChunks || {}),
				cacheGroups: {
					...(defaultConfig.optimization?.splitChunks?.cacheGroups ||
						// eslint-disable-next-line unicorn/no-useless-fallback-in-spread
						{}),
					// AutoGuru MFE configs
					mfeConfigs: {
						chunks: 'all',
						test: /packages[/\\]global-configs/,
						name: 'mfe-configs',
						priority: 80,
						reuseExistingChunk: true,
						enforce: true,
					},
				},
			};
			return defaultConfig;
		},
	};
};
