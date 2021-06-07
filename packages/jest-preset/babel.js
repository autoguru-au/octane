/* eslint-disable unicorn/prefer-module */
module.exports = require('babel-jest').createTransformer({
	babelrc: false,
	presets: [
		[
			require.resolve('@autoguru/babel-preset/node'),
			{
				debug: false,
			},
		],
		require.resolve('@autoguru/babel-preset/react'),
		[
			require.resolve('@babel/preset-typescript'),
			{
				isTSX: true,
				allExtensions: true,
			},
		],
	],
	plugins: [require.resolve('babel-plugin-treat')],
});
