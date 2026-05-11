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

// Self-hosted esm CDN — single hostname, no env/tenant variation, drop-in URL
// shape mirroring esm.sh (so the only difference between dev and prod is the
// origin).
const SELF_HOSTED_BASE = 'https://esm.autoguru.com';
const ESM_SH_BASE = 'https://esm.sh';

export const getExternals = ({
	isDev = false,
	standalone,
}: GetExternalsOptions = {}) => {
	if (standalone) return {};

	const reactVersion = getReactVersion();
	const datadogVersion = getDataDogVersion();
	const base = isDev ? ESM_SH_BASE : SELF_HOSTED_BASE;

	return {
		react: `${base}/react@${reactVersion}`,
		'react-dom': `${base}/react-dom@${reactVersion}`,
		'react-dom/client': `${base}/react-dom@${reactVersion}/client`,
		'react/jsx-runtime': `${base}/react@${reactVersion}/jsx-runtime`,
		// jsx-dev-runtime aliases to jsx-runtime on both origins.
		'react/jsx-dev-runtime': `${base}/react@${reactVersion}/jsx-runtime`,

		'@datadog/browser-rum': `${base}/@datadog/browser-rum@${datadogVersion}`,
		'@datadog/browser-rum-react': `${base}/@datadog/browser-rum-react@${datadogVersion}`,
		'@datadog/browser-logs': `${base}/@datadog/browser-logs@${datadogVersion}`,
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
