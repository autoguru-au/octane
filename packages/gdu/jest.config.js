module.exports = {
	displayName: require('./package.json').name,
	testPathIgnorePatterns: ['\\.d\\.ts$'],
	preset: '@autoguru/jest-preset',
	testMatch: ['**/__tests__/**/*.test.ts'],
};
