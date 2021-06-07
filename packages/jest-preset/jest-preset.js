/* eslint-disable unicorn/prefer-module */
module.exports = {
	moduleFileExtensions: ['ts', 'tsx', 'jsx', 'js'],
	transform: { '^.+\\.[tj]sx?$': require.resolve('./babel.js') },
};
