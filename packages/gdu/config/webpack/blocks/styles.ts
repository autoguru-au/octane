import browsers from 'browserslist-config-autoguru';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { isEnvProduction } from '../../../lib/misc';

export const makeSassLoader = ({ isServer = false }) => {
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
				importLoaders: 3,
				localsConvention: 'camelCase',
				modules: {
					localIdentName: isEnvProduction()
						? '_[hash:hex:5]'
						: '[local]-[hash:hex:7]',
					hashPrefix: '_',
				},
				sourceMap: true,
				onlyLocals: isServer,
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
		{ loader: require.resolve('resolve-url-loader') },
		{
			loader: require.resolve('sass-loader'),
			options: { sourceMap: true },
		},
	].filter(Boolean);
};

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
