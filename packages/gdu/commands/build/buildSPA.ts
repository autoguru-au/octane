import * as process from 'node:process';

import { cyan, magenta } from 'kleur';
import webpack, { Configuration } from 'webpack';

import makeWebpackConfig from '../../config/webpack';
import { GuruConfig } from '../../lib/config';
import { run } from '../../lib/runWebpack';
import { getHooks } from '../../utils/hooks';

export const buildSPA = async (guruConfig: GuruConfig, analyze: boolean) => {
	const hooks = getHooks();

	const withBabelDebug = process.env.BABEL_DEBUG === 'true';
	console.log(
		`${cyan('Building SPA...')}${withBabelDebug ? magenta(' BABEL DEBUG MODE') : ''}`,
	);
	// eslint-disable-next-line unicorn/prefer-prototype-methods
	const webpackConfigs: Configuration[] = hooks.webpackConfig.call(
		makeWebpackConfig({
			env: void 0,
			isDebug: false,
			standalone: guruConfig?.standalone,
			analyze,
			withBabelDebug,
		}),
	);

	const compiler = webpack(webpackConfigs);
	run(compiler);

	return {
		artifactPath: guruConfig.outputPath,
	};
};
