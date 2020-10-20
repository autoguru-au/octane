import bugger from 'debug';

import { getGuruConfig } from '../lib/config';

const debug = bugger('gdu:hooks');

const HOOKS = {};

export const registerHooks = (hooks: Record<string, any>) => {
	debug('registering hooks %o', Object.keys(hooks));

	Object.assign(HOOKS, hooks);

	return hooks;
};

export const getHooks = (): Record<string, any> => HOOKS;

export const bindHooks = () => {
	const cfg = getGuruConfig();

	if (typeof cfg?.tap === 'function') {
		debug('running hooks');

		cfg.tap(getHooks());
	}
};
