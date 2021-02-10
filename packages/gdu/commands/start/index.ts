import { diary } from 'diary';
import { banner } from '../../lib/banner';
import { getGuruConfig, GuruConfig } from '../../lib/config';
import { isEnvProduction } from '../../lib/misc';
import { PROJECT_ROOT } from '../../lib/roots';

const { debug } = diary('gdu:commands:start');

export default async ({ port: incomingPort, env: configEnvironment }) => {
	debug('running action with %O', { port: incomingPort });

	const { port = incomingPort, ...otherConfig } =
		getGuruConfig(PROJECT_ROOT) || ({} as any);

	const resolvedConfig: GuruConfig = { port, ...otherConfig };

	if (!isEnvProduction()) banner('Starting');

	if (resolvedConfig?.type === 'ssr') {
		const runSSR = await import('./runSSR');
		await runSSR.runNextJS(resolvedConfig);
	} else if (resolvedConfig?.type === 'spa') {
		const runSPA = await import('./runSPA');
		await runSPA.runSPA(resolvedConfig, configEnvironment);
	}
};
