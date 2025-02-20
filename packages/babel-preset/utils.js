function isDevelopment(api) {
	const env = api.env();
	return env === 'development' || env === 'test';
}
function isDebugging(api) {
	const isDev = isDevelopment(api);
	const env = api.env();
	return isDev || env === 'debug';
}

module.exports = {
	isDevelopment,
	isDebugging,
};
