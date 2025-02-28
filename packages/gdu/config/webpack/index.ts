import { Configuration } from 'webpack';

import { isProductionBuild } from '../../lib/misc';
import { getBuildEnvs } from '../../utils/configs';

import { baseOptions, makeWebpackConfig } from './webpack.config';
import {
	baseDevelopmentOptions,
	makeWebpackDevelopmentConfig,
} from './webpack.development.config';

export interface WebpackConfigOpts {
	env: string;
	isDebug?: boolean;
	standalone?: boolean;
}

export default (options: WebpackConfigOpts): Configuration[] => {
	const { env = process.env.APP_ENV, isDebug = false, standalone } = options;
	const isProduction = isProductionBuild();
	const buildEnvs = getBuildEnvs(env);

	if (isProduction) {
		const isMultiEnv = buildEnvs.length > 1;
		return buildEnvs.map((buildEnv) => ({
			...baseOptions({
				buildEnv,
				isMultiEnv,
				isDebug,
				standalone,
			}),
			...makeWebpackConfig(buildEnv, isMultiEnv, standalone),
		})) as Configuration[];
	} else {
		const buildEnv = env || 'dev_au';

		return [
			{
				...baseDevelopmentOptions({
					buildEnv,
					isMultiEnv: false,
					standalone,
					isDebug,
				}),
				...makeWebpackDevelopmentConfig(buildEnv, false),
			},
		];
	}
};
