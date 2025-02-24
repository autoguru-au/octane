import { Configuration } from 'webpack';

import { getBuildEnvs } from '../../utils/configs';

import { baseOptions, makeWebpackConfig } from './webpack.config';

const buildConfigs = ({
	env = process.env.APP_ENV,
	isDebug,
	standalone = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production',
}: {
	env?: string;
	isDebug: boolean;
	standalone?: boolean;
}): Configuration[] => {
	const buildEnvs = getBuildEnvs(env);
	// @ts-ignore
	return buildEnvs.map((buildEnv) => ({
		...baseOptions({
			buildEnv,
			isMultiEnv: buildEnvs.length > 1,
			isDebug,
			standalone,
		}),
		...makeWebpackConfig(buildEnv, buildEnvs.length > 1, standalone),
	}));
};

export default buildConfigs;
