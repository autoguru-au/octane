/* eslint-disable unicorn/prefer-prototype-methods */
import path, { resolve } from 'path';

import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';
import Dotenv from 'dotenv-webpack';
import NTM from 'next-transpile-modules';
import { DefinePlugin } from 'webpack';

import { getGuruConfig } from '../lib/config';
import { isEnvProduction } from '../lib/misc';
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
	'@autoguru/components',
	'@autoguru/layout',
	'@popperjs/core',
]);

const allowedScriptSources = [
	"'self'",
	"'unsafe-inline'",
	'*.autoguru.com.au',
	'*.googletagmanager.com',
	'*.google-analytics.com',
	'*.google.com',
	'*.google.com.au',
	'*.gstatic.com',
	'*.googleadservices.com',
	'*.heapanalytics.com',
	'*.doubleclick.net',
	'*.mapbox.com',
	'*.quantserve.com',
	'*.wisepops.com',
	'*.tvsquared.com',
	'*.quantcount.com',
].join(' ');

const allowedStyleSources = [
	"'self'",
	"'unsafe-inline'",
	'https://*.autoguru.com.au',
	'https://*.googleapis.com',
].join(' ');

const allowedIFrameSources = [
	"'self'",
	'https://www.youtube.com',
	'https://www.google.com',
].join(' ');

const allowedImageSources = ["'self'"].join(' ');

const allowedDataDomains = ['https://*'].join(' ');

const allowedFontSources = [
	'https://*.autoguru.com.au',
	'https://*.googleapis.com',
	'https://*.gstatic.com',
].join(' ');

const allowedDataSources = ["'self'", 'blob:'].join(' ');

const allowedObjectSources = ["'none'"].join(' ');

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
		key: 'Content-Security-Policy',
		value: `frame-ancestors https://*.autoguru.com.au; frame-src ${allowedIFrameSources}; style-src ${allowedStyleSources}; img-src ${allowedImageSources} data: ${allowedDataDomains}; font-src ${allowedFontSources}; worker-src ${allowedDataSources}; child-src ${allowedDataSources}; object-src ${allowedObjectSources}';connect-src ${allowedScriptSources}; script-src-elem ${allowedScriptSources}; script-src ${allowedScriptSources};`,
	},
];

export const createNextJSConfig = (buildEnv) => {
	const isDev = !isEnvProduction();
	const env = process.env.APP_ENV || (isDev ? 'dev' : buildEnv);
	const assetPrefix = isDev ? '' : getGuruConfig()?.publicPath ?? '';

	return {
		distDir: `dist/${env}`,
		reactStrictMode: true,
		swcMinify: true,
		assetPrefix,
		i18n: {
			locales: ['en'],
			defaultLocale: 'en',
		},
		typescript: {
			// Skip type checking at build time to save time. Type checking done automatically in PRs
			transpileOnly: true,
			ignoreDevErrors: true,
			ignoreBuildErrors: true,
		},
		images: {
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
					}), // Read env
					new Dotenv({
						path: path.resolve(configsDir, `.env.${env}`),
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
