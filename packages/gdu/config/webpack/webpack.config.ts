import path, { join, resolve } from 'path';

import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';
import browsers from 'browserslist-config-autoguru';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import envCI from 'env-ci';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {
	defineReactCompilerLoaderOption,
	reactCompilerLoader,
} from 'react-compiler-webpack';
import { MinifyOptions } from 'terser';
import TerserPlugin, { MinimizerOptions } from 'terser-webpack-plugin';
import { TreatPlugin } from 'treat/webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import {
	Configuration,
	DefinePlugin,
	IgnorePlugin,
	SourceMapDevToolPlugin,
} from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

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

const terserOptions: MinimizerOptions<MinifyOptions> = {
	ie8: false,
	parse: { ecma: 2020 },
	compress: {
		ecma: 2020,
		comparisons: false,
		inline: 3,
		hoist_funs: true,
		toplevel: true,
		passes: 3,
		pure_funcs: [
			'console.log',
			'console.info',
			'console.debug',
			'console.warn',
		],
		pure_getters: true,
		module: true,
	},
	format: {
		ecma: 2020,
		comments: false,
	},
	mangle: true,
};

const vendorRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](scheduler|prop-types|use-subscription)[/\\]/;
const relayRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](relay-runtime|react-relay)[/\\]/;
const frameworkRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](react|react-dom)[/\\]/;

const hooks = getHooks();

// Add package.json parsing to get relay version
/*const getRelayVersion = () => {
	try {
		const packagePath = path.join(PROJECT_ROOT, 'package.json');
		const pkg = require(packagePath);
		return (pkg.devDependencies?.['react-relay'] || '18.2.0').replace(
			'^',
			'',
		);
	} catch {
		return '18.2.0';
	}
};*/
const getReactVersion = () => {
	try {
		const packagePath = path.join(PROJECT_ROOT, 'package.json');
		const pkg = require(packagePath);
		return (pkg.dependencies?.react || '19').replace('^', '');
	} catch {
		return '19';
	}
};
const gduEntryPath = join(GDU_ROOT, 'entry');

const ourCodePaths = [
	join(gduEntryPath, '/client/spa'),
	...getGuruConfig().srcPaths.map((item) => join(PROJECT_ROOT, item)),
	CALLING_WORKSPACE_ROOT && join(CALLING_WORKSPACE_ROOT, 'packages'),
	/@autoguru[/\\]/,
].filter(Boolean);

const fileMask = '[name]-[contenthash:8]';
const getExternals = (standalone?: boolean) => {
	//const relayVersion = getRelayVersion();
	const reactVersion = getReactVersion();
	return standalone
		? {}
		: {
				react: `https://esm.sh/react@${reactVersion}`,
				'react-dom': `https://esm.sh/react-dom@${reactVersion}`,
				'react-dom/client': `https://esm.sh/react-dom@${reactVersion}/client`,
				'react/jsx-runtime': `https://esm.sh/react@${reactVersion}/jsx-runtime`,
				/*'react-relay': `https://esm.sh/react-relay@${relayVersion}`,
				'relay-runtime': `https://esm.sh/relay-runtime@${relayVersion}`,*/
			};
};

