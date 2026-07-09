import { isProductionBuild } from '../../lib/misc';
import { getBuildEnvs } from '../../utils/configs';

import type { InlineConfig } from './types';
import { baseViteOptions, makeViteConfig } from './vite.config';

export interface ViteConfigOpts {
	env: string;
	isDebug?: boolean;
	standalone?: boolean;
}

/**
 * Multi-env config emission is opt-in per build via `GDU_MULTI_ENV_CONFIG`.
 * When unset (the default) the build restores the single-env contract: the
 * `mfe-configs` chunk carries a baked `globalThis.__MFE_ENV__={...#{TOKEN}...}`
 * init block and no per-combo scripts or manifest `env` map are emitted
 * (04-gdu-vite8.md §2.8). This is the single env-read site — the config
 * functions take a plain boolean so both modes are unit-testable without env
 * mutation.
 */
const multiEnvConfig = ['1', 'true'].includes(
	(process.env.GDU_MULTI_ENV_CONFIG ?? '').toLowerCase(),
);

export default (options: ViteConfigOpts): InlineConfig[] => {
	const { env = process.env.APP_ENV, standalone } = options;
	const isProduction = isProductionBuild();
	const buildEnvs = getBuildEnvs(env);

	if (isProduction) {
		const isMultiEnv = buildEnvs.length > 1;
		return buildEnvs.map((buildEnv) =>
			makeViteConfig(buildEnv, isMultiEnv, standalone, multiEnvConfig),
		) as InlineConfig[];
	} else {
		const buildEnv = env || 'dev_au';

		return [
			baseViteOptions({
				buildEnv,
				isMultiEnv: false,
				standalone,
				multiEnvConfig,
			}),
		] as InlineConfig[];
	}
};
