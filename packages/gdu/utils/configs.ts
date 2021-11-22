import findUp from 'find-up';

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
