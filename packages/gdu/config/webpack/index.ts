import { Configuration } from 'webpack';

import { getBuildEnvs } from '../../utils/configs';

// eslint-disable-next-line import/extensions
import { baseOptions, makeWebpackConfig } from './webpack.config';

const buildConfigs = (
	env = process.env.APP_ENV,
	isDebug: boolean,
	tenant?: string,
	standalone?: boolean,
): Configuration[] => {
	const buildEnvs = getBuildEnvs(env);
	return buildEnvs.map((buildEnv) => ({
		...baseOptions(buildEnv, buildEnvs.length > 1, isDebug, standalone),
		...makeWebpackConfig(
			buildEnv,
			buildEnvs.length > 1,
			tenant,
			standalone,
		),
	}));
};

export default buildConfigs;
