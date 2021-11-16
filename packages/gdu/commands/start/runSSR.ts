import { diary } from 'diary';
import { cyan } from 'kleur';

import { run } from '../../config/ssr/server';
import { isEnvProduction } from '../../lib/misc';

const { debug } = diary('gdu:commands:start:ssr');

export const runNextJS = async (guruConfig) => {
	const port = guruConfig.port ?? 8080;
	debug('next start %o', { port });

	if (!isEnvProduction())
			console.log(`${cyan('Starting dev server...')}`);

	await run(port);
};
