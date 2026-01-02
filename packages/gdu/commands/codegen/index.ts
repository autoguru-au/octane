import * as fs from 'fs';
import * as path from 'path';

import { banner } from '../../lib/banner';
import { getGuruConfig } from '../../lib/config';
import { getConfigsDirs } from '../../utils/configs';

import { generateStageMap, type EnvConfig } from './generators/stage-map';

// Parse .env file content into key-value pairs
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

// Extract stage from filename: .env.dev_au -> dev
const extractStageFromFilename = (
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

// Load all environment configs from .gdu_app_config directory
const loadEnvConfigs = (configDir: string): EnvConfig[] => {
	const configs: EnvConfig[] = [];

	if (!fs.existsSync(configDir)) {
		console.warn(`Config directory not found: ${configDir}`);
		return configs;
	}

	// Load defaults first
	const defaultsPath = path.join(configDir, '.env.defaults');
	const defaults = fs.existsSync(defaultsPath)
		? parseEnvFile(defaultsPath)
		: {};

	// Find all .env.* files (skip defaults and tokens)
	const files = fs
		.readdirSync(configDir)
		.filter(
			(f) =>
				f.startsWith('.env.') &&
				f !== '.env.defaults' &&
				f !== '.env.tokens',
		);

	for (const file of files) {
		const { stage, tenant } = extractStageFromFilename(file);
		if (!stage) continue;

		const filePath = path.join(configDir, file);
		const envValues = parseEnvFile(filePath);

		// Merge defaults with environment-specific values
		configs.push({
			filename: file,
			stage,
			tenant,
			values: { ...defaults, ...envValues },
		});
	}

	return configs;
};

// Generator registry
const generators = {
	'stage-map': generateStageMap,
};

export default async ({ list }: { list?: boolean }) => {
	if (list) {
		console.log('Available generators:');
		console.log('  - stage-map: Generate domain -> stage mapping');
		return;
	}

	const guruConfig = getGuruConfig();

	if (!guruConfig) {
		throw new Error('No guru.config.js found');
	}

	if (!guruConfig.codegen) {
		console.log('No codegen configuration found in guru.config.js');
		return;
	}

	banner('codegen');

	const { codegen } = guruConfig;
	const configDirs = getConfigsDirs();

	// Find the app-specific config directory
	const appConfigDir =
		codegen.configDir ||
		configDirs.find((dir) => dir?.includes('.gdu_app_config'));

	if (!appConfigDir) {
		throw new Error('No .gdu_app_config directory found');
	}

	console.log(`Loading configs from: ${appConfigDir}`);

	const envConfigs = loadEnvConfigs(appConfigDir);
	console.log(`Found ${envConfigs.length} environment configurations`);

	// Run each configured generator
	for (const generatorConfig of codegen.generators) {
		const generator = generators[generatorConfig.type];

		if (!generator) {
			console.error(`Unknown generator type: ${generatorConfig.type}`);
			continue;
		}

		console.log(`Running generator: ${generatorConfig.type}`);

		const output = generator(envConfigs, generatorConfig);
		const outputPath = path.resolve(
			guruConfig.__configPath,
			generatorConfig.outputPath,
		);

		// Ensure output directory exists
		const outputDir = path.dirname(outputPath);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		fs.writeFileSync(outputPath, output);
		console.log(`Generated: ${outputPath}`);
	}

	console.log('Codegen complete');
};
