import { isEnvProduction } from '../../../lib/misc';
/* eslint-disable unicorn/prefer-module */
export const makeImagesLoader = () => {
	return {
		loader: require.resolve('url-loader'),
		options: {
			limit: 10_000,
			name: `static/media/${
				isEnvProduction() ? '' : '[name]-'
			}[contenthash:8].[ext]`,
		},
	};
};
