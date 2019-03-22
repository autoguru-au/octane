module.exports = function autoGuruReactPreset(api, options = {}) {
	const env = api.env();
	const isDevelopment = env === 'development' || env === 'test';

	const plugins = [];

	if (!isDevelopment) {
		plugins.push(
			require.resolve('@babel/plugin-transform-react-inline-elements'),
			require.resolve('babel-plugin-transform-react-remove-prop-types'),
			require.resolve('@babel/plugin-transform-react-constant-elements')
		);
	}

	return {
		presets: [
			[
				require.resolve('@babel/preset-react'),
				{
					useBuiltIns: true,
					development: isDevelopment,
				},
			],
		],
		plugins,
	};
};
