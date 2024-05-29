import { isAbsolute, join, basename } from 'path';

import { diary } from 'diary';

import { requireFromCaller } from './resolve';
import { PROJECT_ROOT } from './roots';
/* eslint-disable unicorn/prefer-module */
const { debug } = diary('gdu:config');

const readCache = new Map();

export interface GuruConfig {
	type:
		| 'ssr'
		| 'spa'
		| 'serverless'
		| 'serverless-resource'
		| 'web-component';
	mountDOMId?: string;
	mountDOMClass?: string;
	octopusPackageId: string;
	octopusProjectName: string;
	isTenanted?: boolean;
	isRoot?: boolean;
	port?: number;
	basePath?: string;
	publicPath?: string;
	distributionId?: string;
	outputPath: string;
	srcPaths?: string[];
	__configPath: string;
	__legacy_mode?: boolean;

	tap?(hooks: Record<string, any>): void;
}

export const getGuruConfig = (location = PROJECT_ROOT): GuruConfig | null => {
	const normalizePath = join(location, '/');

	const guruFilePath = join(normalizePath, 'guru.config.js');

	try {
		if (readCache.has(normalizePath)) {
			return readCache.get(normalizePath);
		}

		debug('resolving guru config @ %s', normalizePath);

		const config = requireFromCaller(guruFilePath);

		debug('resolved guru config %o', config);

		if (typeof config.type !== 'string') {
			throw new TypeError('Type is required');
		}

		const resolvedConfig = {
			...config,
			__configPath: normalizePath,
		};

		const storeThis = decorateConfig(resolvedConfig);

		debug('decorated guru config %o', storeThis);

		readCache.set(normalizePath, storeThis);

		return storeThis;
	} catch {
		debug('no guru config @ %o', normalizePath);
		return null;
	}
};

export const decorateConfig = (guruConfig: Partial<GuruConfig>): GuruConfig => {
	const project_root = guruConfig.__configPath;

	guruConfig.srcPaths =
		guruConfig.srcPaths ||
		(Boolean(guruConfig.type === 'ssr')
			? ['./pages/', './components/', './scenes/']
			: ['./src/']);

	guruConfig.outputPath =
		guruConfig.outputPath ??
		join(project_root, guruConfig.type === 'ssr' ? './.next' : './dist');

	if (!isAbsolute(guruConfig.outputPath))
		guruConfig.outputPath = join(project_root, guruConfig.outputPath);

	guruConfig.publicPath =
		(guruConfig.publicPath ?? '/').replace(/(\/+)$/g, '') + '/';

	guruConfig.isRoot = guruConfig.isRoot ?? false;

	return guruConfig as GuruConfig;
};

export const getProjectName = (location = PROJECT_ROOT) =>
	require(join(getGuruConfig(location).__configPath, './package.json')).name;

export const getProjectFolderName = (location = PROJECT_ROOT) =>
	basename(join(getGuruConfig(location).__configPath));
