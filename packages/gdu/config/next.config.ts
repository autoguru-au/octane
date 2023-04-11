/* eslint-disable unicorn/prefer-prototype-methods */
import path, { resolve } from 'path';

import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';
import Dotenv from 'dotenv-webpack';
import NTM from 'next-transpile-modules';
import { DefinePlugin } from 'webpack';

import { getGuruConfig } from '../lib/config';
import { isProductionBuild } from '../lib/misc';
import { PROJECT_ROOT } from '../lib/roots';
import { getConfigsDirs } from '../utils/configs';

const withVanillaExtract = createVanillaExtractPlugin();

export const withTM = NTM([
	'@autoguru/themes',
	'@autoguru/overdrive',
	'@autoguru/icons',
	'@autoguru/components',
	'@autoguru/fleet',
	'@autoguru/relay',
	'@autoguru/auth',
	'@autoguru/aws',
	'@autoguru/components',
	'@autoguru/layout',
	'@popperjs/core',
]);

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
		values: ['https://*.autoguru.com.au'],
	},
	{
		key: 'frame-src',
		values: [
			"'self'",
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
			'https://*.googletagmanager.com',
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
			'https://*.googletagmanager.com',
			'https://*.google-analytics.com',
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
		key: 'script-src-elem',
		values: [
			"'self'",
			"'unsafe-inline'",
			'https://*.autoguru.com.au',
			'https://*.google-analytics.com',
			'https://*.googletagmanager.com',
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
			'https://*.googleadservices.com',
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
];

const productionEnvs = new Set(['prod', 'dockerprod', 'preprod']);

export const createNextJSConfig = (buildEnv) => {
	const isDev = !isProductionBuild();
	const env = process.env.APP_ENV || (isDev ? 'dev' : buildEnv);
	const isProductionSite = productionEnvs.has(process.env.APP_ENV);
	const guruConfig = getGuruConfig();
	const assetPrefix = isDev ? '' : guruConfig?.publicPath ?? '';
	const basePath = !isDev ? guruConfig?.basePath ?? '' : '';

	return {
		distDir: `dist/${env}`,
		reactStrictMode: !isProductionSite,
		swcMinify: true,
		generateEtags: true,
		poweredByHeader: !isProductionSite,
		assetPrefix,
		basePath,
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
			domains: [
				'www.autoguru.com.au',
				'dev.autoguru.com.au',
				'test.autoguru.com.au',
				'uat.autoguru.com.au',
				'preprod.autoguru.com.au',
				'cdn.autoguru.com.au',
				'cdn-dev.autoguru.com.au',
				'cdn-test.autoguru.com.au',
				'cdn-uat.autoguru.com.au',
				'cdn-preprod.autoguru.com.au',
			],
		},
		webpack: (defaultConfig) => {
			defaultConfig.plugins.push(
				new DefinePlugin({
					__DEV__: isDev,
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

			return defaultConfig;
		},
	};
};

export const createNextJSTranspiledConfig = () =>
	withVanillaExtract(withTM(createNextJSConfig('prod')));
