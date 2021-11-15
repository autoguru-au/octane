//import { createLogger } from '@autoguru/utilities';
import execa from 'execa';
import { diary } from 'diary';
import { blue, cyan, dim } from 'kleur';

//import { run } from '../../config/ssr/server';
import { isEnvProduction } from '../../lib/misc';
import { GDU_ROOT, PROJECT_ROOT } from '../../lib/roots';
//import { getHooks } from '../../utils/hooks';
//import { resolvePathFromCaller } from '../../lib/resolve';
//import { GDU_ROOT, PROJECT_ROOT } from '../../lib/roots';

const { debug } = diary('gdu:commands:start:ssr');

//const log = createLogger('server');

export const runNextJS = async (guruConfig) => {
	const port = guruConfig.port ?? 8080;

	debug('next start %o', { port });

	//const hooks = getHooks();

	if (!isEnvProduction()) {
		//hooks.beforeServer.tap('runner', () => {
			console.log(`${cyan('Starting dev server...')}`);
		//});
		execa.command(
			`next dev -p ${port}`,
			{
				stdio: 'inherit',
				cwd: PROJECT_ROOT,
				localDir: GDU_ROOT,
			},
		).then(()=> console.log(
			`${dim('Listening')}: ${blue(`http://localhost:${port}/`)}`,
		), (error)=> {
			throw error;
		});

	}

	/*hooks.afterServer.tap('runner', (server) => {
		server.listen(guruConfig.port ?? 8080, (err) => {
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

	await run();*/
};
