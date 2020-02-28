const browsers = require('browserslist-config-autoguru');

const { join } = require('path');

module.exports = guruConfig => {
	let hasRelay = false;

	try {
		const packageJson = require(join(
			guruConfig.__configPath,
			'./package.json',
		));

		const deps = new Set();
		Object.keys(packageJson.devDependencies).forEach(item =>
			deps.add(item),
		);
		Object.keys(packageJson.dependencies).forEach(item => deps.add(item));

		if (deps.has('react-relay')) {
			hasRelay = true;
		}
	} catch (error) {
		// Do nothing
	}

	return {
		presets: [
			[
				require.resolve('@autoguru/babel-preset/web'),
				{ corejs: 3, browsers, loose: false },
			],
			guruConfig.isSSR && [
				require.resolve('next/babel'),
				{
					'preset-env': {
						corejs: 3,
						useBuiltIns: 'entry',
					},
					'transform-runtime': {
						corejs: 3,
					},
				},
			],
			require.resolve('@autoguru/babel-preset/react'),
			[
				require.resolve('@babel/preset-typescript'),
				{
					isTSX: true,
					allExtensions: true,
				},
			],
		].filter(Boolean),
		plugins: [
			hasRelay && [
				require.resolve('babel-plugin-relay'),
				{
					haste: false,
					isDevVariable: '__DEV__',
					eagerESModules: true,
				},
			],
			require.resolve('babel-plugin-treat'),
		].filter(Boolean),
	};
};
