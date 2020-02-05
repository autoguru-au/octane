import { existsSync } from 'fs';
import { green } from 'kleur';
import { join } from 'path';
import dedent from 'ts-dedent';

import { banner } from '../lib/banner';
import { configure } from '../lib/configure';
import { mkdirpAsync, writeFileMap } from '../lib/io';
import { PROJECT_ROOT } from '../lib/roots';

const debug = require('debug')('gdu:commands:scaffold');

const availableTypes = ['ssr', 'spa'];

const validateOptions = ({ type }) => {
	if (!availableTypes.includes(type)) {
		throw new Error(
			`Type: ${type} no supported. Please use one of ${availableTypes.join(
				', ',
			)}`,
		);
	}
};

const ensureAppFolder = async app_name => {
	const appFolder = join(PROJECT_ROOT, `apps/${app_name}/`);

	debug('scaffolding into %s', appFolder);

	if (existsSync(appFolder))
		throw new Error(`Target app ${appFolder} already exists!`);

	await mkdirpAsync(appFolder);

	return appFolder;
};

const baseAppScaff = async (options, outputFiles) => {
	// Build guru.config
	const configFile = dedent`module.exports = {
		isSSR: ${options.type === 'ssr' ? 'true' : 'false'},
	};`;
	outputFiles.set('guru.config.js', configFile);

	const packageJson = JSON.stringify(
		{
			name: `@autoguru/${options.app_name}`,
			version: '0.1.0',
			private: true,
			scripts: {
				start: 'gdu start',
				test: 'gdu test',
				build: 'gdu build',
				lint: 'gdu lint',
				format: 'gdu format',
			},
			dependencies: {
				'@autoguru/overdrive': 'latest',
				react: '^16.12.0',
				'react-dom': '^16.12.0',
			},
			devDependencies: {
				gdu: 'alpha',
				'browserslist-config-autoguru': 'latest',
				'@types/react': '^16.9.0',
				'@types/react-dom': '^16.9.0',
				typescript: '^3.7.0',
			},
		},
		null,
		4,
	);
	outputFiles.set('package.json', packageJson);
};

export default async (type, app_name) => {
	const options = { type, app_name };

	debug('running action with %O', options);

	validateOptions(options);

	banner('Creating', `@autoguru/${app_name}`);

	let outputPath;

	if (options.type === 'spa') {
		outputPath = await genSPA(options);
	} else {
		outputPath = await genSSR(options);
	}

	await configure(outputPath);

	console.log(green('Done!'));
};

const genSPA = async options => {
	const appFolder = await ensureAppFolder(options.app_name);

	const writeFiles = new Map();

	await baseAppScaff(options, writeFiles);

	writeFiles.set(
		'src/App/index.tsx',
		dedent`import React from 'react';
	import { OverdriveProvider, baseTheme } from '@autoguru/overdrive';
	import DefaultScene from '../scenes';

	export default () => (
		<OverdriveProvider theme={baseTheme} isServer={false}>
			<DefaultScene />
		</OverdriveProvider>
	);
	`,
	);

	writeFiles.set(
		'src/scenes/index.tsx',
		dedent`import React from 'react';
	import { Heading } from '@autoguru/overdrive';

	export default () => <Heading is="h1">Welcome to your new SPA application!</Heading>
	`,
	);

	writeFiles.set(
		'src/client.tsx',
		dedent`import React from 'react';
	import { render } from 'react-dom';
	import App from './App';

	export default () => void render(<App />, document.getElementById('app'));
	`,
	);

	await writeFileMap(writeFiles, appFolder);

	return appFolder;
};

const genSSR = async options => {
	const appFolder = await ensureAppFolder(options.app_name);

	const writeFiles = new Map();

	await baseAppScaff(options, writeFiles);

	writeFiles.set(
		'pages/index.tsx',
		dedent`
	import React from 'react';
	import { Heading } from '@autoguru/overdrive';

	export default () => <Heading is="h1">Welcome to your new SSR application!</Heading>;`,
	);

	await writeFileMap(writeFiles, appFolder);

	return appFolder;
};
