module.exports = function autoGuruReactDevelopmentPreset(api, options = {}) {
	const { experimental = false } = options;

	return {
		presets: [
			[
				require.resolve('@babel/preset-react'),
				{
					runtime: 'automatic',
					development: true,
					useBuiltIns: true,
					importSource: 'react',
				},
			],
		],
		plugins: [
			experimental &&
				require.resolve(
					'@autoguru/babel-preset/react/plugins/named-memo.js',
				),
		].filter(Boolean),
	};
};
