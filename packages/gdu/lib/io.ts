import { diary } from 'diary';
import mkdirp from 'mkdirp';
import { writeFile } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { promisify } from 'node:util';

import { PROJECT_ROOT } from './roots';

const { debug } = diary('gdu:io');

export const mkdirpAsync = mkdirp;

const writeFileAsyncFn = promisify(writeFile);
export const writeFileAsync = async (fileName, body) => {
	await mkdirpAsync(dirname(fileName));

	return writeFileAsyncFn(fileName, body);
};

export const writeFileMap = async (
	writeFiles: Map<string, string | Buffer>,
	base = '',
) => {
	for (const [name, body] of writeFiles) {
		const fileName = join(base, name);
		debug('writing file %s', relative(PROJECT_ROOT, fileName));
		await writeFileAsync(fileName, body);
	}
};
