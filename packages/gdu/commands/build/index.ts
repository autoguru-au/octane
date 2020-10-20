import { banner } from '../../lib/banner';
import { getGuruConfig } from '../../lib/config';
import { genGithubOutputs } from '../../lib/githubOutputs';
import { setEnvProd } from '../../lib/misc';
import { projectInfo } from '../../lib/terminal';

import { buildSPA } from './buildSPA';
import { buildSSR } from './buildSSR';

export default async () => {
	setEnvProd(true);

	const guruConfig = getGuruConfig();

	banner('Building');

	let stats;
	if (guruConfig?.type === 'ssr') {
		stats = await buildSSR(guruConfig);
	} else if (guruConfig?.type === 'spa') {
		stats = await buildSPA(guruConfig);
	}

	if (typeof stats !== 'undefined') {
		genGithubOutputs({
			artifact_path: stats.artifactPath,
		});
	}

	projectInfo('Done ✅');
};
