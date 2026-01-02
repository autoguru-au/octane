import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// We need to test the parsing functions from the codegen index
// Since they're not exported, we'll recreate them here for testing
// In a real scenario, these would be moved to a separate utils file

const parseEnvFile = (filePath: string): Record<string, string> => {
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

const extractStageFromFilename = (
	filename: string,
): { stage: string | null; tenant: string | null } => {
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

describe('env file parsing', () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdu-test-'));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	describe('parseEnvFile', () => {
		it('parses simple key-value pairs', () => {
			const envPath = path.join(tempDir, '.env.test');
			fs.writeFileSync(envPath, 'KEY=value\nANOTHER=test');

			const result = parseEnvFile(envPath);

			expect(result).toEqual({
				KEY: 'value',
				ANOTHER: 'test',
			});
		});

		it('ignores comment lines', () => {
			const envPath = path.join(tempDir, '.env.test');
			fs.writeFileSync(
				envPath,
				'# This is a comment\nKEY=value\n# Another comment',
			);

			const result = parseEnvFile(envPath);

			expect(result).toEqual({ KEY: 'value' });
		});

		it('ignores empty lines', () => {
			const envPath = path.join(tempDir, '.env.test');
			fs.writeFileSync(envPath, 'KEY=value\n\n\nANOTHER=test\n');

			const result = parseEnvFile(envPath);

			expect(result).toEqual({
				KEY: 'value',
				ANOTHER: 'test',
			});
		});

		it('handles values with equals signs', () => {
			const envPath = path.join(tempDir, '.env.test');
			fs.writeFileSync(
				envPath,
				'URL=https://example.com?foo=bar&baz=qux',
			);

			const result = parseEnvFile(envPath);

			expect(result).toEqual({
				URL: 'https://example.com?foo=bar&baz=qux',
			});
		});

		it('preserves quoted values', () => {
			const envPath = path.join(tempDir, '.env.test');
			fs.writeFileSync(envPath, 'QUOTED="hello world"\nSINGLE=\'test\'');

			const result = parseEnvFile(envPath);

			expect(result).toEqual({
				QUOTED: '"hello world"',
				SINGLE: "'test'",
			});
		});

		it('handles Octopus deploy placeholders', () => {
			const envPath = path.join(tempDir, '.env.test');
			fs.writeFileSync(envPath, 'appDomain="#{AutoGuru.AppDomain}"');

			const result = parseEnvFile(envPath);

			expect(result).toEqual({
				appDomain: '"#{AutoGuru.AppDomain}"',
			});
		});

		it('trims whitespace from keys and values', () => {
			const envPath = path.join(tempDir, '.env.test');
			fs.writeFileSync(envPath, '  KEY  =  value  ');

			const result = parseEnvFile(envPath);

			expect(result).toEqual({ KEY: 'value' });
		});

		it('handles empty values', () => {
			const envPath = path.join(tempDir, '.env.test');
			fs.writeFileSync(envPath, 'EMPTY=\nNONEMPTY=value');

			const result = parseEnvFile(envPath);

			expect(result).toEqual({
				EMPTY: '',
				NONEMPTY: 'value',
			});
		});
	});

	describe('extractStageFromFilename', () => {
		it('extracts stage and tenant from .env.{stage}_{tenant} format', () => {
			expect(extractStageFromFilename('.env.dev_au')).toEqual({
				stage: 'dev',
				tenant: 'au',
			});
			expect(extractStageFromFilename('.env.prod_nz')).toEqual({
				stage: 'prod',
				tenant: 'nz',
			});
			expect(extractStageFromFilename('.env.uat_global')).toEqual({
				stage: 'uat',
				tenant: 'global',
			});
		});

		it('extracts stage from .env.{stage} format', () => {
			expect(extractStageFromFilename('.env.dev')).toEqual({
				stage: 'dev',
				tenant: null,
			});
			expect(extractStageFromFilename('.env.prod')).toEqual({
				stage: 'prod',
				tenant: null,
			});
		});

		it('returns null for .env.defaults', () => {
			expect(extractStageFromFilename('.env.defaults')).toEqual({
				stage: null,
				tenant: null,
			});
		});

		it('returns null for invalid formats', () => {
			expect(extractStageFromFilename('.env')).toEqual({
				stage: null,
				tenant: null,
			});
			expect(extractStageFromFilename('env.dev_au')).toEqual({
				stage: null,
				tenant: null,
			});
			expect(extractStageFromFilename('.env.DEV_AU')).toEqual({
				stage: null,
				tenant: null,
			});
		});

		it('handles all standard stages', () => {
			const stages = ['dev', 'test', 'uat', 'preprod', 'prod'];

			for (const stage of stages) {
				expect(extractStageFromFilename(`.env.${stage}_au`)).toEqual({
					stage,
					tenant: 'au',
				});
			}
		});
	});
});
