import { join } from 'path';

import { diary } from 'diary';
import ensureGitignore from 'ensure-gitignore';
import dedent from 'ts-dedent';

import { getGuruConfig } from './config';
import { writeFileMap } from './io';
import { projectInfo } from './terminal';

const { debug } = diary('gdu:configure');

export const WRAP_BANNER = (extra) =>
	`/** THIS FILE IS GENERATED, ALL CHANGES WILL NOT PERSIST **/\n${extra}`;

export const configure = async (app_location) => {
	debug('attempting a configure @ %s', app_location);

	const guruConfig = getGuruConfig(app_location);

	if (guruConfig.isRoot) return;

	const writeFiles = new Map();

	const gitIgnorePatterns = [
		'dist*/',
		'.build_cache*/',
		'.cache/',
		'node_modules/',
		'coverage/',
		'/*.xml',
		'.browserslistrc',
	];

	const prettireIgnorePatterns = [
		...gitIgnorePatterns,
		'browsers.ts',
		'tsconfig.json',
	];

	if (guruConfig?.type === 'ssr') {
		gitIgnorePatterns.push('.next/');
	}

	// Write `.gitignore`
	await ensureGitignore({
		filepath: join(app_location, '.gitignore'),
		comment: 'autoguru-au:gdu managed',
		patterns: [...gitIgnorePatterns, 'tsconfig.json'],
	});

	// Writes prettierignore
	await ensureGitignore({
		filepath: join(app_location, '.prettierignore'),
		comment: 'autoguru-au:gdu managed',
		patterns: prettireIgnorePatterns,
	});

	const tsConfig = {
		extends: '@autoguru/tsconfig/web.json',
		compilerOptions: {
			baseUrl: './',
			rootDir: './',
			sourceMap: true,
			jsx: 'preserve',
			outDir: './dist',
			strict: true,
			skipLibCheck: true,
			isolatedModules: true,
			noUnusedLocals: !guruConfig?.__legacy_mode,
			noUnusedParameters: !guruConfig?.__legacy_mode,
			paths: {
				'~/*': ['./*'],
			},
		},
		include: [
			'./*.d.ts',
			...guruConfig.srcPaths.map(
				(item) => `${item.replace(/\/$/, '')}/**/*`,
			),
		].filter(Boolean),
		exclude: ['node_modules'],
	};

	writeFiles.set(
		'tsconfig.json',
		WRAP_BANNER(JSON.stringify(tsConfig, null, 4)),
	);

	writeFiles.set(
		'.browserslistrc',
		dedent`
	# FILE IS MANAGED BY GDU, CHANGES WILL NOT PERSIST.

	extends browserslist-config-autoguru
	`,
	);

	await writeFileMap(writeFiles, app_location);

	projectInfo('configured ✅', app_location);
};
