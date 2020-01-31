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
	} catch (e) {
		// Do nothing
	}

	return {
		presets: [
			[
				require.resolve('@autoguru/babel-preset/web'),
				{ corejs: 2, browsers, loose: false },
			],
			guruConfig.isSSR && require.resolve('next/babel'),
			require.resolve('@autoguru/babel-preset/react'),
			[
				require.resolve('@babel/preset-typescript'),
				{
					isTSX: true,
					allExtensions: true,
				},
			],
			hasRelay && require.resolve('babel-plugin-relay'),
		].filter(Boolean),
	};
};
