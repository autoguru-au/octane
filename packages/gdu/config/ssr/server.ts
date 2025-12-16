import { createLogger } from '@autoguru/utilities';
import execa from 'execa';
import { blue, dim } from 'kleur';

import { isProductionBuild } from '../../lib/misc';
import { GDU_ROOT, PROJECT_ROOT } from '../../lib/roots';

const logger = createLogger('server');

export const run = async (port: number) => {
	const start = Date.now();
	execa
		.command(
			`next ${isProductionBuild() ? 'start' : 'dev'} -p ${port} --webpack`,
			{
				stdio: 'inherit',
				cwd: PROJECT_ROOT,
				localDir: GDU_ROOT,
			},
		)
		.then(
			() => {
				console.log(
					`${dim('Listening')}: ${blue(`http://localhost:${port}/`)}`,
				);
			},
			(error) => {
				logger.error('response', {
					processingTime: Date.now() - start,
					responseHeaders: Object.fromEntries(
						Object.entries(
							typeof error.getHeaders === 'function' &&
								error.getHeaders(),
						),
					),
					url: 'incomingPath',
					statusCode: error.statusCode,
				});
				throw error;
			},
		);
};
