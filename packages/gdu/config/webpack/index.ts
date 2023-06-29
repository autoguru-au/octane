import { Configuration } from 'webpack';

import { getBuildEnvs } from '../../utils/configs';

import { baseOptions, makeWebpackConfig } from './webpack.config';

const buildConfigs = (env = process.env.APP_ENV, isDebug): Configuration[] => {
	const buildEnvs = getBuildEnvs(env);
	return buildEnvs.map((buildEnv) => ({
		...baseOptions(buildEnv, buildEnvs.length > 1, isDebug),
		...makeWebpackConfig(buildEnv, buildEnvs.length > 1),
	}));
};

export default buildConfigs;
