/* global globalThis */

if (!globalThis.fetch) {
	globalThis.fetch = require('node-fetch');
}
