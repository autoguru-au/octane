function isDevelopment(api) {
	const env = api.env();
	return env === 'development' || env === 'test';
}

// eslint-disable-next-line unicorn/prefer-module
module.exports = {
	isDevelopment,
};
