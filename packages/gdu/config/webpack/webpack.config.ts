import path, { join, resolve } from 'path';

import browsers from 'browserslist-config-autoguru';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
// import { RuntimeConfigsPlugin } from 'configs-webpack-plugin';
// import { getConsumerRuntimeConfig } from '../../lib/getConsumerRuntimeConfig';
// webpack.config.js
/* eslint-disable @typescript-eslint/no-var-requires */

import Dotenv from 'dotenv-webpack';
import bugger from 'debug';
import findUp from 'find-up';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { TreatPlugin } from 'treat/webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';

import { getGuruConfig, getProjectName } from '../../lib/config';
import { isEnvProduction } from '../../lib/misc';
import { CALLING_WORKSPACE_ROOT, GDU_ROOT, PROJECT_ROOT } from '../../lib/roots';
import { getHooks } from '../../utils/hooks';

import { commonLoaders } from './blocks/common';
import { makeImagesLoader } from './blocks/images';
import { makeCssLoader } from './blocks/styles';
import { GuruBuildManifest } from './plugins/GuruBuildManifest';

/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-prototype-methods */
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

const frameworkRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](react|react-dom|scheduler|prop-types|use-subscription|relay-runtime|react-relay)[/\\]/;

export const makeWebpackConfig = ({ isDevServer = false, name = 'client' }) => {
	const hooks = getHooks();
	const isDev = !isEnvProduction();
	const configsDir = findUp.sync('.gdu_config',{type: 'directory'})

	const gduEntryPath = join(GDU_ROOT, 'entry');

	const ourCodePaths = [
		join(gduEntryPath, '/client/spa'),
		...getGuruConfig().srcPaths.map((item) => join(PROJECT_ROOT, item)),
		CALLING_WORKSPACE_ROOT && join(CALLING_WORKSPACE_ROOT, 'packages'),
		/@autoguru[/\\]/,
	].filter(Boolean);

	const { outputPath } = getGuruConfig();

	const fileMask = isDev ? '[name]' : '[name]-[contenthash:8]';

	const options: Configuration = {
		name,
		context: PROJECT_ROOT,
		mode: isDev ? 'development' : 'production',
		entry: {
			main: [
				!isDev && join(gduEntryPath, '/spa/set-public-path.js'),
				join(gduEntryPath, '/polyfill.js'),
				join(gduEntryPath, '/spa/client.js'),
			].filter(Boolean),
		},
		cache: {
			type: 'filesystem',
			cacheLocation: resolve(__dirname, '.build_cache'),
			buildDependencies: {
				// This makes all dependencies of this file - build dependencies
				config: [__filename],
				// By default webpack and loaders are build dependencies
			},
		},
		devtool: isDev ? 'cheap-module-source-map' : 'source-map',
		bail: !isDev || !isDevServer,
		output: {
			path: outputPath,
			publicPath: isDev ? '/' : getGuruConfig()?.publicPath ?? '/',
			filename: `${fileMask}.js`,
			chunkFilename: `chunks/${fileMask}.js`,
			hashFunction: 'sha256',
			crossOriginLoading: 'anonymous',
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
				__GDU_CONSUMER_CLIENT__: join(PROJECT_ROOT, 'src/client.tsx'),
			},
		},
		optimization: {
			nodeEnv: false,
			minimize: !isDev,
			concatenateModules: !isDev,
			splitChunks: {
				maxAsyncRequests: Number.POSITIVE_INFINITY,
				maxInitialRequests: Number.POSITIVE_INFINITY,
				minSize: 20_000,
				chunks: 'all',
				cacheGroups: {
					default: false,
					defaultVendors: false,
					lib: {
						test: /(?!.*gdu)[/\\]node_modules[/\\]/,
						priority: 30,
						minChunks: 1,
						reuseExistingChunk: true,
					},
					framework: {
						chunks: 'all',
						name: 'framework',
						test: frameworkRegex,
						priority: 40,
						enforce: true,
					},
					// For things that are shared by at least 2+ chunks.
					common: {
						name: 'common',
						minChunks: 2,
						priority: 20,
						reuseExistingChunk: true,
					},
					// AutoGuru related assets here
					guru: {
						test: /@autoguru[/\\]/,
						priority: 99,
						reuseExistingChunk: true,
						enforce: true,
					},
				},
			},
			moduleIds: isDev ? 'named' : 'deterministic',
			runtimeChunk: {
				name: 'runtime',
			},
			minimizer: [
				new TerserPlugin({
					parallel: true,
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
					test: /\.css$/,
					sideEffects: true,
					use: makeCssLoader({ isServer: false }),
				},
				{
					test: /\.(js|mjs|jsx|ts|tsx)$/,
					oneOf: [
						// our stuff
						{
							include: ourCodePaths,
							exclude(path) {
								// TODO: Temp, remove this
								if (path.includes('@autoguru/utilities')) {
									return true;
								}

								const ourCode = ourCodePaths.some((item) => {
									if (item instanceof RegExp) {
										return item.test(path);
									}

									return path.includes(item);
								});

								return ourCode
									? false
									: path.includes('node_modules');
							},
							use: [
								{
									loader: require.resolve('babel-loader'),
									options: {
										babelrc: false,
										envName: isDev
											? 'development'
											: 'production',
										...hooks.babelConfig.call(
											require('../babel.config')(
												getGuruConfig(),
											),
										),
									},
								},
							],
						},
						// node_modules stuff
						{
							exclude: /@babel(?:\/|\\{1,2})runtime/,
							use: [
								{
									loader: require.resolve('babel-loader'),
									options: {
										babelrc: false,
										envName: isDev
											? 'development'
											: 'production',
										presets: [
											[
												require.resolve(
													'@babel/preset-env',
												),
												{
													useBuiltIns: false,
													modules: false,
													exclude: [
														'transform-typeof-symbol',
													],
													loose: false,
													shippedProposals: true,
													spec: true,
													targets: browsers,
												},
											],
										],
									},
								},
							],
						},
					],
				},
				...commonLoaders().after,
			],
		},
		plugins: [
			!isDev && new CleanWebpackPlugin(),
			new DefinePlugin({
				'process.browser': JSON.stringify(true),
				'process.env.NODE_ENV': JSON.stringify(
					isDev ? 'development' : 'production',
				),
				__DEV__: JSON.stringify(isDev),
				__GDU_APP_NAME__: JSON.stringify(getProjectName()),
				__GDU_BUILD_INFO__: JSON.stringify({
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
				outputLoaders: [
					{
						loader: isEnvProduction()
							? MiniCssExtractPlugin.loader
							: require.resolve('style-loader'),
					},
				],
				minify: !isDev,
				browsers,
			}),
			!isDev && new GuruBuildManifest(),
			/*new RuntimeConfigsPlugin({
				configs: getConsumerRuntimeConfig(),
				request: 'gdu/config',
			}),*/
			// Read defaults
			new Dotenv({
				path: path.resolve(configsDir, '.env.defaults')
			}),
			// Read env
			new Dotenv({
				path: path.resolve(configsDir, `.env.${process.env.NODE_ENV || 'dev'}`)
			}),
		].filter(Boolean),
	};

	debug('%o', options);

	return options;
};
