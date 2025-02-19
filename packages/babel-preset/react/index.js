/* eslint-disable unicorn/prefer-module */
const { isDevelopment } = require('../utils');

// eslint-disable-next-line unicorn/prefer-module
module.exports = function autoGuruReactPreset(api, options = {}) {
	const dev = isDevelopment(api);

	const { experimental = false } = options;

	return {
		presets: [

			[
				'@babel/preset-env',
				{
					bugfixes: true,
					useBuiltIns: 'usage',
					corejs: { version: 3, proposals: true },
					modules: false, // Keep as false for better tree shaking and HMR
					loose: false,
					debug: dev,
					targets: {
						esmodules: true,
					},
					runtime: 'automatic',
					include: [
						'@babel/plugin-transform-class-properties',
						'@babel/plugin-transform-private-methods',
						'@babel/plugin-transform-private-property-in-object',
					],
				},
			],
		],

		plugins: [
			!dev &&
				require.resolve(
					'@babel/plugin-transform-react-constant-elements',
				),
			dev && experimental && require.resolve('./plugins/named-memo.js'),
		].filter(Boolean),
	};
};
