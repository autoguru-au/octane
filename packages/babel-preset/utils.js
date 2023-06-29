function isDevelopment(api) {
	const env = api.env();
	return env === 'development' || env === 'test';
}
function isDebugging(api) {
	const isDev = isDevelopment(api);
	const env = api.env();
	return isDev || env === 'debug';
}

// eslint-disable-next-line unicorn/prefer-module
module.exports = {
	isDevelopment,
	isDebugging,
};
