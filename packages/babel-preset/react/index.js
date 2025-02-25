const defaultBrowsers = require('browserslist-config-autoguru');

const { isDevelopment } = require('../utils');
module.exports = function autoGuruReactPreset(_, options = {}) {
	const { browsers } = options;

	const dev = isDevelopment();

	return {
		presets: [
			[
				'@babel/preset-env',
				{
					bugfixes: true,
					useBuiltIns: 'usage',
					corejs: { version: 3, proposals: true },
					modules: false,
					loose: false,
					targets: {
						browsers: browsers || defaultBrowsers,
						esmodules: !dev,
					},
				},
			],
			[
				'@babel/preset-react',
				{
					runtime: 'automatic',
					development: dev,
					useBuiltIns: true,
					importSource: 'react',
					loose: false,
					targets: {
						browsers: browsers || defaultBrowsers,
					},
				},
			],
		],
		plugins: [
			!dev &&
				require.resolve(
					'@babel/plugin-transform-react-constant-elements',
				),
		].filter(Boolean),
	};
};
