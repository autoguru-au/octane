import bugger from 'debug';
import { Hook } from 'tapable';

import { getGuruConfig } from '../lib/config';

const debug = bugger('gdu:hooks');

const HOOKS = {};

export const registerHooks = (hooks: Record<string, Hook>) => {
	debug('registering hooks %o', Object.keys(hooks));

	Object.assign(HOOKS, hooks);

	return hooks;
};

export const getHooks = (): Record<string, Hook> => HOOKS;

export const bindHooks = () => {
	const cfg = getGuruConfig();

	if (typeof cfg?.tap === 'function') {
		debug('running hooks');

		cfg.tap(getHooks());
	}
};
