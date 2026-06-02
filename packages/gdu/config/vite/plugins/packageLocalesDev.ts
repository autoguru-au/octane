import { promises as fs } from 'fs';
import path from 'path';

import type { VitePlugin } from '../types';

import {
	discoverPackageTranslations,
	getEffectiveNamespace,
} from './TranslationHashingPlugin';

const PLUGIN_NAME = 'gdu-package-locales-dev';

export interface CopyPackageLocalesOptions {
	// Monorepo root containing the `packages/` directory to scan.
	workspaceRoot: string;
	// Consuming app directory whose `public/locales/<lang>/` is the copy target.
	appDir: string;
	// Locales to skip (e.g. ones the app deliberately excludes).
	excludeLocales?: string[];
}

/**
 * Dev-mode equivalent of the webpack TranslationHashingPlugin's
 * copyPackageTranslationsToDev. The Vite TranslationHashingPlugin runs at build
 * time only (apply: 'build'), so the Vite dev server never makes shared-package
 * (`pkg-*`) translation namespaces available and they render as raw keys. This
 * discovers every monorepo package that declares i18n locales and writes its
 * namespaces into the consuming app's public/locales/<lang>/<pkg-namespace>.json
 * so Vite serves them statically. Files land gitignored, matching the webpack
 * behaviour; .scripts/clean-package-translations.js clears them. See AG-19249.
 */
export async function copyPackageLocalesForDev({
	workspaceRoot,
	appDir,
	excludeLocales = [],
}: CopyPackageLocalesOptions): Promise<{ packages: number; files: number }> {
	const packageTranslations =
		await discoverPackageTranslations(workspaceRoot);
	const publicLocalesPath = path.join(appDir, 'public', 'locales');

	let files = 0;

	for (const [packageName, localeMap] of packageTranslations) {
		for (const [locale, namespaces] of localeMap) {
			if (excludeLocales.includes(locale)) continue;

			const targetLocaleDir = path.join(publicLocalesPath, locale);
			await fs.mkdir(targetLocaleDir, { recursive: true });

			for (const [namespace, translations] of Object.entries(
				namespaces,
			)) {
				const effectiveNamespace = getEffectiveNamespace(
					namespace,
					packageName,
				);
				await fs.writeFile(
					path.join(targetLocaleDir, `${effectiveNamespace}.json`),
					JSON.stringify(translations, null, 2),
				);
				files++;
			}
		}
	}

	return { packages: packageTranslations.size, files };
}

/**
 * Vite dev plugin that copies monorepo package locales into the consuming app's
 * public/locales at server start. Without it, `pkg-*` namespaces 404 in dev and
 * render as raw i18n keys for every Vite MFE. See AG-19249.
 */
export function packageLocalesDevPlugin(
	options: CopyPackageLocalesOptions,
): VitePlugin {
	return {
		name: PLUGIN_NAME,
		async configureServer() {
			try {
				const { packages, files } =
					await copyPackageLocalesForDev(options);
				if (files > 0) {
					console.log(
						`[${PLUGIN_NAME}] Copied ${files} package locale file(s) from ${packages} package(s) into public/locales`,
					);
				}
			} catch (error) {
				console.warn(
					`[${PLUGIN_NAME}] Failed to copy package locales:`,
					error,
				);
			}
		},
	};
}
