import browsers from 'browserslist-config-autoguru';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { join } from 'path';
import TreatPlugin from 'treat/webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';

import { getGuruConfig } from '../lib/config';
import { isEnvProduction } from '../lib/misc';
import { CALLING_WORKSPACE_ROOT, PROJECT_ROOT } from '../lib/roots';
import { getHooks } from '../utils/hooks';

export const createNextJSConfig = () => {
	const hooks = getHooks();
	const isDev = !isEnvProduction();

	const nextJsConfig = {
		poweredByHeader: false,
		generateEtags: false,

		pageExtensions: ['tsx', 'ts'],

		assetPrefix: getGuruConfig()?.publicPath,

		publicRuntimeConfig: {},

		webpack(originalConfig: Configuration, nextConfig) {
			const guruConfig = getGuruConfig();

			const ourCodePaths = [
				...guruConfig?.srcPaths.map((item) => join(PROJECT_ROOT, item)),
				CALLING_WORKSPACE_ROOT &&
					join(CALLING_WORKSPACE_ROOT, 'packages'),
				/@autoguru[\\/]/,
			].filter(Boolean);

			originalConfig.resolve.alias['@babel/runtime-corejs2'] =
				'@babel/runtime-corejs3';
			originalConfig.resolve.plugins.push(new TsconfigPathsPlugin());

			// Yes... sadly next does some silly things.
			originalConfig.plugins.push(
				new (class {
					apply(compiler) {
						// TODO: Abstract this, to mimic the same as what SPA webpack builds have
						compiler.options.plugins.push(
							new DefinePlugin({
								__DEV__: JSON.stringify(isDev),
							}),
							new TreatPlugin({
								outputCSS: !nextConfig.isServer,
								outputLoaders: [
									!isDev &&
										!nextConfig.isServer && {
											loader: MiniCssExtractPlugin.loader,
										},
									isDev &&
										!nextConfig.isServer && {
											loader: require.resolve(
												'style-loader',
											),
										},
								].filter(Boolean),
								minify: !isDev,
								browsers,
							}),
						);

						console.assert(
							compiler.options.module.rules[0].use.loader ===
								'next-babel-loader',
							'Module rules [0] isnt next-babel-loader',
						);

						const origBabel = compiler.options.module.rules[0];

						compiler.options.module.rules[0] = {
							...origBabel,
							include: [...origBabel.include, ...ourCodePaths],
							exclude(path) {
								const orig = origBabel?.exclude(path);

								return orig
									? !ourCodePaths.some((r) => {
											if (r instanceof RegExp) {
												return r.test(path);
											}

											return path.includes(r);
									  })
									: false;
							},
							use: {
								loader: require.resolve('babel-loader'),
								options: {
									babelrc: false,
									...hooks.babelConfig.call(
										require('./babel.config')(guruConfig),
									),
								},
							},
						};
					}
				})(),
			);

			return hooks.webpackConfig.call(originalConfig);
		},
	};

	return hooks.nextJSConfig.call(nextJsConfig);
};
