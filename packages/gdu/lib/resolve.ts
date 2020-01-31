import module from 'module';
import { join, resolve } from 'path';

import { PROJECT_ROOT } from './roots';

export const resolvePathFromCaller = file => resolve(join(PROJECT_ROOT, file));

export const requireFromCaller = module.createRequire(
	join(PROJECT_ROOT, 'node_modules'),
);
