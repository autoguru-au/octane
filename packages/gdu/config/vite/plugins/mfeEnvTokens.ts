import type { VitePlugin } from '../types';

export interface MfeEnvTokensOptions {
	/**
	 * When true (the safe default), the plugin prepends a
	 * `globalThis.__MFE_ENV__={...#{TOKEN}...}` init block to the `mfe-configs`
	 * chunk — the single-env contract the old host + 6 old pipelines expect
	 * (`tokenReplacement.sh`/`sed` substitute the `#{TOKEN}` placeholders at
	 * deploy time). When false, no init block is baked and `globalThis.__MFE_ENV__`
	 * is instead initialised by the per-combo scripts `multiEnvConfigEmitter`
	 * emits (04-gdu-vite8.md §2.8).
	 */
	bakeInitBlock?: boolean;
}

/**
 * Rewrites `process.env.XXX` reads to `globalThis.__MFE_ENV__["XXX"]` so
 * per-env/tenant config can be injected as a separate chunk rather than
 * constant-folded into application code.
 *
 * Problem: Vite's `define` replaces `process.env.XXX` with a string literal.
 * Rolldown then inlines that literal into every consumer chunk, scattering
 * config across dozens of files — impossible to swap per env/tenant at build
 * time.
 *
 * Solution: This plugin runs before `define` (`enforce: 'pre'`) and rewrites
 * `process.env.XXX` → `globalThis.__MFE_ENV__["XXX"]`. Dynamic property access
 * cannot be constant-folded, so every config read resolves through a single
 * `globalThis.__MFE_ENV__` object at runtime, keeping application chunk bytes
 * independent of which env's values are in play.
 *
 * How `globalThis.__MFE_ENV__` is initialised depends on the build mode
 * (04-gdu-vite8.md §2.8). In the default single-env contract (`bakeInitBlock`
 * true) the plugin's `renderChunk` prepends the init block to the `mfe-configs`
 * chunk. In multi-env mode (`bakeInitBlock` false) `multiEnvConfigEmitter` emits
 * one init-only script per env×tenant combo and the plugin owns only the
 * key-name rewrite. The rewrite itself runs in both modes.
 */
export function mfeEnvTokens(
	envTokens: Record<string, string>,
	options: MfeEnvTokensOptions = {},
): VitePlugin {
	const { bakeInitBlock = true } = options;
	const keys = Object.keys(envTokens);
	if (keys.length === 0) {
		return { name: 'gdu-mfe-env-tokens' };
	}

	const escapedKeys = keys.map((k) =>
		k.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`),
	);
	const pattern = new RegExp(
		`\\bprocess\\.env\\.(${escapedKeys.join('|')})\\b`,
		'g',
	);

	const initEntries = keys
		.map((key) => `${JSON.stringify(key)}:${envTokens[key]}`)
		.join(',');
	const initCode = `globalThis.__MFE_ENV__={${initEntries}};`;

	return {
		name: 'gdu-mfe-env-tokens',
		apply: 'build',
		enforce: 'pre',

		transform(code) {
			if (!code.includes('process.env.')) return null;

			const result = code.replace(
				pattern,
				(_, key) => `globalThis.__MFE_ENV__[${JSON.stringify(key)}]`,
			);

			return result === code ? null : { code: result, map: null };
		},

		...(bakeInitBlock
			? {
					renderChunk(code, chunk) {
						// Only the root-level app config chunk
						// (`mfe-configs-<hash>.js`); every other chunk is emitted
						// under `chunks/`, so an anchored match avoids baking into
						// confusably named chunks (e.g. `chunks/mfe-configs-*`).
						if (!chunk.fileName.startsWith('mfe-configs'))
							return null;
						return { code: initCode + code, map: null };
					},
				}
			: {}),
	};
}
