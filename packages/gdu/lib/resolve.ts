import module from 'node:module';
import { join, resolve } from 'node:path';

import { PROJECT_ROOT } from './roots';

export const resolvePathFromCaller = (file) =>
	resolve(join(PROJECT_ROOT, file));

export const requireFromCaller = module.createRequire(
	join(PROJECT_ROOT, 'node_modules'),
);
