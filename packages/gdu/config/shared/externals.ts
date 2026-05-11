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
	standalone?: boolean;
}

// Self-hosted esm CDN — single global hostname, drop-in replacement for esm.sh.
const ESM_CDN_BASE = 'https://esm.autoguru.com';

export const getExternals = ({ standalone }: GetExternalsOptions = {}) => {
	if (standalone) return {};

	const reactVersion = getReactVersion();
	const datadogVersion = getDataDogVersion();

	return {
		react: `${ESM_CDN_BASE}/react@${reactVersion}`,
		'react-dom': `${ESM_CDN_BASE}/react-dom@${reactVersion}`,
		'react-dom/client': `${ESM_CDN_BASE}/react-dom@${reactVersion}/client`,
		'react/jsx-runtime': `${ESM_CDN_BASE}/react@${reactVersion}/jsx-runtime`,
		// jsx-dev-runtime aliases to jsx-runtime upstream.
		'react/jsx-dev-runtime': `${ESM_CDN_BASE}/react@${reactVersion}/jsx-runtime`,

		'@datadog/browser-rum': `${ESM_CDN_BASE}/@datadog/browser-rum@${datadogVersion}`,
		'@datadog/browser-rum-react': `${ESM_CDN_BASE}/@datadog/browser-rum-react@${datadogVersion}`,
		'@datadog/browser-logs': `${ESM_CDN_BASE}/@datadog/browser-logs@${datadogVersion}`,
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
