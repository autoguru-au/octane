import path, { join, resolve } from 'path';

import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';
import browsers from 'browserslist-config-autoguru';
import Dotenv from 'dotenv-webpack';
import envCI from 'env-ci';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {
	defineReactCompilerLoaderOption,
	reactCompilerLoader,
} from 'react-compiler-webpack';
import { TreatPlugin } from 'treat/webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import {
	Configuration,
	DefinePlugin,
	IgnorePlugin,
	SourceMapDevToolPlugin,
} from 'webpack';

import {
	getGuruConfig,
	getProjectFolderName,
	getProjectName,
} from '../../lib/config';
import {
	CALLING_WORKSPACE_ROOT,
	GDU_ROOT,
	PROJECT_ROOT,
} from '../../lib/roots';
import { getBuildEnvs, getConfigsDirs } from '../../utils/configs';
import { getHooks } from '../../utils/hooks';

const { branch = 'null', commit = 'null' } = envCI();

const hooks = getHooks();

const vendorRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](scheduler|prop-types|use-subscription)[/\\]/;
const relayRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](relay-runtime|react-relay)[/\\]/;
const frameworkRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](react|react-dom)[/\\]/;

const gduEntryPath = join(GDU_ROOT, 'entry');

const ourCodePaths = [
	join(gduEntryPath, '/client/spa'),
	...getGuruConfig().srcPaths.map((item) => join(PROJECT_ROOT, item)),
	CALLING_WORKSPACE_ROOT && join(CALLING_WORKSPACE_ROOT, 'packages'),
	/@autoguru[/\\]/,
].filter(Boolean);

const fileMask = '[name]';

const getDotenvPlugins = (configsDir: string) => {
	if (!process.env.APP_ENV) {
		throw new Error('APP_ENV is not set');
	}
	return [
		new Dotenv({
			path: path.resolve(configsDir, '.env.defaults'),
			prefix: 'process.env.',
			ignoreStub: false,
			systemvars: true, // Include system env vars
			defaults: true, // Include defaults
		}),
		new Dotenv({
			path: path.resolve(configsDir, `.env.${process.env.APP_ENV}`),
			prefix: 'process.env.',
			ignoreStub: false,
			systemvars: true, // Include system env vars
			defaults: true, // Include defaults
		}),
	];
};

