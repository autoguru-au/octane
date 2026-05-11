import path from 'path';

import { PROJECT_ROOT } from '../../lib/roots';

export const getReactVersion = () => {
	try {
		const packagePath = path.join(PROJECT_ROOT, 'package.json');
		const pkg = require(packagePath);
		return (pkg.dependencies?.react || '19').replace('^', '');
	} catch {
		return '19';
	}
};

export const getDataDogVersion = () => {
	try {
		const packagePath = path.join(PROJECT_ROOT, 'package.json');
		const pkg = require(packagePath);
		return (pkg.dependencies?.['@datadog/browser-rum'] || '6.23.0').replace(
			/^[\^~>=<]+/,
			'',
		);
	} catch {
		return '6.23.0';
	}
};

export interface GetExternalsOptions {
	isDev?: boolean;
	standalone?: boolean;
}

// #{PUBLIC_PATH_BASE} is replaced at deploy time by Octopus Deploy with the
// per-environment / per-tenant CDN base URL (same token used by getPublicPath).
const SELF_HOSTED_BASE = '#{PUBLIC_PATH_BASE}/_shared/externals';
const ESM_SH_BASE = 'https://esm.sh';

export const getExternals = ({
	isDev = false,
	standalone,
}: GetExternalsOptions = {}) => {
	if (standalone) return {};

	const reactVersion = getReactVersion();
	const datadogVersion = getDataDogVersion();

	if (isDev) {
		return {
			react: `${ESM_SH_BASE}/react@${reactVersion}`,
			'react-dom': `${ESM_SH_BASE}/react-dom@${reactVersion}`,
			'react-dom/client': `${ESM_SH_BASE}/react-dom@${reactVersion}/client`,
			'react/jsx-runtime': `${ESM_SH_BASE}/react@${reactVersion}/jsx-runtime`,
			'react/jsx-dev-runtime': `${ESM_SH_BASE}/react@${reactVersion}/jsx-runtime`,

			'@datadog/browser-rum': `${ESM_SH_BASE}/@datadog/browser-rum@${datadogVersion}`,
			'@datadog/browser-rum-react': `${ESM_SH_BASE}/@datadog/browser-rum-react@${datadogVersion}`,
			'@datadog/browser-logs': `${ESM_SH_BASE}/@datadog/browser-logs@${datadogVersion}`,
		};
	}

	return {
		react: `${SELF_HOSTED_BASE}/react@${reactVersion}/react.js`,
		'react-dom': `${SELF_HOSTED_BASE}/react-dom@${reactVersion}/react-dom.js`,
		'react-dom/client': `${SELF_HOSTED_BASE}/react-dom@${reactVersion}/client.js`,
		'react/jsx-runtime': `${SELF_HOSTED_BASE}/react@${reactVersion}/jsx-runtime.js`,
		// esm.sh aliases jsx-dev-runtime to jsx-runtime; self-hosted bundles
		// follow the same convention (single file serves both specifiers).
		'react/jsx-dev-runtime': `${SELF_HOSTED_BASE}/react@${reactVersion}/jsx-runtime.js`,

		'@datadog/browser-rum': `${SELF_HOSTED_BASE}/@datadog/browser-rum@${datadogVersion}/index.js`,
		'@datadog/browser-rum-react': `${SELF_HOSTED_BASE}/@datadog/browser-rum-react@${datadogVersion}/index.js`,
		'@datadog/browser-logs': `${SELF_HOSTED_BASE}/@datadog/browser-logs@${datadogVersion}/index.js`,
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
