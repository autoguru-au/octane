import fs from 'fs';
import * as path from 'path';

import {
	camelCaseToUpperSnakeCase,
	getInterfaceKeys,
} from '../../lib/globalConfigs';

export default async () => {
	console.log('Global config generate configs files started');
	const tokensFile = path.resolve(
		'packages',
		'global-configs',
		'processEnvs.d.ts',
	);
	const keys = await getInterfaceKeys(tokensFile);
	if (!keys) {
		console.log('No keys found');
		return;
	}

	const createTokenFile = (key: string) => {
		const fileName = `${camelCaseToUpperSnakeCase(key)}.ts`;
		const fileContent =
			`//Exported value for process.env.${key}\n` +
			`//Always use values exported from this package instead of process.env.XXX directly\n` +
			`export default process.env.${key};\n`;
		const filePath = path.join(
			'packages',
			'global-configs',
			'configs',
			fileName,
		);

		fs.writeFileSync(filePath, fileContent, 'utf8');
	};

	const createIndexFile = (keys: string[]) => {
		const content = keys
			.map((key) => {
				const upperSnakeCaseKey = camelCaseToUpperSnakeCase(key);
				return `export { default as ${upperSnakeCaseKey} } from './${upperSnakeCaseKey}';`;
			})
			.join('\n');

		const indexFilePath = path.join(
			'packages',
			'global-configs',
			'configs',
			'index.ts',
		);

		fs.writeFileSync(indexFilePath, content, 'utf8');
	};

	for (const key of keys) {
		createTokenFile(key as string);
	}
	createIndexFile(keys as string[]);
	console.log('Global config generate configs files finished');
};
