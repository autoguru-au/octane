import { existsSync } from 'fs';
import { join } from 'path';

import { cyan, magenta } from 'kleur';

import { getExternals } from '../../config/shared/externals';
import viteConfigs from '../../config/vite';
import { translationHashingPlugin } from '../../config/vite/plugins/TranslationHashingPlugin';
import { guruConfigCjsPlugin } from '../../config/vite/plugins/guruConfigCjs';
import { relayPlugin } from '../../config/vite/plugins/relay';
import type { InlineConfig } from '../../config/vite/types';
import { GuruConfig } from '../../lib/config';
import { CALLING_WORKSPACE_ROOT, PROJECT_ROOT } from '../../lib/roots';

// Native dynamic import that TypeScript CJS output won't rewrite to require()
const dynamicImport = new Function('specifier', 'return import(specifier)') as (
	specifier: string,
) => Promise<any>;

async function loadEsmExternalPlugin(
	externalKeys: string[],
	plugins: unknown[],
): Promise<boolean> {
	if (externalKeys.length === 0) return false;

	try {
		const { esmExternalRequirePlugin } = (await dynamicImport('vite')) as {
			esmExternalRequirePlugin: (config: {
				external: Array<string | RegExp>;
			}) => unknown;
		};
		plugins.push(esmExternalRequirePlugin({ external: externalKeys }));
		return true;
	} catch {
		console.warn(
			magenta(
				'Warning: esmExternalRequirePlugin could not be loaded from vite. ' +
					'CJS require() shims for externalised modules may not be resolved correctly.',
			),
		);
		return false;
	}
}

export const buildSPAVite = async (guruConfig: GuruConfig) => {
	console.log(cyan('Building SPA with Vite...'));

	if (typeof guruConfig.tap === 'function') {
		console.warn(
			magenta(
				'Warning: tap() hooks are not supported with the Vite bundler. ' +
					'Custom webpack configuration in guru.config.js will not be applied.',
			),
		);
	}

	const configs = viteConfigs({
		env: void 0,
		isDebug: false,
		standalone: guruConfig?.standalone,
	});

	// Load runtime plugins that cannot be resolved at tsc compile time.
	const runtimePlugins: unknown[] = [];

	try {
		const { vanillaExtractPlugin } = await dynamicImport(
			'@vanilla-extract/vite-plugin',
		);
		runtimePlugins.push(vanillaExtractPlugin());
	} catch {
		// Vanilla Extract plugin not available.
	}

	if (CALLING_WORKSPACE_ROOT) {
		const artifactDir = join(
			CALLING_WORKSPACE_ROOT,
			'packages',
			'relay',
			'__generated__',
		);
		if (existsSync(artifactDir)) {
			runtimePlugins.push(relayPlugin(artifactDir));
		}
	}

	runtimePlugins.push(guruConfigCjsPlugin());

	const externalKeys = Object.keys(getExternals(guruConfig?.standalone));
	await loadEsmExternalPlugin(externalKeys, runtimePlugins);

	runtimePlugins.push(
		translationHashingPlugin({
			appDir: PROJECT_ROOT,
			workspaceRoot: CALLING_WORKSPACE_ROOT || PROJECT_ROOT,
		}),
	);

	if (process.env.ANALYZE === 'true') {
		try {
			const { visualizer } = await dynamicImport(
				'rollup-plugin-visualizer',
			);
			runtimePlugins.push(
				visualizer({
					filename: join(guruConfig.outputPath, 'bundle-report.html'),
					open: false,
					gzipSize: true,
					brotliSize: true,
					template: 'treemap',
				}),
			);
		} catch {
			console.warn(
				magenta(
					'Warning: rollup-plugin-visualizer is not installed. ' +
						'Install it to enable bundle analysis for Vite builds: ' +
						'yarn add -D rollup-plugin-visualizer',
				),
			);
		}
	}

	const { build } = (await dynamicImport('vite')) as {
		build: (config: InlineConfig) => Promise<unknown>;
	};

	for (const config of configs) {
		const mergedConfig: InlineConfig = {
			...config,
			build: config.build ? { ...config.build } : undefined,
			plugins: [...runtimePlugins, ...(config.plugins || [])],
		};

		await build(mergedConfig);
	}

	return {
		artifactPath: guruConfig.outputPath,
	};
};
