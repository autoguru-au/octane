/* eslint-disable unicorn/prefer-prototype-methods */
import path, { resolve } from 'path';

import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';
import Dotenv from 'dotenv-webpack';
import NTM from 'next-transpile-modules';
import { DefinePlugin } from 'webpack';

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
export const createNextJSConfig = (buildEnv) => {
	const isDev = !isEnvProduction();
	const env = process.env.APP_ENV || (isDev ? 'dev' : buildEnv);

	return {
		distDir: `dist/${env}`,
		reactStrictMode: true,
		experimental: {
			esmExternals: false,
			externalDir: false,
		},
		images: {
			domains: ['cdn.autoguru.com.au'],
			formats: ['image/webp'],
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
	withVanillaExtract(withTM(createNextJSConfig('uat')));
