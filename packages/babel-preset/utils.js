function isDevelopment(api) {
	const env = api.env();
	return env === 'development' || env === 'test';
}

module.exports = {
	isDevelopment,
};
