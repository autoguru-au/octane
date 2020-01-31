import { PROJECT_ROOT } from './roots';
import { dirname } from 'path';
import findRecursive from 'recursive-readdir';

export const getApps = async () => {
	const files = await findRecursive(PROJECT_ROOT, ['*node_modules*']);

	return files
		.filter(file => file.endsWith('guru.config.js'))
		.map(configLocation => dirname(configLocation));
};
