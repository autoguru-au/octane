/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-prototype-methods */
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
import { isProductionBuild } from '../../lib/misc';
import {
	CALLING_WORKSPACE_ROOT,
	GDU_ROOT,
	PROJECT_ROOT,
} from '../../lib/roots';
import { getBuildEnvs, getConfigsDirs } from '../../utils/configs';
import { getHooks } from '../../utils/hooks';

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

const vendorRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](scheduler|prop-types|use-subscription)[/\\]/;
const relayRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](relay-runtime|react-relay)[/\\]/;
const frameworkRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](react|react-dom)[/\\]/;

const hooks = getHooks();
const isDev = !isProductionBuild();

const gduEntryPath = join(GDU_ROOT, 'entry');

const ourCodePaths = [
	join(gduEntryPath, '/client/spa'),
	...getGuruConfig().srcPaths.map((item) => join(PROJECT_ROOT, item)),
	CALLING_WORKSPACE_ROOT && join(CALLING_WORKSPACE_ROOT, 'packages'),
	/@autoguru[/\\]/,
].filter(Boolean);

const fileMask = isDev ? '[name]' : '[name]-[contenthash:8]';

export const baseOptions = (
	buildEnv,
	isMultiEnv: boolean,
	isDebug = false,
): Configuration => {
	const guruConfig = getGuruConfig();
	return {
		context: PROJECT_ROOT,
		mode: isDev ? 'development' : 'production',
		entry: {
			main: [
				join(gduEntryPath, 'polyfill.js'),

				join(gduEntryPath, 'spa', 'client.js'),
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
		resolve: {
			preferRelative: true,
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
					framework: {
						chunks: 'all',
						name: 'framework',
						test: frameworkRegex,
						priority: 60,
						reuseExistingChunk: true,
						enforce: true,
					},
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
				'process.__browser__': JSON.stringify(true),
				'process.env.NODE_ENV': JSON.stringify(
					isDev ? 'development' : 'production',
				),
				__DEV__: JSON.stringify(isDev),
				__MOUNT_DOM_ID__: guruConfig.mountDOMId,
				__MOUNT_DOM_CLASS__: guruConfig.mountDOMClass,
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

			// Read defaults
			...getConfigsDirs().flatMap((configsDir) => [
				new Dotenv({
					path: path.resolve(configsDir, '.env.defaults'),
					prefix: 'process.env.',
					ignoreStub: true,
				}), // Read env
				new Dotenv({
					path: path.resolve(
						configsDir,
						`.env.${
							process.env.APP_ENV || (isDev ? 'dev' : buildEnv)
						}`,
					),
					prefix: 'process.env.',
					ignoreStub: true,
				}),
			]),
			!isDev &&
				new GuruBuildManifest({
					mountDOMId: guruConfig.mountDOMId,
					mountDOMClass: guruConfig.mountDOMClass,
					outputDir:
						!isMultiEnv && buildEnv === 'prod'
							? resolve(PROJECT_ROOT, 'dist')
							: resolve(PROJECT_ROOT, 'dist', buildEnv),
					includeChunks: true,
				}),
			new SourceMapDevToolPlugin({
				test: [/.ts$/, /.tsx$/],
				exclude: [/.css.ts$/, frameworkRegex],
			}),
		].filter(Boolean),
	};
};

type BuildEnv = ReturnType<typeof getBuildEnvs>[number];

const getPublicPath = ({
	buildEnv,
	isTenanted,
	tenant,
	isDev,
	projectFolderName,
}: {
	buildEnv: BuildEnv;
	isTenanted: boolean;
	tenant?: string;
	isDev: boolean;
	projectFolderName: string;
}): string => {
	if (isDev) return '/';

	if (buildEnv === 'prod') {
		if (isTenanted) {
			const prodTenant = tenant || '#{AutoGuru.Tenant}';
			const prodAppPath = isTenanted
				? `${prodTenant}/${projectFolderName}`
				: `${projectFolderName}`;
			return `#{PUBLIC_PATH_BASE}/${prodAppPath}/`;
		} else {
			return `#{PUBLIC_PATH_BASE}/${projectFolderName}/`;
		}
	}

	const folderPath = tenant
		? `${tenant}/${projectFolderName}`
		: `${projectFolderName}`;

	return `https://static-mfe-${buildEnv}.autoguru.io/${folderPath}/`;
};
export const makeWebpackConfig = (
	buildEnv: BuildEnv,
	isMultiEnv: boolean,
	tenant?: string,
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
				tenant,
				isDev,
				projectFolderName: getProjectFolderName(),
				isTenanted,
			}),
			filename: `${fileMask}.js`,
			chunkFilename: `chunks/${fileMask}.js`,
			hashFunction: 'sha256',
			crossOriginLoading: 'anonymous',
			sourceMapFilename: 'sourceMaps/[file].map',
			pathinfo: false,
		},
	};
};
