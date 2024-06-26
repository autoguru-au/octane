import webpack, { Configuration } from 'webpack';

// eslint-disable-next-line import/extensions
import { makeWebComponentsWebpackConfig } from '../../config/webpack/webpack.webcomponents.config';
import { GuruConfig } from '../../lib/config';
import { run } from '../../lib/runWebpack';
import { getHooks } from '../../utils/hooks';

export const buildWebComponents = async (guruConfig: GuruConfig) => {
	const hooks = getHooks();

	// eslint-disable-next-line unicorn/prefer-prototype-methods
	const webpackConfigs: Configuration[] = hooks.webpackConfig.call(
		makeWebComponentsWebpackConfig(
			guruConfig.type || 'web-components',
			false,
		),
	);

	const compiler = webpack(webpackConfigs);
	run(compiler);

	return {
		artifactPath: guruConfig.outputPath,
	};
};
