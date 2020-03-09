import { createLogger } from '@autoguru/utilities';
import polka from 'polka';

import { isEnvProduction } from '../../lib/misc';
import { requireFromCaller } from '../../lib/resolve';
import { PROJECT_ROOT } from '../../lib/roots';
import { getHooks } from '../../utils/hooks';
import { createNextJSConfig } from '../next.config';

const logger = createLogger('server');

const hooks = getHooks();

export const run = async () => {
	const server = polka();

	await hooks.beforeServer.promise(server);

	const { default: next } = requireFromCaller('next');

	const nextJsConfig = createNextJSConfig();

	const app = next({
		dev: !isEnvProduction(),
		quiet: false,
		dir: PROJECT_ROOT,
		conf: nextJsConfig,
	});

	const handle = app.getRequestHandler();

	await hooks.nextJSPrepare.promise(app.prepare());

	const { pageChecker, dynamicRoutes } = app.router;

	server.use(async (req, res, next) => {
		const start = new Date().getTime();

		const incomingPath = req.originalUrl;

		const isPageWeCareAbout =
			dynamicRoutes.some(({ match }) => match(incomingPath)) ||
			(await pageChecker(incomingPath));

		await next();

		isPageWeCareAbout &&
			logger.info('response', {
				processingTime: new Date().getTime() - start,
				responseHeaders: Object.fromEntries(
					Object.entries(res.getHeaders()),
				),
				url: incomingPath,
				statusCode: res.statusCode,
			});
	});

	if ((nextJsConfig.assetPrefix ?? '/') !== '/') {
		server.get(`${nextJsConfig.assetPrefix}*`, async (req, res) => {
			req.url = req.originalUrl.replace(
				`${nextJsConfig.assetPrefix}`,
				'/',
			);
			return handle(req, res);
		});
	}

	server.all('*', (req, res) => handle(req, res));

	await hooks.afterServer.promise(server);
};
