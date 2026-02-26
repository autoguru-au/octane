import type { VitePlugin } from '../types';

/**
 * Derives the public path at runtime from the entry module's import.meta.url.
 *
 * Webpack solves this via __webpack_require__.p set in set-public-path.js.
 * Vite bakes `base` into the preload helper at build time, but the
 * #{PUBLIC_PATH_BASE} Octopus token cannot survive inside minified JS.
 *
 * This plugin:
 *   1. Prepends entry chunks with a namespaced global that captures the CDN
 *      base from import.meta.url (e.g. https://mfe.au-dev.autoguru.com/fmo-booking/)
 *   2. Patches the Vite preload helper so it reads the namespaced global
 *      instead of using the hardcoded "/" base value.
 *
 * Each MFE gets its own key inside `globalThis.__GDU_PUBLIC_PATHS__` so that
 * multiple MFEs on the same page don't clobber each other's public path.
 */
export function runtimePublicPath(projectName: string): VitePlugin {
	const key = JSON.stringify(projectName);

	return {
		name: 'gdu-runtime-public-path',
		apply: 'build',

		renderChunk(code, chunk) {
			let modified = code;
			let changed = false;

			// 1. Entry chunks: derive the public path from import.meta.url
			//    and store it in a per-MFE slot on a shared global object.
			//    e.g. "https://cdn/fmo-booking/main-abc.js" → "https://cdn/fmo-booking/"
			if (chunk.isEntry) {
				modified =
					`(globalThis.__GDU_PUBLIC_PATHS__=globalThis.__GDU_PUBLIC_PATHS__||{})[${key}]=new URL(".",import.meta.url).href;` +
					modified;
				changed = true;
			}

			// 2. Patch the Vite preload helper's URL resolver function.
			//    At renderChunk time (before final minification), the code is:
			//      assetsURL = function(dep) { return "/" + dep; };
			//    We replace the hardcoded "/" with the per-MFE runtime path.
			if (modified.includes('modulepreload')) {
				const patched = modified.replace(
					/return\s*["'`]\/["'`]\s*\+\s*(\w)/,
					`return((globalThis.__GDU_PUBLIC_PATHS__||{})[${key}]||"/")+$1`,
				);
				if (patched !== modified) {
					modified = patched;
					changed = true;
				}
			}

			return changed ? { code: modified, map: null } : null;
		},
	};
}
