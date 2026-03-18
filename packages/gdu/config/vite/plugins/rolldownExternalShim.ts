import type { VitePlugin } from '../types';

/**
 * Rolldown CJS Interop Shim for ESM External Modules
 *
 * When Rolldown bundles CJS code that `require()`s external modules, it emits
 * a CJS runtime helper that calls `require()` — which doesn't exist in browsers.
 * The built-in `esmExternalRequirePlugin` handles module-boundary conversion but
 * does not transform require calls inside Rolldown's own CJS wrapper functions.
 *
 * This plugin injects a `globalThis.require` shim into entry chunks that
 * pre-loads all external modules via dynamic `import()` and provides synchronous
 * `require()` resolution from cache. Uses top-level await (valid in ES2022 modules).
 *
 * Safety: The shim is harmless if `require()` is never called — it defines globals
 * that simply go unused. The early return when `externals` is empty prevents any
 * injection for standalone builds.
 *
 * CDN resilience: Uses `Promise.allSettled()` so a single CDN failure does not
 * blank the page. Successfully loaded modules are cached; failed ones log errors.
 *
 * Multi-MFE safety: If `globalThis.require` already exists (from another Vite MFE
 * on the same page), the shim chains to the existing function rather than
 * overwriting it, preserving the previous MFE's module cache.
 *
 * Constraint: Rolldown is the chosen bundler — no downgrade to Rollup is permitted.
 */
export function rolldownExternalShim(
	externals: Record<string, string>,
): VitePlugin {
	const externalUrls = Object.values(externals);

	if (externalUrls.length === 0) {
		return { name: 'rolldown-external-shim' };
	}

	return {
		name: 'rolldown-external-shim',
		apply: 'build',

		renderChunk(code, chunk) {
			// [H1] Use chunk.isEntry — config-agnostic, set by Rolldown itself.
			if (!chunk.isEntry) return null;

			// [H2] No content heuristic needed. The shim is harmless if require()
			// is never called at runtime. The externals guard above already gates
			// injection for standalone builds.

			const preloads = externalUrls
				.map(
					(url) =>
						`import(${JSON.stringify(url)}).then(function(m){__xrc[${JSON.stringify(url)}]=m}).catch(function(e){console.error("[rolldown-shim] Failed:",${JSON.stringify(url)},e)})`,
				)
				.join(',');

			const shim = [
				`var __xrc={};`,
				// [H3] Promise.allSettled — partial CDN failure caches what succeeded.
				`await Promise.allSettled([${preloads}]);`,
				// [H4] Chain to existing require (multi-Vite-MFE safety).
				`var __prev=typeof globalThis.require==="function"?globalThis.require:null;`,
				`globalThis.require=function(id){`,
				`if(__xrc[id])return __xrc[id];`,
				`if(__prev)return __prev(id);`,
				`console.error("[rolldown-shim] Unknown module:",id);`,
				`return{}};`,
			].join('');

			return { code: shim + code, map: null };
		},
	};
}