export const baseDevelopmentOptions = ({
	standalone,
	isDebug = false,
}: {
	buildEnv: string;
	isMultiEnv: boolean;
	standalone?: boolean;
	isDebug?: boolean;
}): Configuration => {
	const guruConfig = getGuruConfig();
	return {
		context: PROJECT_ROOT,
		mode: 'development',
		entry: {
			main: [join(gduEntryPath, 'spa', 'client.js')].filter(Boolean),
		},
		experiments: {
			layers: true,
			outputModule: true, // Enable ES modules output
		},
		cache: {
			type: 'filesystem',
			cacheLocation: resolve(PROJECT_ROOT, '.build_cache'),
			allowCollectingMemory: true,
			buildDependencies: {
				// This makes all dependencies of this file - build dependencies
				config: [__filename],
				// By default webpack and loaders are build dependencies
			},
		},
		resolve: {
			preferRelative: true,
			fallback: {
				path: false,
				util: false,
				net: false,
				tls: false,
				buffer: false,
				stream: false,
				https: false,
				http: false,
				url: false,
				assert: false,
				crypto: false,
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
			minimize: false, // Don't minimize in development
			concatenateModules: false,
			splitChunks: {
				chunks: 'async',
				minSize: 20_000,
				minRemainingSize: 0,
				minChunks: 1,
				enforceSizeThreshold: 50_000,
				cacheGroups: {
					default: false,
					defaultVendors: false,
					// For things that are shared by at least 2+ chunks.
					common: {
						name: 'common',
						minChunks: 2,
						priority: 20,
						reuseExistingChunk: true,
					},
					lib: {
						test: /(?!.*gdu)[/\\]node_modules[/\\]/,
						priority: 30,
						minChunks: 1,
						reuseExistingChunk: true,
					},
					relay: {
						chunks: 'all',
						name: 'relay',
						test: relayRegex,
						priority: 40,
						reuseExistingChunk: true,
						enforce: true,
					},
					vendor: {
						chunks: 'all',
						name: 'vendor',
						test: vendorRegex,
						priority: 50,
						reuseExistingChunk: true,
						enforce: true,
					},
					framework: standalone
						? {
								chunks: 'all',
								name: 'framework',
								test: frameworkRegex,
								priority: 60,
								reuseExistingChunk: true,
								enforce: true,
							}
						: {},
					// AutoGuru related assets here
					guru: {
						test: /@autoguru[/\\]/,
						priority: 70,
						reuseExistingChunk: true,
						enforce: true,
					},
					// AutoGuru MFE configs
					mfeConfigs: {
						chunks: 'all',
						test: /packages[/\\]global-configs/,
						name: 'mfe-configs',
						priority: 80,
						reuseExistingChunk: true,
						enforce: true,
					},
				},
			},
			moduleIds: 'named',
			runtimeChunk: {
				name: 'runtime',
			},
		},
		module: {
			strictExportPresence: true,
			rules: [
				{
					test: /\.[cm]?[jt]sx?$/i,
					exclude: /node_modules/,
					use: [
						{
							loader: reactCompilerLoader,
							options: defineReactCompilerLoaderOption({}),
						},
					],
				},
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
										envName: 'development',
										...hooks.babelConfig.call(
											require('../babel-config/development')(
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
										envName: 'development',
										presets: [
											[
												require.resolve(
													'@babel/preset-env',
												),
												{
													useBuiltIns: false,
													modules: false, // Using false to preserve ES modules
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
		devtool: 'eval-source-map',
		plugins: [
			new IgnorePlugin({
				checkResource(resource) {
					return /(\/next\/)/.test(resource);
				},
			}),
			new DefinePlugin({
				'process.__browser__': JSON.stringify(true),
				'process.env.NODE_ENV': JSON.stringify('development'),
				'process.env.NODE_DEBUG': JSON.stringify(false),
				'process.env.browser': JSON.stringify(true),
				'process.env.nextTick': (callback) => setTimeout(callback, 0),
				'global.Writable': 'require("stream").Writable',

				__DEV__: JSON.stringify(true),
				__MOUNT_DOM_ID__: JSON.stringify(guruConfig.mountDOMId),
				__MOUNT_DOM_CLASS__: JSON.stringify(guruConfig.mountDOMClass),
				__DEBUG__: JSON.stringify(isDebug),
				__GDU_APP_NAME__: JSON.stringify(getProjectName()),
				__GDU_BUILD_INFO__: JSON.stringify({
					commit,
					branch,
				}),
			}),
			new TreatPlugin({
				outputLoaders: [
					{
						loader: require.resolve('style-loader'),
					},
				],
				minify: false,
				browsers,
			}),
			new VanillaExtractPlugin(),
			new MiniCssExtractPlugin({
				filename: `${fileMask}.css`,
				chunkFilename: `chunks/${fileMask}.css`,
				ignoreOrder: true,
			}),
			// Read defaults and inject them as string literals
			...getConfigsDirs().flatMap((element) => getDotenvPlugins(element)),
			new SourceMapDevToolPlugin({
				exclude: standalone
					? [/.css.ts$/, frameworkRegex]
					: [/.css.ts$/],
				test: [/.ts$/, /.tsx$/],
			}),
		].filter(Boolean),
	};
};

type BuildEnv = ReturnType<typeof getBuildEnvs>[number];

const getPublicPath = ({
	buildEnv,
	isDev,
	projectFolderName,
}: {
	buildEnv: BuildEnv;
	isTenanted: boolean;
	isDev: boolean;
	projectFolderName: string;
}): string => {
	if (isDev) return '/';

	if (buildEnv === 'prod') {
		return `#{PUBLIC_PATH_BASE}/${projectFolderName}/`;
	}

	const [agEnv, tenant] = buildEnv.split('-');

	return `https://mfe.${tenant}-${agEnv}.autoguru.com/${projectFolderName}/`;
};

export const makeWebpackDevelopmentConfig = (
	buildEnv: BuildEnv,
	isMultiEnv: boolean,
): Configuration => {
	const { outputPath, isTenanted } = getGuruConfig();
	return {
		name: buildEnv,
		output: {
			path: `${outputPath}/${
				!isMultiEnv && buildEnv === 'prod' ? '' : buildEnv
			}`,
			publicPath: getPublicPath({
				buildEnv,
				isDev: true,
				projectFolderName: getProjectFolderName(),
				isTenanted,
			}),
			filename: `${fileMask}.js`,
			chunkFilename: `chunks/${fileMask}.js`,
			hashFunction: 'sha256',
			crossOriginLoading: 'anonymous',
			sourceMapFilename: 'sourceMaps/[file].map',
			pathinfo: false,
			// ES Module config
			module: true,
			library: { type: 'module' },
			environment: {
				module: true,
				arrowFunction: true,
				const: true,
				destructuring: true,
				dynamicImport: true,
			},
		},
		// No externals in development mode - bundle everything
		externalsType: undefined,
		externals: {},
	};
};
