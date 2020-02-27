import { join } from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';

import { getGuruConfig } from '../lib/config';
import { isEnvProduction } from '../lib/misc';
import { CALLING_WORKSPACE_ROOT, PROJECT_ROOT } from '../lib/roots';
import { getHooks } from '../utils/hooks';
import { makeSassLoader } from './webpack/blocks/styles';

export const createNextJSConfig = () => {
	const hooks = getHooks();
	const isDev = !isEnvProduction();

	const nextJsConfig = {
		poweredByHeader: false,
		generateEtags: false,

		pageExtensions: ['tsx', 'ts'],

		assetPrefix: getGuruConfig()?.publicPath ?? '',

		publicRuntimeConfig: {},

		webpack(originalConfig: Configuration, nextConfig) {
			const guruConfig = getGuruConfig();

			const ourCodePaths = [
				...guruConfig?.srcPaths.map(item => join(PROJECT_ROOT, item)),
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
						compiler.options.module.rules = [
							{
								test: /\.scss$/,
								use: makeSassLoader({
									isServer: nextConfig.isServer,
								}),
							},
							...compiler.options.module.rules,
						];

						// TODO: Abstract this, to mimic the same as what SPA webpack builds have
						compiler.options.plugins.push(
							new DefinePlugin({
								__DEV__: JSON.stringify(isDev),
							}),
						);

						console.assert(
							compiler.options.module.rules[1].use.loader ===
								'next-babel-loader',
							'Module rules [1] isnt next-babel-loader',
						);

						const origBabel = compiler.options.module.rules[1];

						compiler.options.module.rules[1] = {
							...origBabel,
							include: [...origBabel.include, ...ourCodePaths],
							exclude(path) {
								const orig = origBabel?.exlucde(path);

								return orig
									? !ourCodePaths.some(r => {
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
									...hooks.afterBabelConfig.call(
										require('./babel.config')(guruConfig),
									),
								},
							},
						};
					}
				})(),
			);

			return hooks.afterWebpackConfig.call(originalConfig);
		},
	};

	return hooks.afterNextJSConfig.call(nextJsConfig);
};
