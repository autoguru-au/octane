/* global globalThis */
/* eslint-disable unicorn/prefer-module */
if (!globalThis.fetch) {
	globalThis.fetch = require('node-fetch');
}
