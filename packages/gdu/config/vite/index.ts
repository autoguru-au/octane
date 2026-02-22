import { isProductionBuild } from '../../lib/misc';
import { getBuildEnvs } from '../../utils/configs';

import { baseViteOptions, makeViteConfig } from './vite.config';

// Inline the InlineConfig shape so tsc compiles without a vite dependency.
// At runtime, the actual Vite types are structurally compatible.
interface InlineConfig {
	resolve?: Record<string, unknown>;
	define?: Record<string, string>;
	build?: Record<string, unknown>;
	esbuild?: Record<string, unknown>;
	plugins?: unknown[];
	base?: string;
	[key: string]: unknown;
}

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