export const baseOptions = ({
	buildEnv,
	isMultiEnv,
	standalone,
	isDebug = false,
}: {
	buildEnv: string;
	isMultiEnv: boolean;
	standalone?: boolean;
	isDebug?: boolean;
	// eslint-disable-next-line sonarjs/cognitive-complexity
}): Configuration => {
	const guruConfig = getGuruConfig();
	const withBabelDebug = process.env.BABEL_DEBUG === 'true';
	return {
		context: PROJECT_ROOT,
		mode: 'production',
		entry: {
			main: [join(gduEntryPath, 'spa', 'client.js')].filter(Boolean),
		},
		experiments: {
			layers: true,
			outputModule: true,
		},
		cache: {
			type: 'filesystem',
			cacheLocation: resolve(PROJECT_ROOT, '.build_cache', buildEnv),
			name: process.env.APP_ENV || 'default',
			allowCollectingMemory: false,
			buildDependencies: {
				// This makes all dependencies of this file - build dependencies
				config: [__filename],
			},
		},
		resolve: {
			preferRelative: true,
			fallback: {},
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
			minimize: true,
			concatenateModules: true,
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
						? {}
						: {
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
			moduleIds: 'deterministic',
			runtimeChunk: {
				name: 'runtime',
			},
			minimizer: [
				new TerserPlugin({
					parallel: true,
					minify: TerserPlugin.terserMinify,
					terserOptions,
				}),
			],
			usedExports: true,
			providedExports: true,
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
										envName: 'production',
										...hooks.babelConfig.call(
											require('../babel-config/production')(
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
										envName: 'production',
										presets: [
											[
												require.resolve(
													'@babel/preset-env',
												),
												{
													debug: withBabelDebug,
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
			].filter(Boolean),
		},
		devtool: 'source-map',
		plugins: [
			new IgnorePlugin({
				checkResource(resource) {
					return /(\/next\/)/.test(resource);
				},
			}),
			new CleanWebpackPlugin(),
			new DefinePlugin({
				'process.__browser__': JSON.stringify(true),
				'process.env.NODE_ENV': JSON.stringify('production'),
				'process.env.NODE_DEBUG': JSON.stringify(false),
				'process.env.browser': JSON.stringify(true),
				'process.env.nextTick': (callback) => setTimeout(callback, 0),
				'global.Writable': 'require("stream").Writable',

				__DEV__: JSON.stringify(false),
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
				minify: true,
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
						`.env.${process.env.APP_ENV || buildEnv}`,
					),
					prefix: 'process.env.',
					ignoreStub: true,
				}),
			]),
			new GuruBuildManifest({
				mountDOMId: guruConfig.mountDOMId,
				mountDOMClass: guruConfig.mountDOMClass,
				frameless: guruConfig.frameless,
				outputDir:
					!isMultiEnv && buildEnv === 'prod'
						? resolve(PROJECT_ROOT, 'dist')
						: resolve(PROJECT_ROOT, 'dist', buildEnv),
				includeChunks: true,
			}),
			new SourceMapDevToolPlugin({
				exclude: standalone
					? [/.css.ts$/, frameworkRegex]
					: [/.css.ts$/],
				test: [/.ts$/, /.tsx$/],
			}),
			process.env.ANALYZE === 'true' &&
				new BundleAnalyzerPlugin({
					analyzerMode: 'static',
					reportFilename: 'bundle-report.html',
					openAnalyzer: false,
				}),
		].filter(Boolean),
		target: 'es2020',
		output: {
			path: guruConfig.outputPath,
			publicPath: '/',
			filename: `${fileMask}.js`,
			chunkFilename: `chunks/${fileMask}.js`,
			hashFunction: 'sha256',
			crossOriginLoading: 'anonymous',
			sourceMapFilename: 'sourceMaps/[file].map',
			pathinfo: false,
			chunkFormat: undefined,
			module: true,
			library: { type: 'module' },
			environment: {
				arrowFunction: true,
				const: true,
				destructuring: true,
				dynamicImport: true,
				module: true,
			},
		},
		externalsType: 'module',
		externals: getExternals(standalone),
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

export const makeWebpackConfig = (
	buildEnv: BuildEnv,
	isMultiEnv: boolean,
	standalone?: boolean,
): {
	name: 'dev' | 'test' | 'uat' | 'preprod' | 'prod' | 'dockerprod' | string;
	output: {
		path: string;
		publicPath: string;
		filename: string;
		chunkFilename: string;
		hashFunction: string;
		crossOriginLoading: string;
		sourceMapFilename: string;
		pathinfo: boolean;
	};
	externalsType: string;
	externals:
		| object
		| { react: string; 'react-dom': string }
		| {
				react: string;
				'react-dom/client': string;
				'react/jsx-runtime': string;
		  };
} => {
	const { outputPath, isTenanted } = getGuruConfig();
	return {
		name: buildEnv,
		output: {
			path: `${outputPath}/${
				!isMultiEnv && buildEnv === 'prod' ? '' : buildEnv
			}`,
			publicPath: getPublicPath({
				buildEnv,
				isDev: false,
				projectFolderName: getProjectFolderName(),
				isTenanted,
			}),
			filename: `${fileMask}.js`,
			chunkFilename: `chunks/${fileMask}.js`,
			hashFunction: 'sha256',
			crossOriginLoading: 'anonymous',
			sourceMapFilename: 'sourceMaps/[file].map',
			pathinfo: false,
			//@ts-ignore
			module: true,
			library: {
				type: 'module',
			},
			environment: {
				module: true,
			},
		},
		externalsType: 'module',
		externals: getExternals(standalone),
	};
};
