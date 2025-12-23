import * as fs from 'fs';
import * as path from 'path';

import { getInterfaceKeys } from '../../lib/globalConfigs';

export default async () => {
	console.log('Global config generate tokens started');

	const typeFilePath = path.resolve(
		'packages',
		'global-configs',
		'processEnvs.d.ts',
	);
	const keys = await getInterfaceKeys(typeFilePath);

	type ProcessEnvs = any;

	const TOKENS: Record<keyof ProcessEnvs, string | undefined> = keys.reduce(
		(acc, key) => {
			acc[key] = `process.env.${key.toString()}`;
			return acc;
		},
		{} as Record<keyof ProcessEnvs, string | undefined>,
	);

	const tokensContent: string = `/// <reference types="node" />

const TOKENS = ${JSON.stringify(
		TOKENS,
		null,
		2,
	).replace(/"process\.env\.(\w+)"/g, 'process.env.$1')};

module.exports = { TOKENS };
`;
	const tokensFilePath = path.resolve(
		'packages',
		'global-configs',
		'__generated__',
		'tokens.ts',
	);
	fs.writeFileSync(tokensFilePath, tokensContent);

	console.log('tokens.ts has been created with the TOKENS object.');
};
