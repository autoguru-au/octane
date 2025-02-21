const { isDevelopment, isDebugging } = require('../utils');

module.exports = function autoGuruReactPreset(api = {}, options = {}) {
	const { browsers } = options;
	const dev = isDevelopment(api);
	const debug = isDebugging(api);
	console.log({
		isDevelopment: isDevelopment(api),
		isDebugging: isDebugging(api),
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
