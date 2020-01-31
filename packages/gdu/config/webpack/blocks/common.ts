import { RuleSetRule } from 'webpack';

export const commonLoaders = () => {
	return {
		before: [
			{
				test: /\.mjs$/,
				include: /node_modules/,
				type: 'javascript/auto',
			},
		] as RuleSetRule[],
		after: [
			{
				test: /\.yml$/,
				type: 'javascript/auto',
				use: require.resolve('js-yaml-loader'),
			},
		] as RuleSetRule[],
	};
};
