import { join } from 'path';

import { register } from 'ts-node';

import { PROJECT_ROOT } from './roots';


export const getTokens = async () => {
	register();

	const tokensFile = join(PROJECT_ROOT, 'packages/global-configs/__generated__/tokens.ts');
	const fileTokens = await import(tokensFile);
	return fileTokens.TOKENS

};
