import { join } from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration } from 'webpack';

import { getGuruConfig } from '../lib/config';
import { CALLING_WORKSPACE_ROOT, PROJECT_ROOT } from '../lib/roots';
import { getHooks } from '../utils/hooks';
import { makeSassLoader } from './webpack/blocks/styles';

export const createNextJSConfig = () => {
	const hooks = getHooks();

	const nextJsConfig = {
		poweredByHeader: false,
		generateEtags: false,

		pageExtensions: ['tsx', 'ts'],

		assetPrefix: getGuruConfig()?.publicPath ?? '',

		publicRuntimeConfig: {},

		webpack(originalConfig: Configuration, nextConfig) {
			const guruConfig = getGuruConfig();

			(originalConfig.module.rules[0].include as any[]).unshift(
				...guruConfig?.srcPaths.map(item => join(PROJECT_ROOT, item)),
				CALLING_WORKSPACE_ROOT &&
					join(CALLING_WORKSPACE_ROOT, 'packages'),
				/@autoguru[\\/]/,
			);

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

						console.assert(
							compiler.options.module.rules[1].use.loader ===
								'next-babel-loader',
							'Module rules [1] isnt next-babel-loader',
						);

						compiler.options.module.rules[1].use = {
							loader: require.resolve('babel-loader'),
							options: {
								babelrc: false,
								...hooks.afterBabelConfig.call(
									require('../config/babel.config')(
										guruConfig,
									),
								),
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
