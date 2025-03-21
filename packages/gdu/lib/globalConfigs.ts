import fs from 'fs';
import { join } from 'path';

import { register } from 'ts-node';

import { PROJECT_ROOT } from './roots';

export const getTokens = async () => {
	register();

	const tokensFile = join(
		PROJECT_ROOT,
		'packages/global-configs/__generated__/tokens.ts',
	);
	const fileTokens = await import(tokensFile);
	return fileTokens.TOKENS;
};

export const getInterfaceKeys = async (filePath: string) => {
	// eslint-disable-next-line unicorn/text-encoding-identifier-case
	const fileContent: string = fs.readFileSync(filePath, 'utf-8');

	type ProcessEnvs = any;

	const regex = /readonly\s+(\w+):/g;
	let match: RegExpExecArray | null;
	const keys: (keyof ProcessEnvs)[] = [];

	while ((match = regex.exec(fileContent)) !== null) {
		keys.push(match[1] as keyof ProcessEnvs);
	}
	return keys;
};

export const camelCaseToUpperSnakeCase = (str: string) => {
	return str
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // Detects consecutive uppercase letters followed by uppercase + lowercase
		.replace(/([a-z])([A-Z])/g, '$1_$2') // Detects changes from lowercase to uppercase
		.toUpperCase();
};
