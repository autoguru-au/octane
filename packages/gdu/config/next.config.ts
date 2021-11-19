/* eslint-disable unicorn/prefer-prototype-methods */
import { PROJECT_ROOT } from '../lib/roots';
import path, { resolve } from 'path';
import { DefinePlugin } from 'webpack';
import { isEnvProduction } from '../lib/misc';
import Dotenv from 'dotenv-webpack';
//import MiniCssExtractPlugin from 'next/dist/compiled/mini-css-extract-plugin';
import NTM from 'next-transpile-modules';
import { getConfigsDirs } from '../utils/configs';
import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';
import { getGlobalCssLoader } from 'next/dist/build/webpack/config/blocks/css/loaders';

const withTM = NTM([
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

export const createNextJSConfig = () => {
	const isDev = !isEnvProduction();

	return withTM({
		reactStrictMode: true,
		experimental: {
			esmExternals: false,
			externalDir: false,
		},
		images: {
			domains: ['cdn.autoguru.com.au'],
		},
		webpack: (defaultConfig, options) => {
			//defaultConfig.plugins.push(new MiniCssExtractPlugin());

			const { dev, isServer } = options;

			const cssRules = defaultConfig.module.rules.find(
				(rule) =>
					Array.isArray(rule.oneOf) &&
					rule.oneOf.some(
						({ test }) =>
							typeof test === 'object' &&
							typeof test.test === 'function' &&
							test.test('filename.css'),
					),
			).oneOf;

			cssRules.unshift({
				test: /\.vanilla\.css$/i,
				sideEffects: true,
				use: getGlobalCssLoader(
					// @ts-ignore
					{
						assetPrefix: defaultConfig.assetPrefix,
						isClient: !isServer,
						isServer,
						isDevelopment: dev,
						future: defaultConfig.future || {},
						experimental: defaultConfig.experimental || {},
					},
					[],
					[],
				),
			});

			defaultConfig.plugins.push(
				new DefinePlugin({
					__DEV__: isDev, // TODO: Make this real
				}),
			);

			getConfigsDirs()
				.flatMap((configsDir) => [
					new Dotenv({
							path: path.resolve(configsDir, '.env.defaults'),
						}), // Read env
						new Dotenv({
							path: path.resolve(
								configsDir,
								`.env.${process.env.APP_ENV || 'dev'}`,
							),
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


			defaultConfig.plugins.push(new VanillaExtractPlugin());

			return defaultConfig;
		},
	});
};
