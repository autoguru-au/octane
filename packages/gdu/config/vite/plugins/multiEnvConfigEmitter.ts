import { createHash } from 'crypto';

import {
	mergeConfigSources,
	resolveCombosForApp,
} from '../../../lib/mfeDataReader';
import type { PluginContext, VitePlugin } from '../types';

interface MultiEnvConfigEmitterOptions {
	appName: string;
	workspaceRoot: string;
	envTokenMap: Record<string, string>;
}

/**
 * Emits one init-only `mfe-configs-<env>_<tenant>-<hash>.js` script per
 * env×tenant combo the app targets, each an
 * `globalThis.__MFE_ENV__=Object.assign(globalThis.__MFE_ENV__||{},{...})`
 * seed carrying that combo's real, resolved config values. The host injects the
 * combo's script ahead of the app bundle so `globalThis.__MFE_ENV__` is defined
 * before any config read runs (00-overview §4c; 05 host read side).
 *
 * The seed merges into any existing `globalThis.__MFE_ENV__` rather than
 * replacing it: the first seed on a page behaves identically to a bare assign
 * (the global starts undefined, so `||{}` seeds a fresh object), while a later
 * seed from a second co-mounted app ADDS its keys instead of clobbering the
 * first app's. Overlapping keys are last-wins — global-config keys shared across
 * apps carry equal values by construction, so a genuine same-key/different-value
 * clash between two apps' app-configs is a data-layout concern, not one the
 * emitter can resolve. Ordering caveat: an old bare-assign artefact seeded after
 * a new merge artefact still clobbers; this resolves as apps rebuild on this gdu
 * release.
 *
 * The `mfe-configs` chunk itself is left untouched — `mfeEnvTokens` (enforce:
 * 'pre') has already rewritten its `process.env.X` reads to
 * `globalThis.__MFE_ENV__.X`, so it is env-agnostic (identical bytes for every
 * combo) and, crucially, still exports the config bindings that the rest of the
 * app graph imports. Only the tiny init scripts differ per combo, so one build
 * pass yields one env-agnostic app bundle plus N small config scripts whose
 * bytes depend solely on that combo's values. `guruBuildManifest` records the
 * emitted scripts in its `env` map.
 *
 * Config values are restricted to the keys the app actually reads (the
 * `envTokenMap` keys `mfeEnvTokens` rewrites), keeping CDK-only infra keys out
 * of the browser bundle and guaranteeing every rewritten read resolves.
 */
export function multiEnvConfigEmitter(
	opts: MultiEnvConfigEmitterOptions,
): VitePlugin {
	const allowKeys = Object.keys(opts.envTokenMap);

	return {
		name: 'gdu-multi-env-config-emitter',
		apply: 'build',

		generateBundle(this: PluginContext, _options, bundle) {
			const hasConfigChunk = Object.keys(bundle).some((fileName) =>
				// Rolldown's `[hash]` is base64url, so the app config chunk's
				// hash can contain `_` or `-` (e.g. mfe-configs-BRHYz_Ev.js).
				/^mfe-configs-[a-zA-Z\d_-]+\.js$/.test(fileName),
			);
			if (!hasConfigChunk) return;

			const combos = resolveCombosForApp(
				opts.appName,
				opts.workspaceRoot,
			);

			if (combos.length === 0) {
				console.warn(
					`gdu-multi-env-config-emitter: no env×tenant combos found for ` +
						`"${opts.appName}" in .mfe-data/mfe-list.json — no config ` +
						`scripts emitted; globalThis.__MFE_ENV__ will be uninitialised.`,
				);
				return;
			}

			for (const { env, tenant } of combos) {
				const values = mergeConfigSources(
					opts.workspaceRoot,
					opts.appName,
					env,
					tenant,
					allowKeys,
				);
				const source = `globalThis.__MFE_ENV__=Object.assign(globalThis.__MFE_ENV__||{},${JSON.stringify(values)});`;
				const hash = createHash('sha256')
					.update(source)
					.digest('hex')
					.slice(0, 8);

				this.emitFile({
					type: 'asset',
					fileName: `mfe-configs-${env}_${tenant}-${hash}.js`,
					source,
				});
			}
		},
	};
}
