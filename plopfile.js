const path = require('path');
const glob = require('glob');

const { workspaces = [] } = require('./package.json');

module.exports = function(plop) {
	plop.setGenerator('readmes', {
		description: 'Generate root repo readme',
		prompts: [],
		actions() {
			return [
				{
					type: 'add',
					path: 'readme.md',
					templateFile: 'templates/root_readme.hbs.md',
					force: true,
					data: {
						packages: getPackages(),
					},
				},
			];
		},
	});
};

function getPackages() {
	return workspaces
		.map(item => `${item}/package.json`)
		.reduce((results, item) => [...results, ...glob.sync(item)], [])
		.map(item => ({
			folder: path.parse(item).dir,
			name: require(`./${item}`).name,
		}));
}
