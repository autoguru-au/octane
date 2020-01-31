import { banner } from '../../lib/banner';
import { getGuruConfig, GuruConfig } from '../../lib/config';
import { isEnvProduction } from '../../lib/misc';
import { PROJECT_ROOT } from '../../lib/roots';

const debug = require('debug')('gdu:commands:start');

export default async ({ port: incomingPort }) => {
	debug('running action with %O', { port: incomingPort });

	const { port = incomingPort, ...otherConfig } =
		getGuruConfig(PROJECT_ROOT) || ({} as any);

	const resolvedConfig: GuruConfig = { port, ...otherConfig };

	if (!isEnvProduction()) banner('Starting');

	if (resolvedConfig?.isSSR === true) {
		const runSSR = await import('./runSSR');
		await runSSR.runNextJS(resolvedConfig);
	} else if (
		typeof resolvedConfig?.isSSR === 'undefined' ||
		resolvedConfig?.isSSR === false
	) {
		const runSSR = await import('./runSPA');
		await runSSR.runSPA(resolvedConfig);
	}
};
