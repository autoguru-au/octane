import { readFileSync } from 'fs';
import path from 'path';

import { PROJECT_ROOT } from '../../lib/roots';

/**
 * Reads the actual installed version from node_modules/<pkg>/package.json.
 * This ensures the version in external URLs matches the bundled code exactly,
 * avoiding dual-instance issues when different MFEs have different semver
 * ranges in their package.json.
 */
function getInstalledVersion(packageName: string, fallback: string): string {
	try {
		const pkgPath = path.join(
			PROJECT_ROOT,
			'node_modules',
			packageName,
			'package.json',
		);
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
		const version = pkg.version || fallback;

		// Defence-in-depth: reject versions with path traversal characters.
		// npm enforces valid semver on publish so this should never trigger,
		// but prevents malicious node_modules from influencing file paths.
		if (/[/\\]|\.\./.test(version)) {
			return fallback;
		}

		return version;
	} catch {
		return fallback;
	}
}

export const getReactVersion = () => getInstalledVersion('react', '19');

export const getDataDogVersion = () =>
	getInstalledVersion('@datadog/browser-rum', '6.23.0');

/**
 * Base URL for self-hosted external bundles.
 *
 * Configurable via the EXTERNALS_CDN_URL environment variable. In CI/CD,
 * set this to the CloudFront URL of the dedicated shared-deps bucket
 * (e.g., EXTERNALS_CDN_URL=https://shared-deps.autoguru.com).
 *
 * When unset, falls back to the root-relative path /_shared/externals
 * which works for local development and the webpack/vite dev servers.
 *
 * Cross-dependency imports within externals bundles use relative URLs
 * (./react@19.mjs) so they resolve correctly regardless of the origin.
 *
 * DEPLOYMENT: Use `gdu deploy-externals --bucket <name>` to upload
 * built externals to the dedicated S3 bucket. The command sets
 * Content-Type: application/javascript for .mjs files automatically.
 */
export const EXTERNALS_BASE =
	process.env.EXTERNALS_CDN_URL || '/_shared/externals';

export const getExternals = (standalone?: boolean) => {
	const reactVersion = getReactVersion();
	const datadogVersion = getDataDogVersion();
	return standalone
		? {}
		: {
				react: `${EXTERNALS_BASE}/react@${reactVersion}.mjs`,
				'react-dom': `${EXTERNALS_BASE}/react-dom@${reactVersion}.mjs`,
				'react-dom/client': `${EXTERNALS_BASE}/react-dom-client@${reactVersion}.mjs`,
				'react/jsx-runtime': `${EXTERNALS_BASE}/jsx-runtime@${reactVersion}.mjs`,
				'react/jsx-dev-runtime': `${EXTERNALS_BASE}/jsx-runtime@${reactVersion}.mjs`,

				// DataDog externals
				'@datadog/browser-rum': `${EXTERNALS_BASE}/browser-rum@${datadogVersion}.mjs`,
				'@datadog/browser-rum-react': `${EXTERNALS_BASE}/browser-rum-react@${datadogVersion}.mjs`,
				'@datadog/browser-logs': `${EXTERNALS_BASE}/browser-logs@${datadogVersion}.mjs`,
			};
};

// --- ROLLBACK: To revert to esm.sh, uncomment the block below and comment
// out the getExternals above. Then remove the copyExternalsToOutput() calls
// from buildSPA.ts and buildSPA-vite.ts. Rebuild and redeploy all MFEs.
//
// export const getExternals = (standalone?: boolean) => {
// 	const reactVersion = getReactVersion();
// 	const datadogVersion = getDataDogVersion();
// 	return standalone
// 		? {}
// 		: {
// 				react: `https://esm.sh/react@${reactVersion}`,
// 				'react-dom': `https://esm.sh/react-dom@${reactVersion}`,
// 				'react-dom/client': `https://esm.sh/react-dom@${reactVersion}/client`,
// 				'react/jsx-runtime': `https://esm.sh/react@${reactVersion}/jsx-runtime`,
// 				'react/jsx-dev-runtime': `https://esm.sh/react@${reactVersion}/jsx-runtime`,
// 				'@datadog/browser-rum': `https://esm.sh/@datadog/browser-rum@${datadogVersion}`,
// 				'@datadog/browser-rum-react': `https://esm.sh/@datadog/browser-rum-react@${datadogVersion}`,
// 				'@datadog/browser-logs': `https://esm.sh/@datadog/browser-logs@${datadogVersion}`,
// 			};
// };

export const getPublicPath = ({
	isDev,
	projectFolderName,
}: {
	buildEnv: string;
	isTenanted: boolean;
	isDev: boolean;
	projectFolderName: string;
}): string => {
	if (isDev) return '/';

	// All non-dev builds use Octopus Deploy variable substitution.
	// #{PUBLIC_PATH_BASE} is replaced at deploy time with the correct CDN URL
	// per environment (uat, preprod, prod, etc.).
	return `#{PUBLIC_PATH_BASE}/${projectFolderName}/`;
};
