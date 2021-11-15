/* eslint-disable unicorn/prefer-prototype-methods */
import { PROJECT_ROOT } from '../lib/roots';

import { resolve } from 'path';
import { DefinePlugin } from 'webpack';
import { isEnvProduction } from '../lib/misc';
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';


import { TreatPlugin } from 'treat/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import NTM from 'next-transpile-modules';

const withVanillaExtract = createVanillaExtractPlugin();
const withTM = NTM([
	'@autoguru/themes',
	'@autoguru/overdrive',
	'@autoguru/icons',
	'@autoguru/components',
	'@autoguru/relay',
	'@autoguru/auth',
	'@autoguru/components',
	'@popperjs/core',
]);

export const createNextJSConfig = () => {
	const isDev = !isEnvProduction();

	return withVanillaExtract(
		withTM({
			reactStrictMode: true,
			experimental: {
				esmExternals: true,
				externalDir: true,
			},
			webpack: (
				defaultConfig,
			) => {
				defaultConfig.plugins.push(
					new TreatPlugin({
						outputLoaders: [MiniCssExtractPlugin.loader],
						outputCSS: false,
					}),
				);

				defaultConfig.plugins.push(
					new DefinePlugin({
						__DEV__: isDev, // TODO: Make this real
					}),
				);
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
				defaultConfig.resolve.alias['react-treat'] = resolve(
					PROJECT_ROOT,
					'../../',
					'node_modules/react-treat/',
				);
				defaultConfig.resolve.alias['treat'] = resolve(
					PROJECT_ROOT,
					'../../',
					'node_modules/treat/',
				);

				return defaultConfig;
			},
		}),
	);
};
