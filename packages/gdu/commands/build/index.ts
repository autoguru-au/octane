import { banner } from '../../lib/banner';
import { getGuruConfig } from '../../lib/config';
import { genGithubOutputs } from '../../lib/githubOutputs';
import { setEnvProd } from '../../lib/misc';
import { projectInfo } from '../../lib/terminal';
import { buildSupportedBrowsers } from '../generateBrowsers';

import { buildSPA } from './buildSPA';
import { buildSSR } from './buildSSR';
import { buildWebComponents } from './buildWebComponents';

export default async ({ tenant }) => {
	setEnvProd(true);

	const guruConfig = getGuruConfig();

	banner(tenant ? `Building for tenant: ${tenant}` : 'Building untenanted');

	await buildSupportedBrowsers();

	let stats;
	switch (guruConfig?.type) {
		case 'spa':
			stats = await buildSPA(guruConfig, tenant);
			break;
		case 'ssr':
			stats = await buildSSR(guruConfig);
			break;
		case 'web-component':
			stats = await buildWebComponents(guruConfig);
			break;
	}

	if (typeof stats !== 'undefined') {
		genGithubOutputs({
			artifact_path: stats.artifactPath,
		});
	}

	projectInfo('Done ✅');
};
