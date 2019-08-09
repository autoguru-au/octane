const matchProps = ['onClick', 'href', 'onChange'];
const { hasProp } = require('jsx-ast-utils');

module.exports = {
	meta: {
		type: 'problem',
		fixable: 'code',
	},
	create: context => ({
		JSXOpeningElement(node) {
			if (node.attributes
				.some(item => matchProps.includes(item.name.name))) {

				if (!hasProp(node.attributes, 'data-tref')) {
					context.report({
						node,
						message: 'This node is tracked by Heap, make sure you give it an [data-tref]',
					});
				}

			}
		},
	}),
};
