import webpack, { Configuration } from 'webpack';

import makeWebpackConfig from '../../config/webpack';
import { GuruConfig } from '../../lib/config';
import { run } from '../../lib/runWebpack';
import { getHooks } from '../../utils/hooks';

export const buildWebComponents = async (guruConfig: GuruConfig) => {
	const hooks = getHooks();

	// eslint-disable-next-line unicorn/prefer-prototype-methods
	const webpackConfigs: Configuration[] = hooks.webpackConfig.call(
		makeWebpackConfig(guruConfig),
	);

	console.log(webpackConfigs);
	const compiler = webpack(webpackConfigs);
	run(compiler);

	return {
		artifactPath: guruConfig.outputPath,
	};
};
