/* eslint-disable unicorn/prefer-prototype-methods */
import { resolve } from 'path';
import { Configuration, DefinePlugin } from 'webpack';

import { getGuruConfig } from '../lib/config';
import { isEnvProduction } from '../lib/misc';
import { PROJECT_ROOT } from '../lib/roots';
import { getHooks } from '../utils/hooks';
import Tm from 'next-transpile-modules';
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';


import { TreatPlugin } from 'treat/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const withTM = Tm(['@autoguru/overdrive', '@autoguru/icons', '@autoguru/components', '@autoguru/relay', '@autoguru/auth', '@autoguru/components', '@popperjs/core']);
const withVanillaExtract = createVanillaExtractPlugin();

export const createNextJSConfig = () => {
	const hooks = getHooks();
	const isDev = !isEnvProduction();

	const nextJsConfig = withVanillaExtract(withTM({
		poweredByHeader: false,
		generateEtags: false,

		pageExtensions: ['tsx', 'ts'],

		assetPrefix: getGuruConfig()?.publicPath,

		publicRuntimeConfig: {},

		reactStrictMode: true,
		experimental: {
			esmExternals: true,
			externalDir: true,
		},

		webpack(defaultConfig: Configuration) {
			defaultConfig.plugins.push(new TreatPlugin({
				outputLoaders: [MiniCssExtractPlugin.loader],
				outputCSS: false,
			}));

			defaultConfig.plugins.push(new DefinePlugin({
				__DEV__: isDev,
			}));
			// ONLY ONE COPY OF EACH
			defaultConfig.resolve.alias['react'] = resolve(PROJECT_ROOT, 'node_modules/react/');
			defaultConfig.resolve.alias['react-dom'] = resolve(PROJECT_ROOT, 'node_modules/react-dom/');
			defaultConfig.resolve.alias['@autoguru/icons'] = resolve(PROJECT_ROOT, 'node_modules/@autoguru/icons/');
			defaultConfig.resolve.alias['react-treat'] = resolve(PROJECT_ROOT, 'node_modules/react-treat/');
			defaultConfig.resolve.alias['treat'] = resolve(PROJECT_ROOT, 'node_modules/treat/');


			return hooks.webpackConfig.call(defaultConfig);
		},
	}));

	return hooks.nextJSConfig.call(nextJsConfig);
};
