import browsers from 'browserslist-config-autoguru';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import bugger from 'debug';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { join } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import TreatPlugin from 'treat/webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration, DefinePlugin, HashedModuleIdsPlugin } from 'webpack';

import { getGuruConfig } from '../../lib/config';
import { isEnvProduction } from '../../lib/misc';
import {
	CALLING_WORKSPACE_ROOT,
	GDU_ROOT,
	PROJECT_ROOT,
} from '../../lib/roots';
import { getHooks } from '../../utils/hooks';
import { commonLoaders } from './blocks/common';
import { makeImagesLoader } from './blocks/images';
import { makeCssLoader, makeSassLoader } from './blocks/styles';
import { GuruBuildManifest } from './plugins/GuruBuildManifest';

const { branch = 'null', commit = 'null' } = require('env-ci')();

const debug = bugger('gdu:webpack:config');

const terserOptions = {
	ie8: false,
	output: {
		ecma: 5,
		safari10: true,
		comments: false,
		ascii_only: true,
	},
	parse: { ecma: 8 },
	compress: {
		ecma: 5,
		warnings: false,
		comparisons: false,
		inline: 2,
		hoist_funs: true,
		toplevel: true,
		passes: 5,
	},
	mangle: { safari10: true },
};

const frameworkRegex = /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription|relay-runtime|react-relay)[\\/]/;

export const makeWebpackConfig = ({ isDevServer = false, name = 'client' }) => {
	const hooks = getHooks();
	const isDev = !isEnvProduction();

	const ourCodePaths = [
		join(GDU_ROOT, 'entry/client/spa'),
		...getGuruConfig().srcPaths.map(item => join(PROJECT_ROOT, item)),
		CALLING_WORKSPACE_ROOT && join(CALLING_WORKSPACE_ROOT, 'packages'),
		/@autoguru[\\/]/,
	].filter(Boolean);

	const { outputPath } = getGuruConfig();

	const fileMask = isDev ? '[name]' : '[name]-[contenthash:8]';

	const options: Configuration = {
		name,
		context: PROJECT_ROOT,
		mode: isDev ? 'development' : 'production',
		entry: {
			main: join(GDU_ROOT, 'entry/spa/client.js'),
		},
		devtool: isDev ? 'cheap-module-source-map' : 'source-map',
		bail: !isDev || !isDevServer,
		output: {
			path: outputPath,
			publicPath: getGuruConfig()?.publicPath ?? '/',
			filename: `${fileMask}.js`,
			chunkFilename: `chunks/${fileMask}.js`,
			hashFunction: 'sha256',
			crossOriginLoading: 'anonymous',
			futureEmitAssets: !isDev,
			sourceMapFilename: 'sourceMaps/[file].map',
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.mjs', '.jsx', '.js', '.json'],
			plugins: [
				new TsconfigPathsPlugin({
					configFile: join(PROJECT_ROOT, 'tsconfig.json'),
				}),
			],
			alias: {
				__consumer_client__: join(PROJECT_ROOT, 'src/client.tsx'),
			},
		},
		optimization: {
			nodeEnv: false,
			minimize: !isDev,
			concatenateModules: !isDev,
			splitChunks: {
				chunks: 'all',
				maxInitialRequests: 25,
				minSize: 20000,
				cacheGroups: {
					default: false,
					// For React + Relay
					framework: {
						chunks: 'all',
						name: 'framework',
						test: frameworkRegex,
						priority: 40,
						enforce: true,
					},
					// For things that are shared by at least 2+ chunks.
					common: {
						// TODO: Create hashed names here
						priority: 10,
						minChunks: 2,
						reuseExistingChunk: true,
					},
					// AutoGuru related assets here
					guru: {
						test: /@autoguru[\\/]/,
						priority: 99,
						reuseExistingChunk: true,
						enforce: true,
					},
				},
			},
			runtimeChunk: {
				name: 'runtime',
			},
			minimizer: [
				new TerserPlugin({
					cache: true,
					parallel: true,
					sourceMap: false,
					terserOptions,
				}),
			],
		},
		module: {
			strictExportPresence: true,
			rules: [
				...commonLoaders().before,
				{
					test: [/\.gif$/, /\.jpe?g$/, /\.png$/],
					use: makeImagesLoader(),
				},
				{
					test: /\.scss$/,
					use: makeSassLoader({ isServer: false }),
				},
				{
					test: /\.css$/,
					sideEffects: true,
					use: makeCssLoader({ isServer: false }),
				},
				// TODO: Process babel over node_modules
				{
					test: /\.(js|mjs|jsx|ts|tsx)$/,
					include: ourCodePaths,
					use: [
						{
							loader: require.resolve('babel-loader'),
							options: {
								babelrc: false,
								envName: isDev ? 'development' : 'production',
								...hooks.afterBabelConfig.call(
									require('../babel.config')(getGuruConfig()),
								),
							},
						},
					],
				},
				...commonLoaders().after,
			],
		},
		plugins: [
			!isDev &&
				new HashedModuleIdsPlugin({
					hashFunction: 'sha256',
				}),
			!isDev && new CleanWebpackPlugin(),
			new DefinePlugin({
				'process.browser': JSON.stringify(false),
				'process.env.NODE_ENV': JSON.stringify(
					isDev ? 'development' : 'production',
				),
				__DEV__: JSON.stringify(isDev),
				__BUILD_INFO__: JSON.stringify({
					commit,
					branch,
				}),
			}),
			new MiniCssExtractPlugin({
				filename: `${fileMask}.css`,
				chunkFilename: `chunks/${fileMask}.css`,
				ignoreOrder: true,
			}),
			new TreatPlugin({
				outputLoaders: [MiniCssExtractPlugin.loader],
				minify: !isDev,
				browsers,
			}),
			!isDev && new GuruBuildManifest(),
		].filter(Boolean),
	};

	debug('%o', options);

	return options;
};
