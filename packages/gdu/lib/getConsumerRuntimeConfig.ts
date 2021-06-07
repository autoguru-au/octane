import deepmerge from 'deepmerge';
import { loadAll } from 'js-yaml';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CALLING_WORKSPACE_ROOT, PROJECT_ROOT } from './roots';

const reader = (path) => {
	try {
		return readFileSync(path, 'utf8');
	} catch {
		return '';
	}
};

interface ConfigThing {
	env?: string;
}

export function* getConsumerRuntimeConfig(): Generator<{
	name: string;
	config: unknown;
}> {
	// Get all configs for the current tree

	const configFiles = [
		CALLING_WORKSPACE_ROOT
			? join(CALLING_WORKSPACE_ROOT, 'config.yml')
			: null,
		join(PROJECT_ROOT, 'config.yml'),
	].filter(Boolean);

	// Load all yaml's
	// @ts-ignore
	const configFilesContent: ConfigThing[] = configFiles
		.map((i) => reader(i))
		.flatMap((i) => loadAll(i))
		.filter(Boolean);

	const bases = configFilesContent.filter((item) => !item.env);
	const envs = configFilesContent.filter((item) => item.env);

	const base = deepmerge.all(bases);

	yield {
		name: 'base',
		config: base,
	};

	let currentEnv;
	// eslint-disable-next-line no-cond-assign
	while ((currentEnv = envs.shift())) {
		const { env: name, ...config } = currentEnv;

		// Collect all other envs for this current one
		let others = [];
		while (envs.some((i) => i.env === name)) {
			const otherIdx = envs.findIndex((i) => i.env === name);
			others = others.concat(envs.splice(otherIdx, 1));
		}

		const resolvedConfig: ConfigThing & unknown = deepmerge.all([
			base,
			config,
			...others,
		]);

		delete resolvedConfig.env;

		yield {
			name,
			config: resolvedConfig,
		};

		if (envs.length === 0) break;
	}
}
