const { join } = require('path');

const browsers = require('browserslist-config-autoguru');
const kleur = require('kleur');

const { PROJECT_ROOT } = require('../../../lib/roots');
const ReactCompilerConfig = {
	target: '19',
	sources: (filename) => {
		return filename.includes('apps') || filename.includes('packages');
	},
};

module.exports = (guruConfig) => {
	let hasRelay = false;

	try {
		const packageJson = require(
			join(guruConfig.__configPath, './package.json'),
		);

		const deps = new Set();
		for (const item of Object.keys(packageJson.devDependencies))
			deps.add(item);
		for (const item of Object.keys(packageJson.dependencies))
			deps.add(item);

		if (deps.has('react-relay')) {
			hasRelay = true;
		}
	} catch {
		// Do nothing
	}

	// log if mfe has relay
	if (hasRelay) {
		console.log(kleur.green('Relay detected in MFE 🌟'));
	}

	return {
		presets: [
			[require('./web'), { corejs: 3, browsers, loose: false }],
			guruConfig.type !== 'ssr' && [require('./react')],
			[
				require.resolve('@babel/preset-typescript'),
				{
					isTSX: true,
					allExtensions: true,
				},
			],
		].filter(Boolean),
		plugins: [
			['babel-plugin-react-compiler', ReactCompilerConfig],
			hasRelay && [
				require.resolve('babel-plugin-relay'),
				{
					haste: false,
					isDevVariable: '__DEV__',
					isDebugVariable: '__DEBUG__',
					eagerESModules: true,
					artifactDirectory: join(
						PROJECT_ROOT,
						'../../',
						'packages',
						'relay',
						'__generated__',
					),
				},
			],
			[require.resolve('../../pathNormaliser')],
		].filter(Boolean),
	};
};
