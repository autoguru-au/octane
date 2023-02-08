/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-prototype-methods */
import {join, resolve} from 'path';

import {VanillaExtractPlugin} from '@vanilla-extract/webpack-plugin';
import browsers from 'browserslist-config-autoguru';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import envCI from 'env-ci';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import {TreatPlugin} from 'treat/webpack-plugin';
import {TsconfigPathsPlugin} from 'tsconfig-paths-webpack-plugin';
import {Configuration, DefinePlugin, IgnorePlugin, SourceMapDevToolPlugin,} from 'webpack';

import {getGuruConfig, getProjectName,} from '../../lib/config';
import {isProductionBuild} from '../../lib/misc';
import {CALLING_WORKSPACE_ROOT, GDU_ROOT, PROJECT_ROOT,} from '../../lib/roots';
import {getHooks} from '../../utils/hooks';

const {branch = 'null', commit = 'null'} = envCI();

const terserOptions = {
	ie8: false,
	output: {
		ecma: 5,
		safari10: true,
		comments: false,
		ascii_only: true,
	},
	parse: {ecma: 8},
	compress: {
		ecma: 5,
		warnings: false,
		comparisons: false,
		inline: 2,
		hoist_funs: true,
		toplevel: true,
		passes: 5,
	},
	mangle: {safari10: true},
};


const hooks = getHooks();
const isDev = !isProductionBuild();

const gduEntryPath = join(GDU_ROOT, 'entry');
const frameworkRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](react|react-dom|scheduler|prop-types|use-subscription|relay-runtime|react-relay)[/\\]/;

const ourCodePaths = [
	join(gduEntryPath, '/client/spa'),
	...getGuruConfig().srcPaths.map((item) => join(PROJECT_ROOT, item)),
	CALLING_WORKSPACE_ROOT && join(CALLING_WORKSPACE_ROOT, 'packages'),
	/@autoguru[/\\]/,
].filter(Boolean);

const fileMask = isDev ? '[name]' : '[name]-[contenthash:8]';

const {outputPath} = getGuruConfig();

export const makeWebComponentsWebpackConfig = (name: string): Configuration => ({
	name,
	context: PROJECT_ROOT,
	mode: isDev ? 'development' : 'production',
	entry: {
		main: [
			join(PROJECT_ROOT, 'lib')
		].filter(Boolean),
	},
	output: {
		path: outputPath,
		publicPath: '/',
		filename: `${fileMask}.js`,
		chunkFilename: `chunks/${fileMask}.js`,
		hashFunction: 'sha256',
		crossOriginLoading: 'anonymous',
		sourceMapFilename: 'sourceMaps/[file].map',
		pathinfo: false,
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
	resolve: {
		fallback: {
			path: false,
			util: false,
		},
		extensions: ['.tsx', '.ts', '.mjs', '.jsx', '.js', '.json'],
		plugins: [
			// TODO: Remove the ignore when plugin is fixed it's types
			// @ts-ignore
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
		moduleIds: isDev ? 'named' : 'deterministic',
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
			{
				test: /\.css$/i,
				oneOf: [
					{
						test: /\.vanilla\.css$/i, // Targets only CSS files generated by vanilla-extract
						use: [
							"style-loader",
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
						use: ["style-loader", 'css-loader'],
					},
				],
			}, {
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
						exclude:
							/(@babel(?:\/|\\{1,2})runtime)|(\/node_modules\/next\/)/,
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
	devtool: isDev && 'source-map',
	plugins: [
		new IgnorePlugin({
			checkResource(resource) {
				return /(\/next\/)/.test(resource);
			},
		}),
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
					loader: isProductionBuild()
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
		new SourceMapDevToolPlugin({
			test: [/.ts$/, /.tsx$/],
			exclude: [/.css.ts$/, frameworkRegex],
		}),
	].filter(Boolean),
});
