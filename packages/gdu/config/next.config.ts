/* eslint-disable unicorn/prefer-prototype-methods */
import { join } from 'path';

import browsers from 'browserslist-config-autoguru';
import { getClientStyleLoader } from 'next/dist/build/webpack/config/blocks/css/loaders/client';
import { TreatPlugin } from 'treat/webpack-plugin';
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
				/@autoguru[/\\]/,
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
									!nextConfig.isServer
										? getClientStyleLoader({
												isDevelopment: isDev,
												assetPrefix:
													nextConfig.config
														.assetPrefix,
										  })
										: '',
								],
								minify: !isDev,
								browsers,
							}),
						);

						const oldLoader = compiler.options.module.rules[0];

						const babelConfig = hooks.babelConfig.call(
							// eslint-disable-next-line unicorn/prefer-module
							require('./babel.config')(guruConfig),
						);

						// Have to rip out react-refresh due to treat
						let use = oldLoader.use;
						if (Array.isArray(use)) {
							use = use[1];
						}
						use.options = {
							...use.options,
							hasReactRefresh: false,
							overrides: [babelConfig],
						};

						compiler.options.module.rules[0] = {
							...oldLoader,
							include: [...oldLoader.include, ...ourCodePaths],
							exclude(path) {
								const orig =
									oldLoader === null || oldLoader === void 0
										? void 0
										: oldLoader.exclude(path);
								return orig
									? !ourCodePaths.some((r) => {
											if (r instanceof RegExp) {
												return r.test(path);
											}
											return path.includes(r);
									  })
									: false;
							},
							use,
						};
					}
				})(),
			);

			return hooks.webpackConfig.call(originalConfig);
		},
	};

	return hooks.nextJSConfig.call(nextJsConfig);
};
