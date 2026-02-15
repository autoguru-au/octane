const { isDevelopment } = require('../utils');

module.exports = function autoGuruReactPreset(api, options = {}) {
	const dev = isDevelopment(api);
	const { experimental = false } = options;

	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					bugfixes: true,
					useBuiltIns: 'usage',
					corejs: { version: 3, proposals: true },
					modules: false,
					loose: false,
					debug: dev,
					targets: {
						esmodules: true,
					},
				},
			],
			[
				require.resolve('@babel/preset-react'),
				{
					runtime: 'automatic',
					development: dev,
					useBuiltIns: true,
					importSource: 'react',
				},
			],
		],
		plugins: [
			!dev &&
				require.resolve('@babel/plugin-transform-react-constant-elements'),
			dev && experimental && require.resolve('./plugins/named-memo.js'),
		].filter(Boolean),
	};
};
