import { diary } from 'diary';

import { banner } from '../../lib/banner';
import { getGuruConfig, GuruConfig } from '../../lib/config';
import { isProductionBuild } from '../../lib/misc';
import { PROJECT_ROOT } from '../../lib/roots';
import { buildSupportedBrowsers } from '../generateBrowsers';

const { debug } = diary('gdu:commands:start');

export default async ({ port: incomingPort /*env: configEnvironment*/ }) => {
	debug('running action with %O', { port: incomingPort });

	const { port = incomingPort, ...otherConfig } =
		getGuruConfig(PROJECT_ROOT) || ({} as any);

	const resolvedConfig: GuruConfig = { port, ...otherConfig };

	await buildSupportedBrowsers();

	if (!isProductionBuild()) banner('Starting');

	if (resolvedConfig?.type === 'ssr') {
		const runSSR = await import('./runSSR');
		await runSSR.runNextJS(resolvedConfig);
	} else if (resolvedConfig?.type === 'spa') {
		const runSPA = await import('./runSPA');
		await runSPA.runSPA(resolvedConfig /*, configEnvironment*/);
	} else if (resolvedConfig?.type === 'web-component') {
		const runWebComponents = await import('./runWebComponents');
		await runWebComponents.runWebComponents(resolvedConfig /*, configEnvironment*/);
	}
};
