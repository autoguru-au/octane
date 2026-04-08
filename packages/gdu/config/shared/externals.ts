import { readFileSync } from 'fs';
import path from 'path';

import { PROJECT_ROOT } from '../../lib/roots';

/**
 * Reads the actual installed version from node_modules/<pkg>/package.json.
 * This ensures the version in external URLs matches the bundled code exactly,
 * avoiding dual-instance issues when different MFEs have different semver
 * ranges in their package.json.
 */
function getInstalledVersion(
	packageName: string,
	fallback: string,
): string {
	try {
		const pkgPath = path.join(
			PROJECT_ROOT,
			'node_modules',
			packageName,
			'package.json',
		);
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
		return pkg.version || fallback;
	} catch {
		return fallback;
	}
}

export const getReactVersion = () => getInstalledVersion('react', '19');

export const getDataDogVersion = () =>
	getInstalledVersion('@datadog/browser-rum', '6.23.0');

const EXTERNALS_BASE = '/_shared/externals';

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
