const isDevelopment = (api) => {
	if(api) {
		const env = api.env();
		return env === 'development' || env === 'test';
	}
	return process.env.NODE_ENV !== 'production';
};

const isDebugging = () => {
	const isDebug = process.env.BABEL_DEBUG === 'true';
	const isAnalyze = process.env.ANALYZE === 'true';
	const command = process.env.GDU_COMMAND;

	// Only show debug output if:
	// 1. It's a build command AND analyze flag is true, OR
	// 2. Debug is explicitly enabled through DEBUG env var
	return (command === 'build' && isAnalyze) || isDebug;
};

module.exports = {
	isDevelopment,
	isDebugging,
};
