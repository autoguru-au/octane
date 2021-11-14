import { resolve} from 'path';
import { TreatPlugin } from 'treat/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import NTM from 'next-transpile-modules';
import { DefinePlugin } from 'webpack';
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin();
const withTM = NTM([
	'@autoguru/overdrive',
	'@autoguru/icons',
	'@autoguru/components',
	'@autoguru/relay',
	'@autoguru/auth',
	'@autoguru/components',
	'@popperjs/core',
]);

export const nextJSConfig = withVanillaExtract(
	withTM({
		webpack: (
			defaultConfig,
			{ /*buildId, dev, isServer, defaultLoaders, webpack*/ },
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
