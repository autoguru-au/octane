const { isDevelopment } = require('../utils');

module.exports = function autoGuruReactPreset(api, options = {}) {
	const dev = isDevelopment(api);

	const { experimental = false } = options;

	return {
		presets: [
			[
				require.resolve('@babel/preset-react'),
				{
					useBuiltIns: true,
					development: dev,
					runtime: 'automatic',
				},
			],
		],
		plugins: [
			!dev &&
				require.resolve(
					'babel-plugin-transform-react-remove-prop-types',
				),
			!dev &&
				require.resolve(
					'@babel/plugin-transform-react-constant-elements',
				),
			dev && experimental && require.resolve('./plugins/named-memo.js'),
		].filter(Boolean),
	};
};
