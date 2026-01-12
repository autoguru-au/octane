import * as fs from 'fs';
import * as path from 'path';

import { banner } from '../../lib/banner';
import { getGuruConfig } from '../../lib/config';
import { getConfigsDirs } from '../../utils/configs';

import { generateStageMap, type EnvConfig } from './generators/stage-map';
import { extractStageFromFilename, parseEnvFile } from './utils/env-parser';

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
