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
					useBuiltIns: 'entry', // Changed to entry to be more restrictive
					corejs: {
						version: 3,
						proposals: false, // Disabled proposals to avoid unnecessary polyfills
					},
					modules: false,
					loose: false,
					targets: {
						browsers: browsers || defaultBrowsers,
						esmodules: !dev,
					},
					include: [],
					exclude: ['transform-typeof-symbol'],
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
