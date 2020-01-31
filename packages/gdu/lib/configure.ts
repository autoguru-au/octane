import ensureGitignore from 'ensure-gitignore';
import { dim, magenta } from 'kleur';
import { join, relative } from 'path';
import dedent from 'ts-dedent';

import { getGuruConfig } from './config';
import { writeFileMap } from './io';
import { GDU_ROOT, PROJECT_ROOT } from './roots';

const debug = require('debug')('gdu:configure');

const WRAP_BANNER = extra =>
	`/** THIS FILE IS GENERATED, ALL CHANGES WILL NOT PERSIST **/\n${extra}`;

export const configure = async app_location => {
	debug('attempting a configure @ %s', app_location);

	const guruConfig = getGuruConfig(app_location);

	if (guruConfig.isRoot) return;

	const writeFiles = new Map();

	const gitIgnorePatterns = [
		'dist/',
		'.cache/',
		'node_modules/',
		'coverage/',
		'/*.xml',
		'.browserslistrc',
	];

	if (guruConfig?.isSSR) {
		gitIgnorePatterns.push('.next/');
	}

	// Write `.gitignore`
	await ensureGitignore({
		filepath: join(app_location, '.gitignore'),
		comment: 'autoguru-au:gdu managed',
		patterns: [...gitIgnorePatterns, '.prettierignore', 'tsconfig.json'],
	});

	// Writes prettierignore
	await ensureGitignore({
		filepath: join(app_location, '.prettierignore'),
		comment: 'autoguru-au:gdu managed',
		patterns: gitIgnorePatterns,
	});

	const tsConfig = {
		extends: require.resolve('@autoguru/tsconfig/web.json', {
			paths: [join(GDU_ROOT, 'node_modules')],
		}),
		compilerOptions: {
			baseUrl: './',
			rootDir: app_location,
			jsx: 'preserve',
			outDir: './dist',
			strict: true,
			skipLibCheck: true,
			isolatedModules: true,
			paths: {
				'~/*': ['./*'],
			},
		},
		include: [
			'./*.d.ts',
			...guruConfig.srcPaths.map(
				item => `${item.replace(/\/$/, '')}/**/*`,
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

	const writeFilesPrint = [...writeFiles.entries()]
		.map(item => item[0])
		.concat(['.gitignore', '.prettierignore'])
		.join(', ');

	console.log(
		`Configured ${magenta(
			PROJECT_ROOT === guruConfig.__configPath
				? guruConfig.__configPath
				: relative(PROJECT_ROOT, guruConfig.__configPath),
		)} ${dim(writeFilesPrint)}`,
	);
};
