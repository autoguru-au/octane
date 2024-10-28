
import configTenants from './config-tenants';
import configTokents from './config-tokens';
import configGenerateTokens from './generate-tokens';

export default async () => {
	await configGenerateTokens();
	await configTokents();
	await configTenants();
};
