const { relative, resolve, dirname } = require('path');
const { safeLoad } = require('js-yaml');
const { readFileSync } = require('fs');
const { traverse } = require('@babel/core');
const { default: generate } = require('@babel/generator');

module.exports = function ({ types: t }) {
	return {
		name: 'config',
		visitor: {
			ImportDeclaration(path, opts) {
				if (path.node.source.value.endsWith('.yml')) {
					const sourceFile = relative(opts.file.opts.filename, path.node.source.value);
					const fileContents = safeLoad(readFileSync(
						resolve(dirname(opts.file.opts.filename), path.node.source.value)
						, 'utf8'));

					path.node.specifiers
						.reduce((acc, item) =>
							[...acc, ...path.scope.getBinding(item.local.name)
								.referencePaths || []], [])
						.forEach(item => {


							/*console.log(
								//item.inList,
								//toPropertyAccessString(item.parent),
							);*/

							//console.log(generate(item.parent, opts));

							console.log(
								item.find(subPath => t.isMemberExpression(subPath))
									.node.property
							);

							/*item.find(subPath=>t.isMemberExpression(subPath))
								.traverse({
									Identifier(subPath) {
										console.log(subPath.node.name)
										//console.log(toPropertyAccessString(subPath.node));
									},
								})*/
						});


					/*const a = path.node.specifiers
						.reduce((acc, item) => {
							return [...acc, ...path.scope.getBinding(item.local.name)
								.referencePaths || []];
						}, [])
						.map(item => item.parent)
						.map(item => generate(item));

					console.log(generate());

					console.log(a);*/

					path.remove();
				}
			},
		},
	};
};

function toPropertyAccessString(node) {
	if (node.type === 'Identifier') {
		return node.name;
	} else if (node.type === 'MemberExpression' && !node.computed) {
		const object = toPropertyAccessString(node.object);
		const property = toPropertyAccessString(node.property);
		return `${object}.${property}`;
	} else {
		throw new Error(`Unsupported node type: ${node.type}`);
	}
}

function getDependency(node) {
	if (
		node.parent.type === 'MemberExpression' &&
		node.parent.object === node &&
		node.parent.property.name !== 'current' &&
		!node.parent.computed &&
		!(
			node.parent.parent != null &&
			node.parent.parent.type === 'CallExpression' &&
			node.parent.parent.callee === node.parent
		)
	) {
		return getDependency(node.parent);
	} else {
		return node;
	}
}
