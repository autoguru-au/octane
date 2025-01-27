
import configTenants from './config-tenants';
import configTokents from './config-tokens';
import generateConfigFiles from './generate-configs-files';
import configGenerateTokens from './generate-tokens';

export default async ({tokens}) => {
	if(tokens) {
		await generateConfigFiles();
	}
	await configGenerateTokens();
	await configTokents();
	await configTenants();
};
