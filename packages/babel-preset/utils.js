const isDevelopment = (api) => {
	const env = api.env();
	return env === 'development' || env === 'test';
};
const isDebugging = (api) => {
	const isDev = isDevelopment(api);
	const env = api.env();
	const isDebug = process.env.DEBUG === 'true';
	return isDev && (env === 'debug' || isDebug);
};
module.exports = {
	isDevelopment,
	isDebugging,
};
