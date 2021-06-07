const { workspaces = [] } = require('./package.json');

// eslint-disable-next-line unicorn/prefer-module
module.exports = {
	projects: workspaces,
	testPathIgnorePatterns: ['<rootDir>'],
};
