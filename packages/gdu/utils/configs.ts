import findUp from 'find-up';

import { APP_ENV } from '../gdu';

export const getBuildEnvs = (env: APP_ENV) =>
	env ? [env] : ['uat', 'preprod', 'dockerprod', 'prod', 'shared'];
export const getConfigsDirs = () =>
	[
		findUp.sync('.gdu_config', { type: 'directory' }),
		findUp.sync('.gdu_app_config', { type: 'directory' }),
	].filter(Boolean);
