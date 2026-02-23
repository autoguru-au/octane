import { existsSync } from 'fs';
import { join } from 'path';

import { cyan, magenta } from 'kleur';

import viteConfigs from '../../config/vite';
import { guruConfigCjsPlugin } from '../../config/vite/plugins/guruConfigCjs';
import { relayPlugin } from '../../config/vite/plugins/relay';
import { translationHashingPlugin } from '../../config/vite/plugins/TranslationHashingPlugin';
import type { InlineConfig } from '../../config/vite/types';
import { GuruConfig } from '../../lib/config';
import { CALLING_WORKSPACE_ROOT, PROJECT_ROOT } from '../../lib/roots';

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
		const { vanillaExtractPlugin } = require('@vanilla-extract/vite-plugin');
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
	runtimePlugins.push(
		translationHashingPlugin({
			appDir: PROJECT_ROOT,
			workspaceRoot: CALLING_WORKSPACE_ROOT || PROJECT_ROOT,
		}),
	);

	const { build } = require('vite') as {
		build: (config: InlineConfig) => Promise<unknown>;
	};

	for (const config of configs) {
		const mergedConfig: InlineConfig = {
			...config,
			plugins: [...runtimePlugins, ...(config.plugins || [])],
		};

		await build(mergedConfig);
	}

	return {
		artifactPath: guruConfig.outputPath,
	};
};
