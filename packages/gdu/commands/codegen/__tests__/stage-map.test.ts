import type { CodegenGeneratorConfig } from '../../../lib/config';
import { generateStageMap, type EnvConfig } from '../generators/stage-map';

describe('stage-map generator', () => {
	const defaultGeneratorConfig: CodegenGeneratorConfig = {
		type: 'stage-map',
		outputPath: './src/generated/stage-map.ts',
		options: {
			keyField: 'appDomain',
			defaultValue: 'dev',
			helperName: 'extractStageFromHost',
		},
	};

	describe('generateStageMap', () => {
		it('generates a stage map from env configs', () => {
			const envConfigs: EnvConfig[] = [
				{
					filename: '.env.dev_au',
					stage: 'dev',
					tenant: 'au',
					values: { appDomain: 'fleet.dev.autoguru.com' },
				},
				{
					filename: '.env.prod_au',
					stage: 'prod',
					tenant: 'au',
					values: { appDomain: 'fleet.autoguru.com' },
				},
			];

			const result = generateStageMap(envConfigs, defaultGeneratorConfig);

			expect(result).toContain('export const STAGE_MAP');
			expect(result).toContain('"fleet.dev.autoguru.com": "dev"');
			expect(result).toContain('"fleet.autoguru.com": "prod"');
		});

		it('generates helper function when helperName is provided', () => {
			const envConfigs: EnvConfig[] = [
				{
					filename: '.env.dev_au',
					stage: 'dev',
					tenant: 'au',
					values: { appDomain: 'fleet.dev.autoguru.com' },
				},
			];

			const result = generateStageMap(envConfigs, defaultGeneratorConfig);

			expect(result).toContain('export const extractStageFromHost');
			expect(result).toContain("return STAGE_MAP[host] || 'dev'");
		});

		it('does not generate helper function when helperName is undefined', () => {
			const envConfigs: EnvConfig[] = [
				{
					filename: '.env.dev_au',
					stage: 'dev',
					tenant: 'au',
					values: { appDomain: 'fleet.dev.autoguru.com' },
				},
			];

			const configWithoutHelper: CodegenGeneratorConfig = {
				...defaultGeneratorConfig,
				options: {
					keyField: 'appDomain',
					defaultValue: 'dev',
					helperName: undefined,
				},
			};

			const result = generateStageMap(envConfigs, configWithoutHelper);

			expect(result).toContain('export const STAGE_MAP');
			// Should only have one export const (the STAGE_MAP)
			expect(result.match(/export const/g)).toHaveLength(1);
		});

		it('skips entries with Octopus deploy placeholders', () => {
			const envConfigs: EnvConfig[] = [
				{
					filename: '.env.prod',
					stage: 'prod',
					tenant: null,
					values: { appDomain: '#{AutoGuru.AppDomain}' },
				},
				{
					filename: '.env.prod_au',
					stage: 'prod',
					tenant: 'au',
					values: { appDomain: 'fleet.autoguru.com' },
				},
			];

			const result = generateStageMap(envConfigs, defaultGeneratorConfig);

			expect(result).not.toContain('#{AutoGuru.AppDomain}');
			expect(result).toContain('"fleet.autoguru.com": "prod"');
		});

		it('skips entries with empty key values', () => {
			const envConfigs: EnvConfig[] = [
				{
					filename: '.env.dev_au',
					stage: 'dev',
					tenant: 'au',
					values: { appDomain: '' },
				},
				{
					filename: '.env.prod_au',
					stage: 'prod',
					tenant: 'au',
					values: { appDomain: 'fleet.autoguru.com' },
				},
			];

			const result = generateStageMap(envConfigs, defaultGeneratorConfig);

			expect(result).toContain('"fleet.autoguru.com": "prod"');
			expect(result).not.toContain('""');
		});

		it('uses custom keyField from options', () => {
			const envConfigs: EnvConfig[] = [
				{
					filename: '.env.dev_au',
					stage: 'dev',
					tenant: 'au',
					values: { customDomain: 'custom.dev.example.com' },
				},
			];

			const customConfig: CodegenGeneratorConfig = {
				...defaultGeneratorConfig,
				options: {
					keyField: 'customDomain',
					defaultValue: 'dev',
				},
			};

			const result = generateStageMap(envConfigs, customConfig);

			expect(result).toContain('"custom.dev.example.com": "dev"');
		});

		it('uses custom defaultValue in helper function', () => {
			const envConfigs: EnvConfig[] = [
				{
					filename: '.env.prod_au',
					stage: 'prod',
					tenant: 'au',
					values: { appDomain: 'fleet.autoguru.com' },
				},
			];

			const customConfig: CodegenGeneratorConfig = {
				...defaultGeneratorConfig,
				options: {
					keyField: 'appDomain',
					defaultValue: 'prod',
					helperName: 'getStage',
				},
			};

			const result = generateStageMap(envConfigs, customConfig);

			expect(result).toContain('export const getStage');
			expect(result).toContain("return STAGE_MAP[host] || 'prod'");
		});

		it('deduplicates entries with same domain across tenants', () => {
			const envConfigs: EnvConfig[] = [
				{
					filename: '.env.prod_au',
					stage: 'prod',
					tenant: 'au',
					values: { appDomain: 'fleet.autoguru.com' },
				},
				{
					filename: '.env.prod_nz',
					stage: 'prod',
					tenant: 'nz',
					values: { appDomain: 'fleet.autoguru.com' },
				},
			];

			const result = generateStageMap(envConfigs, defaultGeneratorConfig);

			// Should only appear once
			const matches = result.match(/"fleet\.autoguru\.com"/g);
			expect(matches).toHaveLength(1);
		});

		it('includes auto-generated header comment', () => {
			const envConfigs: EnvConfig[] = [];

			const result = generateStageMap(envConfigs, defaultGeneratorConfig);

			expect(result).toContain('Auto-generated stage map');
			expect(result).toContain('DO NOT EDIT MANUALLY');
			expect(result).toContain('gdu codegen');
		});

		it('handles multiple stages correctly', () => {
			const envConfigs: EnvConfig[] = [
				{
					filename: '.env.dev_au',
					stage: 'dev',
					tenant: 'au',
					values: { appDomain: 'fleet.dev.autoguru.com' },
				},
				{
					filename: '.env.test_au',
					stage: 'test',
					tenant: 'au',
					values: { appDomain: 'fleet.test.autoguru.com' },
				},
				{
					filename: '.env.uat_au',
					stage: 'uat',
					tenant: 'au',
					values: { appDomain: 'fleet.uat.autoguru.com' },
				},
				{
					filename: '.env.preprod_au',
					stage: 'preprod',
					tenant: 'au',
					values: { appDomain: 'fleet.preprod.autoguru.com' },
				},
				{
					filename: '.env.prod_au',
					stage: 'prod',
					tenant: 'au',
					values: { appDomain: 'fleet.autoguru.com' },
				},
			];

			const result = generateStageMap(envConfigs, defaultGeneratorConfig);

			expect(result).toContain('"fleet.dev.autoguru.com": "dev"');
			expect(result).toContain('"fleet.test.autoguru.com": "test"');
			expect(result).toContain('"fleet.uat.autoguru.com": "uat"');
			expect(result).toContain('"fleet.preprod.autoguru.com": "preprod"');
			expect(result).toContain('"fleet.autoguru.com": "prod"');
		});
	});
});
