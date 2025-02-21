import { Configuration } from 'webpack';

import { getBuildEnvs } from '../../utils/configs';

import { baseOptions, makeWebpackConfig } from './webpack.config';

const buildConfigs = (
	env = process.env.APP_ENV,
	isDebug: boolean,
	standalone: boolean = true,
): Configuration[] => {
	const buildEnvs = getBuildEnvs(env);
	return buildEnvs.map((buildEnv) => ({
		...baseOptions(buildEnv, buildEnvs.length > 1, isDebug, standalone),
		...makeWebpackConfig(buildEnv, buildEnvs.length > 1, standalone),
	}));
};

export default buildConfigs;
