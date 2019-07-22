const { isDevelopment } = require('./utils');

module.exports = function autoGuruReactPreset(api) {
	const plugins = [
		require.resolve('./react/named-memo.js'),
	];

	if (!isDevelopment(api)) {
		plugins.push(
			require.resolve('@babel/plugin-transform-react-inline-elements'),
			require.resolve('babel-plugin-transform-react-remove-prop-types'),
			require.resolve('@babel/plugin-transform-react-constant-elements'),
		);
	}

	return {
		presets: [
			[
				require.resolve('@babel/preset-react'),
				{
					useBuiltIns: true,
					development: isDevelopment(api),
				},
			],
		],
		plugins,
	};
};
