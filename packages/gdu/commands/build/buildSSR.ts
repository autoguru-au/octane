import { join } from 'path';

import { createLogger } from '@autoguru/utilities';
import execa from 'execa';
import { blue, dim } from 'kleur';

import { GuruConfig } from '../../lib/config';
import { GDU_ROOT, PROJECT_ROOT } from '../../lib/roots';

const logger = createLogger('build');
export const buildSSR = async (guruConfig: GuruConfig) => {
	const start = Date.now();
	execa
		.command(`next build --profile`, {
			stdio: 'inherit',
			cwd: PROJECT_ROOT,
			localDir: GDU_ROOT,
		})
		.then(
			(result) => {
				console.log(
					`${dim('SUCCESS!')}`,
					`${dim('Listening')}: ${blue(result?.all)}`,
				);
			},
			(error) => {
				logger.error('response', {
					processingTime: Date.now() - start,
					responseHeaders: Object.fromEntries(
						Object.entries(error.getHeaders()),
					),
					url: 'incomingPath',
					statusCode: error.statusCode,
				});
				throw error;
			},
		);

	return {
		artifactPath: join(guruConfig.outputPath, 'BUILD_ID'),
	};
};
