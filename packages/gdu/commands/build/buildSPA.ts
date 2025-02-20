import webpack, { Configuration } from 'webpack';

import makeWebpackConfig from '../../config/webpack';
import { GuruConfig } from '../../lib/config';
import { run } from '../../lib/runWebpack';
import { getHooks } from '../../utils/hooks';

export const buildSPA = async (guruConfig: GuruConfig, tenant: string) => {
	const hooks = getHooks();

	// eslint-disable-next-line unicorn/prefer-prototype-methods
	const webpackConfigs: Configuration[] = hooks.webpackConfig.call(
		makeWebpackConfig(void 0, false, guruConfig?.standalone),
	);

	const compiler = webpack(webpackConfigs);
	run(compiler);

	return {
		artifactPath: guruConfig.outputPath,
	};
};
