import type { VitePlugin } from '../types';

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
 * The `globalThis.__MFE_ENV__` object itself is initialised by
 * `multiEnvConfigEmitter` (04-gdu-vite8.md §2.3, lands in PR13 / AG-20099),
 * which emits one config chunk per env×tenant combo. This plugin owns only the
 * key-name rewrite; it no longer bakes an init block into the `mfe-configs`
 * chunk.
 */
export function mfeEnvTokens(envTokens: Record<string, string>): VitePlugin {
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
	};
}
