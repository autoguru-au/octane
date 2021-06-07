import browsers from 'browserslist-config-autoguru';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { isEnvProduction } from '../../../lib/misc';
/* eslint-disable unicorn/prefer-module */
export const makeCssLoader = ({ isServer = false }) => {
	return [
		isEnvProduction() &&
			!isServer && {
				loader: MiniCssExtractPlugin.loader,
			},
		!isEnvProduction() &&
			!isServer && {
				loader: require.resolve('style-loader'),
			},
		{
			loader: require.resolve('css-loader'),
			options: {
				importLoaders: 1,
				localsConvention: 'camelCase',
				sourceMap: true,
			},
		},
		{
			loader: require.resolve('postcss-loader'),
			options: {
				sourceMap: true,
				plugins: [
					require('postcss-flexbugs-fixes'),
					require('postcss-preset-env')({
						browsers,
						autoprefixer: {
							flexbox: 'no-2009',
						},
						stage: 3,
					}),
					require('cssnano')({
						browsers,
					}),
				],
			},
		},
	].filter(Boolean);
};
