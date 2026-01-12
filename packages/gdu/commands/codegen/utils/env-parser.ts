import * as fs from 'fs';

/**
 * Parse .env file content into key-value pairs.
 * Handles comments, empty lines, and values containing equals signs.
 */
export const parseEnvFile = (filePath: string): Record<string, string> => {
	const content = fs.readFileSync(filePath, 'utf8');
	const result: Record<string, string> = {};

	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#')) {
			const [key, ...valueParts] = trimmed.split('=');
			if (key) {
				result[key.trim()] = valueParts.join('=').trim();
			}
		}
	}

	return result;
};

/**
 * Extract stage and tenant from environment filename.
 * Supports formats: .env.{stage}_{tenant} and .env.{stage}
 * Returns null for .env.defaults and invalid formats.
 */
export const extractStageFromFilename = (
	filename: string,
): { stage: string | null; tenant: string | null } => {
	// Match .env.{stage}_{tenant} or .env.{stage}
	const matchWithTenant = filename.match(/^\.env\.([a-z]+)_([a-z]+)$/);
	if (matchWithTenant) {
		return { stage: matchWithTenant[1], tenant: matchWithTenant[2] };
	}

	const matchStageOnly = filename.match(/^\.env\.([a-z]+)$/);
	if (matchStageOnly && matchStageOnly[1] !== 'defaults') {
		return { stage: matchStageOnly[1], tenant: null };
	}

	return { stage: null, tenant: null };
};
