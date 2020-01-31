import webpack, { Configuration } from 'webpack';

import { makeWebpackConfig } from '../../config/webpack/webpack.config';
import { GuruConfig } from '../../lib/config';
import { run } from '../../lib/runWebpack';
import { getHooks } from '../../utils/hooks';

export const buildSPA = async (guruConfig: GuruConfig) => {
	const hooks = getHooks();

	const webpackConfig: Configuration = hooks.afterWebpackConfig.call(
		makeWebpackConfig({
			isDevServer: false,
		}),
	);

	const compiler = webpack(webpackConfig);

	await run(compiler);

	return {
		artifactPath: guruConfig.outputPath,
	};
};
