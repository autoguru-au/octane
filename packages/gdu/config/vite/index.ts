import { isProductionBuild } from '../../lib/misc';
import { getBuildEnvs } from '../../utils/configs';

import type { InlineConfig } from './types';
import { baseViteOptions, makeViteConfig } from './vite.config';

export interface ViteConfigOpts {
	env: string;
	isDebug?: boolean;
	standalone?: boolean;
}

export default (options: ViteConfigOpts): InlineConfig[] => {
	const { env = process.env.APP_ENV, standalone } = options;
	const isProduction = isProductionBuild();
	const buildEnvs = getBuildEnvs(env);

	if (isProduction) {
		const isMultiEnv = buildEnvs.length > 1;
		return buildEnvs.map((buildEnv) =>
			makeViteConfig(buildEnv, isMultiEnv, standalone),
		) as InlineConfig[];
	} else {
		const buildEnv = env || 'dev_au';

		return [
			baseViteOptions({
				buildEnv,
				isMultiEnv: false,
				standalone,
			}),
		] as InlineConfig[];
	}
};
