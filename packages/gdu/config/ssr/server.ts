import { createLogger } from '@autoguru/utilities';
import { GDU_ROOT, PROJECT_ROOT } from '../../lib/roots';
import execa from 'execa';
import { blue, dim } from 'kleur';

const logger = createLogger('server');

export const run = async (port: number) => {
	const start = Date.now();
	execa.command(
		`next dev -p ${port}`,
		{
			stdio: 'inherit',
			cwd: PROJECT_ROOT,
			localDir: GDU_ROOT,
		},
	).then(() => {
		console.log(
			`${dim('Listening')}: ${blue(`http://localhost:${port}/`)}`,
		);
	}, (error) => {
		logger.error('response', {
			processingTime: Date.now() - start,
			responseHeaders: Object.fromEntries(
				Object.entries(error.getHeaders()),
			),
			url: 'incomingPath',
			statusCode: error.statusCode,
		});
		throw error;
	});
};
