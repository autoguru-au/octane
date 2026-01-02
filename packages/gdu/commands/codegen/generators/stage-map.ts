import type { CodegenGeneratorConfig } from '../../../lib/config';

export interface EnvConfig {
	filename: string;
	stage: string;
	tenant: string | null;
	values: Record<string, string>;
}

export interface StageMapOptions {
	keyField: string;
	defaultValue: string;
	helperName?: string;
}

const DEFAULT_OPTIONS: StageMapOptions = {
	keyField: 'appDomain',
	defaultValue: 'dev',
	helperName: 'extractStageFromHost',
};

export const generateStageMap = (
	envConfigs: EnvConfig[],
	generatorConfig: CodegenGeneratorConfig,
): string => {
	const options: StageMapOptions = {
		...DEFAULT_OPTIONS,
		...generatorConfig.options,
	};

	const { keyField, defaultValue, helperName } = options;

	// Build the stage map from all env configs
	const stageMap: Record<string, string> = {};

	for (const config of envConfigs) {
		const keyValue = config.values[keyField];
		// Skip empty values and Octopus deploy placeholders
		if (keyValue && config.stage && !keyValue.includes('#{')) {
			stageMap[keyValue] = config.stage;
		}
	}

	// Generate TypeScript content
	const lines: string[] = [
		'/**',
		' * Auto-generated stage map from .gdu_app_config files.',
		' * DO NOT EDIT MANUALLY - regenerate with: gdu codegen',
		` * Generated: ${new Date().toISOString()}`,
		' */',
		'',
		`export const STAGE_MAP: Record<string, string> = ${JSON.stringify(stageMap, null, 2)};`,
	];

	// Add helper function if requested
	if (helperName) {
		lines.push(
			'',
			`export const ${helperName} = (host: string): string => {`,
			`  return STAGE_MAP[host] || '${defaultValue}';`,
			'};',
		);
	}

	return lines.join('\n') + '\n';
};
