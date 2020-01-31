import { green } from 'kleur';
import { banner } from '../../lib/banner';
import { getGuruConfig } from '../../lib/config';
import { genGithubOutputs } from '../../lib/githubOutputs';
import { setEnvProd } from '../../lib/misc';
import { buildSPA } from './buildSPA';
import { buildSSR } from './buildSSR';

export default async () => {
	setEnvProd(true);

	const guruConfig = getGuruConfig();

	banner('Building');

	let stats;
	if (guruConfig?.isSSR === true) {
		stats = await buildSSR(guruConfig);
	} else if (guruConfig?.isSSR === false || guruConfig?.isSSR === undefined) {
		stats = await buildSPA(guruConfig);
	}

	if (typeof stats !== 'undefined') {
		genGithubOutputs({
			artifact_path: stats.artifactPath,
		});
	}

	console.log(green('Done!'));
};
