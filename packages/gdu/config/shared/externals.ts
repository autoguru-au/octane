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

export const getExternals = (standalone?: boolean) => {
	const reactVersion = getReactVersion();
	const datadogVersion = getDataDogVersion();
	return standalone
		? {}
		: {
				react: `https://esm.sh/react@${reactVersion}`,
				'react-dom': `https://esm.sh/react-dom@${reactVersion}`,
				'react-dom/client': `https://esm.sh/react-dom@${reactVersion}/client`,
				'react/jsx-runtime': `https://esm.sh/react@${reactVersion}/jsx-runtime`,
				'react/jsx-dev-runtime': `https://esm.sh/react@${reactVersion}/jsx-runtime`,

				// DataDog externals
				'@datadog/browser-rum': `https://esm.sh/@datadog/browser-rum@${datadogVersion}`,
				'@datadog/browser-rum-react': `https://esm.sh/@datadog/browser-rum-react@${datadogVersion}`,
				'@datadog/browser-logs': `https://esm.sh/@datadog/browser-logs@${datadogVersion}`,
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
