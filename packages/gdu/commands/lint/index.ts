import {banner} from '../../lib/banner';
import {getGuruConfig} from '../../lib/config';
import {setEnvProd} from '../../lib/misc';
import {projectInfo} from '../../lib/terminal';
import execa from "execa";
import {GDU_ROOT, PROJECT_ROOT} from "../../lib/roots";
import {dim} from "kleur";
import {createLogger} from "@autoguru/utilities";

const logger = createLogger('build');
export default async () => {
	setEnvProd(true);

	const guruConfig = getGuruConfig();
	const appName = guruConfig.publicPath.replace(/^\//, '');
	banner(`Linting ${appName}`);

	const start = Date.now();
	execa
		.command(`yarn tsc --project tsconfig.json --noEmit --skipLibCheck --skipDefaultLibCheck --noImplicitReturns`, {
			stdio: 'inherit',
			cwd: PROJECT_ROOT,
			localDir: GDU_ROOT,
			extendEnv: true,
			// @ts-ignore
			env: {
				NODE_ENV: 'production',
				APP_ENV: process.env.APP_ENV || 'prod',
			},
		})
		.then(
			() => {

				projectInfo(`${appName} ✅`);
				console.log(
					`${dim('SUCCESS!')}`,
				);
			},
			(error) => {
				logger.error('response', {
					processingTime: Date.now() - start,
					responseHeaders: Object.fromEntries(
						Object.entries(error.getHeaders()),
					),
					url: 'incomingPath',
					statusCode: error.statusCode,
				});
				throw error;
			},
		);

	execa
		.command(`eslint --fix --quiet  \"{*,src/**/*}.{ts,tsx,js}\"`, {
			stdio: 'inherit',
			cwd: PROJECT_ROOT,
			localDir: GDU_ROOT,
			extendEnv: true,
			// @ts-ignore
			env: {
				NODE_ENV: 'production',
				APP_ENV: process.env.APP_ENV || 'prod',
			},
		})
		.then(
			() => {

				projectInfo(`${appName} ✅`);
				console.log(
					`${dim('SUCCESS!')}`,
				);
			},
			(error) => {
				logger.error('response', {
					processingTime: Date.now() - start,
					responseHeaders: Object.fromEntries(
						Object.entries(error.getHeaders()),
					),
					url: 'incomingPath',
					statusCode: error.statusCode,
				});
				throw error;
			},
		);
};
