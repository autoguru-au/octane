const { resolve } = require('path');
const { TreatPlugin } = require('treat/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const withTM = require('next-transpile-modules')([
	'@autoguru/overdrive',
	'@autoguru/icons',
	'@autoguru/components',
	'@autoguru/relay',
	'@autoguru/auth',
	'@autoguru/components',
	'@popperjs/core',
]);
const { DefinePlugin } = require('webpack');

const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

module.exports = withVanillaExtract(
	withTM({
		webpack: (
			defaultConfig,
			{ buildId, dev, isServer, defaultLoaders, webpack },
		) => {
			defaultConfig.plugins.push(
				new TreatPlugin({
					outputLoaders: [MiniCssExtractPlugin.loader],
					outputCSS: false,
				}),
			);

			defaultConfig.plugins.push(
				new DefinePlugin({
					__DEV__: false, // TODO: Make this real
				}),
			);
			// ONLY ONE COPY OF EACH
			defaultConfig.resolve.alias['react'] = resolve(
				__dirname,
				'../../',
				'node_modules/react/',
			);
			defaultConfig.resolve.alias['react-dom'] = resolve(
				__dirname,
				'../../',
				'node_modules/react-dom/',
			);
			defaultConfig.resolve.alias['@autoguru/icons'] = resolve(
				__dirname,
				'../../',
				'node_modules/@autoguru/icons/',
			);
			defaultConfig.resolve.alias['react-treat'] = resolve(
				__dirname,
				'../../',
				'node_modules/react-treat/',
			);
			defaultConfig.resolve.alias['treat'] = resolve(
				__dirname,
				'../../',
				'node_modules/treat/',
			);

			return defaultConfig;
		},
	}),
);
