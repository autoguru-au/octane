import { join } from 'path';

import { createNextJSConfig } from '../../config/next.config';
import { GuruConfig } from '../../lib/config';
import { requireFromCaller } from '../../lib/resolve';
import { PROJECT_ROOT } from '../../lib/roots';

export const buildSSR = async (guruConfig: GuruConfig) => {
	const { default: nextBuild } = requireFromCaller('next/dist/build');

	await nextBuild(PROJECT_ROOT, {
		dev: false,
		quiet: true,
		...createNextJSConfig(),
	});

	return {
		artifactPath: join(guruConfig.outputPath, 'BUILD_ID'),
	};
};
