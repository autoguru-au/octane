import findUp from 'find-up';

export const getBuildEnvs = () =>
	process.env.APP_ENV
		? [process.env.APP_ENV]
		: ['dev', 'uat', 'test', 'preprod', 'prod'];
export const getConfigsDirs = () =>
	[
		findUp.sync('.gdu_config', { type: 'directory' }),
		findUp.sync('.gdu_app_config', { type: 'directory' }),
	].filter(Boolean);

export const getBuildFolder = () =>
	[
		findUp.sync('.gdu_config', { type: 'directory' }),
		findUp.sync('.gdu_app_config', { type: 'directory' }),
	].filter(Boolean);
