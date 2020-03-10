import { existsSync } from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { blue, bold, cyan, red } from 'kleur';
import { join } from 'path';
import dedent from 'ts-dedent';
import webpack, { Configuration } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { META_SYMBOL } from '../../config/webpack/plugins/ConfigPlugin';
import { makeWebpackConfig } from '../../config/webpack/webpack.config';
import { getProjectName, GuruConfig } from '../../lib/config';
import { PROJECT_ROOT } from '../../lib/roots';
import { getHooks } from '../../utils/hooks';

const getConsumerHtmlTemplate = (guruConfig: GuruConfig) => {
	try {
		const filePath = join(guruConfig.__configPath, '/template.html');
		if (existsSync(filePath)) {
			return filePath;
		}
	} catch (_) {
		return undefined;
	}

	return undefined;
};

const localhost = '0.0.0.0';
const hosts = ['localhost', localhost];
export const runSPA = async (
	guruConfig: GuruConfig,
	environmentName: string,
) => {
	const hooks = getHooks();
	console.log(`${cyan('Starting dev server...')}`);

	const webpackConfig: Configuration = hooks.webpackConfig.call(
		makeWebpackConfig({
			isDevServer: true,
		}),
	);

	webpackConfig.plugins.push(
		new HtmlWebpackPlugin({
			template: getConsumerHtmlTemplate(guruConfig),
		}),
	);
	webpackConfig.plugins.push(
		new (class GuruHtml {
			apply(compiler) {
				compiler.hooks.compilation.tap('guru', compilation => {
					const hooks = (HtmlWebpackPlugin as any).getHooks(
						compilation,
					) as HtmlWebpackPlugin.Hooks;

					compilation.hooks.seal.tap('guru', () => {
						const { chunks } = compilation;
						const maybeEnvChunk = chunks.find(
							c =>
								c[META_SYMBOL] &&
								c[META_SYMBOL]?.name === environmentName,
						);

						hooks.alterAssetTags.tap('guru', tags => {
							tags.assetTags.scripts = [
								...(
									maybeEnvChunk?.files?.filter(f =>
										f.endsWith('.js'),
									) ?? []
								).map(item => ({
									tagName: 'script',
									voidTag: false,
									attributes: { src: `/${item}` },
								})),
								...tags.assetTags.scripts,
							];
							return tags;
						});
					});

					hooks.beforeEmit.tapAsync('guru', (data, cb) => {
						const segs = data.html.split('<body>');
						data.html = `${segs[0]}<div id="app"></div>` + segs[1];
						cb(null, data);
					});
				});
			}
		})(),
	);

	const compiler = webpack(webpackConfig);

	let beenReadyBefore = false;
	compiler.hooks.done.tap('runner', () => {
		if (!beenReadyBefore) {
			console.log(dedent`

			You can now view ${bold(getProjectName())} in the browser.

			  Local:            ${blue(`http://${hosts[0]}:${guruConfig.port}/`)}
			  On Your Network:  ${blue(
					`http://${require('ip').address()}:${guruConfig.port}/`,
				)}

			Note that the development build is not optimized.
			To create a production build, use ${cyan('yarn build')}.

			`);

			beenReadyBefore = true;
		}
	});

	const devServer = new WebpackDevServer(compiler, {
		contentBase: join(PROJECT_ROOT, 'public'),
		publicPath: '/',
		host: hosts[0],
		allowedHosts: hosts,
		overlay: true,
		stats: 'errors-only',
		serveIndex: false,
		historyApiFallback: true,
		hot: true,
		inline: true,
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000,
		},
	});

	devServer.listen(guruConfig.port, localhost, err => {
		if (err) {
			console.log(red(err));
		}
	});
};
