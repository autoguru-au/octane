import { createLogger } from '@autoguru/utilities';
import { blue, cyan, dim } from 'kleur';

import { run } from '../../config/ssr/server';
import { isEnvProduction } from '../../lib/misc';
import { getHooks } from '../../utils/hooks';

const debug = require('debug')('gdu:commands:start:ssr');

const log = createLogger('server');

export const runNextJS = async guruConfig => {
	const port = guruConfig.port ?? 8080;

	debug('next start %o', { port });

	const hooks = getHooks();

	if (!isEnvProduction())
		hooks.beforeServer.tap('runner', () => {
			console.log(`${cyan('Starting dev server...')}`);
		});

	hooks.afterServer.tap('runner', server => {
		server.listen(guruConfig.port ?? 8080, err => {
			if (err) throw err;

			if (isEnvProduction()) {
				log.info('Started accepting requests...');
			} else {
				console.log(
					`${dim('Listening')}: ${blue(`http://localhost:${port}/`)}`,
				);
			}
		});
	});

	await run();
};
