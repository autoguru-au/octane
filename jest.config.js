const { workspaces = [] } = require('./package.json');

module.exports = {
	projects: workspaces,
	testPathIgnorePatterns: ['<rootDir>'],
};
