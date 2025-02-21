import { Configuration } from 'webpack';

import { getBuildEnvs } from '../../utils/configs';

import { baseOptions, makeWebpackConfig } from './webpack.config';

const buildConfigs = ({
	env = process.env.APP_ENV,
	isDebug,
	standalone = true,
	analyze = false,
	withBabelDebug = false,
}: {
	env?: string;
	isDebug: boolean;
	withBabelDebug: boolean;
	standalone?: boolean;
	analyze?: boolean;
}): Configuration[] => {
	const buildEnvs = getBuildEnvs(env);
	return buildEnvs.map((buildEnv) => ({
		...baseOptions({
			buildEnv,
			isMultiEnv: buildEnvs.length > 1,
			isDebug,
			standalone,
			analyze,
			withBabelDebug,
		}),
		...makeWebpackConfig(buildEnv, buildEnvs.length > 1, standalone),
	}));
};

export default buildConfigs;
