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
				{
					type: 'add',
					path: 'packages/browserslist-config/readme.md',
					templateFile: 'templates/browserslist-config_readme.hbs.md',
					force: true,
					data: {
						browsers: require('browserslist')(
							require('./packages/browserslist-config/index')
						).join('\n'),
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
		.map(item => {
			const pkg = require(`./${item}`);

			return {
				folder: path.parse(item).dir,
				name: pkg.name,
				description: pkg.description,
			};
		})
		.sort((a, b) => {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});
}
