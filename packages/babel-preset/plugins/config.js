const { relative, resolve, dirname } = require('path');
const { safeLoad } = require('js-yaml');
const { readFileSync } = require('fs');
const { traverse } = require('@babel/core');

module.exports = function ({ types: t }) {
	return {
		name: 'config',
		visitor: {
			ImportDeclaration(path, { file }) {
				if (path.node.source.value.endsWith('.yml')) {
					const sourceFile = relative(file.opts.filename, path.node.source.value);
					const fileContents = safeLoad(readFileSync(
						resolve(dirname(file.opts.filename), path.node.source.value)
						, 'utf8'));


					const a = path.node.specifiers
						.reduce((acc, item) => {
							return [...acc, ...path.scope.getBinding(item.local.name)
								.referencePaths || []];
						}, [])
						.map(item => item)

					console.log(a);


					path.remove();
				}
			},
		},
	};
};
