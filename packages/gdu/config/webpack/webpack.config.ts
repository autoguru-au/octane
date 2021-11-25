import path, { join, resolve } from 'path';

import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';
import browsers from 'browserslist-config-autoguru';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import envCI from 'env-ci';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { TreatPlugin } from 'treat/webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';

import { getGuruConfig, getProjectName } from '../../lib/config';
import { isEnvProduction } from '../../lib/misc';
import {
	CALLING_WORKSPACE_ROOT,
	GDU_ROOT,
	PROJECT_ROOT,
} from '../../lib/roots';
import { getBuildEnvs, getConfigsDirs } from '../../utils/configs';
import { getHooks } from '../../utils/hooks';

//import { commonLoaders } from './blocks/common';
import { GuruBuildManifest } from './plugins/GuruBuildManifest';

const { branch = 'null', commit = 'null' } = envCI();

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

const hooks = getHooks();
const isDev = !isEnvProduction();

const gduEntryPath = join(GDU_ROOT, 'entry');

const ourCodePaths = [
	join(gduEntryPath, '/client/spa'),
	...getGuruConfig().srcPaths.map((item) => join(PROJECT_ROOT, item)),
	CALLING_WORKSPACE_ROOT && join(CALLING_WORKSPACE_ROOT, 'packages'),
	/@autoguru[/\\]/,
].filter(Boolean);

const fileMask = isDev ? '[name]' : '[name]-[contenthash:8]';

const baseOptions = (buildEnv, isMultiEnv: boolean): Configuration => ({
	context: PROJECT_ROOT,
	mode: isDev ? 'development' : 'production',
	entry: {
		main: [
			!isDev && join(gduEntryPath, '/spa/set-public-path.js'),
			join(gduEntryPath, '/polyfill.js'),
			join(gduEntryPath, '/spa/client.js'),
		].filter(Boolean),
	},
	experiments: {
		layers: true,
	},
	cache: {
		type: 'filesystem',
		cacheLocation: resolve(PROJECT_ROOT, '.build_cache'),
		allowCollectingMemory: isDev ? true : false,
		buildDependencies: {
			// This makes all dependencies of this file - build dependencies
			config: [__filename],
			// By default webpack and loaders are build dependencies
		},
	},
	devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
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
			chunks: 'async',
			minSize: 20000,
			minRemainingSize: 0,
			minChunks: 1,
			maxAsyncRequests: 30,
			maxInitialRequests: 30,
			enforceSizeThreshold: 50000,
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
			//...commonLoaders().before,
			{
				test: /\.css$/i,
				oneOf: [
					{
						test: /\.vanilla\.css$/i, // Targets only CSS files generated by vanilla-extract
						use: [
							MiniCssExtractPlugin.loader,
							{
								loader: require.resolve('css-loader'),
								options: {
									url: true, // Required as image imports should be handled via JS/TS import statements
								},
							},
						],
					},
					{
						test: /^((?!\.vanilla)[\S\s])*\.css$/i, // Targets only CSS that is not vanilla css
						use: [MiniCssExtractPlugin.loader, 'css-loader'],
					},
				],
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
									cacheCompression: false,
									cacheDirectory: true,
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
									cacheCompression: false,
									cacheDirectory: true,
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
		new VanillaExtractPlugin(),
		new MiniCssExtractPlugin({
			filename: `${fileMask}.css`,
			chunkFilename: `chunks/${fileMask}.css`,
			ignoreOrder: true,
		}),

		// Read defaults
		...getConfigsDirs().flatMap((configsDir) => [
			new Dotenv({
				path: path.resolve(configsDir, '.env.defaults'),
			}), // Read env
			new Dotenv({
				path: path.resolve(
					configsDir,
					`.env.${process.env.APP_ENV || (isDev ? 'dev' : buildEnv)}`,
				),
			}),
		]),
		!isDev &&
			new GuruBuildManifest({
				outputDir:
					!isMultiEnv && buildEnv === 'prod'
						? resolve(PROJECT_ROOT, 'dist')
						: resolve(PROJECT_ROOT, 'dist', buildEnv),
				includeChunks: false,
			}),
	].filter(Boolean),
});

const { outputPath } = getGuruConfig();

type BuildEnv = ReturnType<typeof getBuildEnvs>[number];
const makeWebpackConfig = (
	buildEnv: BuildEnv,
	isMultiEnv: boolean,
): Configuration => ({
	name: buildEnv,

	output: {
		path: `${outputPath}/${
			!isMultiEnv && buildEnv === 'prod' ? '' : buildEnv
		}`,
		publicPath: isDev ? '/' : getGuruConfig()?.publicPath ?? '/',
		filename: `${fileMask}.js`,
		chunkFilename: `chunks/${fileMask}.js`,
		hashFunction: 'sha256',
		crossOriginLoading: 'anonymous',
		sourceMapFilename: 'sourceMaps/[file].map',
		pathinfo: false,
	},
});

const buildConfigs = (): Configuration[] => {
	const buildEnvs = getBuildEnvs();
	return buildEnvs.map((buildEnv) => ({
		...baseOptions(buildEnv, buildEnvs.length > 1),
		...makeWebpackConfig(buildEnv, buildEnvs.length > 1),
	}));
};

export default buildConfigs;
