import { Configuration } from 'webpack';

import { GuruConfig } from '../../lib/config';
import { getBuildEnvs } from '../../utils/configs';

import { baseOptions, makeWebpackConfig } from './webpack.config';
import { makeWebComponentsWebpackConfig } from './webpack.webcomponents.config';

const buildConfigs = (guruConfig: GuruConfig): Configuration[] => {
	if (guruConfig?.type === 'web-component') {
		return [makeWebComponentsWebpackConfig('TEST_WEB_COMPONENTS')];
	} else {
		const buildEnvs = getBuildEnvs();
		return buildEnvs.map((buildEnv) => ({
			...baseOptions(buildEnv, buildEnvs.length > 1),
			...makeWebpackConfig(buildEnv, buildEnvs.length > 1),
		}));
	}
};

export default buildConfigs;
