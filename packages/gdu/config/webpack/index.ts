import { Configuration } from 'webpack';

import { isProductionBuild } from '../../lib/misc';
import { getBuildEnvs } from '../../utils/configs';

import { baseOptions, makeWebpackConfig } from './webpack.config';
import {
	baseDevelopmentOptions,
	makeWebpackDevelopmentConfig,
} from './webpack.development.config';

const isDev = !isProductionBuild();
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
		...(isDev ? baseDevelopmentOptions : baseOptions)({
			buildEnv,
			isMultiEnv: buildEnvs.length > 1,
			isDebug,
			standalone,
		}),
		...(!isDev &&
			makeWebpackConfig(buildEnv, buildEnvs.length > 1, standalone)),
		...(isDev &&
			makeWebpackDevelopmentConfig(buildEnv, buildEnvs.length > 1)),
	}));
};

export default buildConfigs;
