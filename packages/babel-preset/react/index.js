const { isDevelopment, isDebugging } = require('../utils');

module.exports = function autoGuruReactPreset(_, options = {}) {
	const { browsers } = options;
	const dev = isDevelopment();
	console.log({
		isDevelopment: isDevelopment(),
		isDebugging: isDebugging(),
	});

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
						browsers,
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
						browsers,
						esmodules: !dev,
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
