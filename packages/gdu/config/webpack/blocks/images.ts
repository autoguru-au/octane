import { isEnvProduction } from '../../../lib/misc';

export const makeImagesLoader = () => {
	return {
		loader: require.resolve('url-loader'),
		options: {
			limit: 10000,
			name: `static/media/${
				isEnvProduction() ? '' : '[name]-'
			}[contenthash:8].[ext]`,
		},
	};
};
