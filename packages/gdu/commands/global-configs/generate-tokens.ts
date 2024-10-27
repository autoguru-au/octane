import * as fs from 'fs';
import * as path from 'path';
export default async () => {
	console.log('Global config generate tokens started');

	const typeFilePath = path.resolve( 'packages', 'global-configs', 'processEnvs.d.ts');
	const fileContent: string = fs.readFileSync(typeFilePath, 'utf-8');
	type ProcessEnvs = any;

	const regex = /readonly\s+(\w+):/g;
	let match: RegExpExecArray | null;
	const keys: (keyof ProcessEnvs)[] = [];

	while ((match = regex.exec(fileContent)) !== null) {
		keys.push(match[1] as keyof ProcessEnvs);
	}

	const TOKENS: Record<keyof ProcessEnvs, string | undefined> = keys.reduce((acc, key) => {
		acc[key] = `process.env.${key.toString()}`;
		return acc;
	}, {} as Record<keyof ProcessEnvs, string | undefined>);

	const tokensContent: string = `export const TOKENS = ${JSON.stringify(TOKENS, null, 2).replace(/"process\.env\.(\w+)"/g, 'process.env.$1')};\n`;
	const tokensFilePath = path.resolve('packages', 'global-configs', '__generated__', 'tokens.ts');
	fs.writeFileSync(tokensFilePath, tokensContent);

	console.log('tokens.ts has been created with the TOKENS object.');
}
