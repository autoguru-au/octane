/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-prototype-methods */
import { readdirSync } from 'fs';
import { join, resolve } from 'path';

import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';
import browsers from 'browserslist-config-autoguru';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import envCI from 'env-ci';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
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

import { getGuruConfig, getProjectName } from '../../lib/config';
import { isProductionBuild } from '../../lib/misc';
import { CALLING_WORKSPACE_ROOT, PROJECT_ROOT } from '../../lib/roots';
import { getHooks } from '../../utils/hooks';

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
		passes: 2,
		pure_getters: true,
		module: true,
	},
	format: {
		ecma: 2020,
		comments: false,
	},
	mangle: true,
};
const hooks = getHooks();

const frameworkRegex =
	/(?<!node_modules.*)[/\\]node_modules[/\\](react|react-dom|scheduler|prop-types|use-subscription|relay-runtime|react-relay)[/\\]/;

const ourCodePaths = [
	PROJECT_ROOT,
	...getGuruConfig().srcPaths.map((item) => join(PROJECT_ROOT, item)),
	CALLING_WORKSPACE_ROOT && join(CALLING_WORKSPACE_ROOT, 'packages'),
	/@autoguru[/\\]/,
].filter(Boolean);

const { outputPath } = getGuruConfig();

const getDirectories = (source) =>
	readdirSync(source, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

const getComponentPaths = (): Array<{
	name: string;
	path: string | any;
}> =>
	getGuruConfig().srcPaths.flatMap((current) =>
		getDirectories(join(PROJECT_ROOT, current)).map((dir) => ({
			name: dir,
			path: join(PROJECT_ROOT, current, dir),
		})),
	);

const buildCssLayersFromEntryPoints = () => {
	return getComponentPaths().map(({ name: elementName }) => ({
		issuerLayer: elementName,
		use: [
			{
				loader: require.resolve('style-loader'),
				options: {
					injectType: 'singletonStyleTag',
					attributes: {
						'data-style-for': elementName,
					},
					insert: async (styleTag) => {
						const styleTarget = styleTag.dataset.styleFor;
						const undefinedElements = Array.from(
							document.querySelectorAll(
								`${styleTarget}:not(:defined)`,
							),
						);
						const promises = [...undefinedElements].map((button) =>
							customElements.whenDefined(button.localName),
						);
						// Wait for all the instances to be upgraded
						await Promise.all(promises);
						undefinedElements.forEach((element) => {
							const parent = element.shadowRoot;
							if (parent) parent.append(styleTag);
						});
					},
				},
			},
			'css-loader',
		],
	}));
};

export const makeWebComponentsWebpackConfig = (
	name: string,
	isDev = false,
	isDebug = false,
): Configuration => {
	const fileMask = isDev ? '[name]' : '[name]-[contenthash:8]';

	return {
		name,
		context: PROJECT_ROOT,
		mode: isDev ? 'development' : 'production',
		entry: getComponentPaths().reduce(
			(map, item) => ({
				...map,
				[item.name]: {
					import: item.path,
					layer: item.name,
				},
			}),
			{},
		),
		output: {
			path: outputPath,
			publicPath: '/',
			filename: '[name].js',
			chunkFilename: `chunks/${fileMask}.js`,
			hashFunction: 'sha256',
			crossOriginLoading: 'anonymous',
			sourceMapFilename: 'sourceMaps/[file].map',
			pathinfo: false,
			library: {
				type: 'module',
			},
		},
		experiments: {
			layers: true,
			outputModule: true,
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
					minify: TerserPlugin.terserMinify,
					terserOptions,
				}),
			],
		},
		module: {
			strictExportPresence: true,
			rules: [
				{
					test: /\.vanilla\.css$/i, // Targets only CSS files generated by vanilla-extract
					oneOf: buildCssLayersFromEntryPoints(),
				},
				{
					test: /^((?!\.vanilla)[\S\s])*\.css$/i, // Targets only CSS that is not vanilla css
					use: ['style-loader', 'css-loader'],
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
				__NO_SHADOW__: false,
				__DEV__: JSON.stringify(isDev),
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
			new SourceMapDevToolPlugin({
				test: [/.ts$/, /.tsx$/],
				exclude: [/.css.ts$/, frameworkRegex],
			}),
		].filter(Boolean),
		target: 'es2020',
	};
};
