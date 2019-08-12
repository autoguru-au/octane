const { hasProp, elementType } = require('jsx-ast-utils');

const matchProps = ['onClick', 'href', 'onChange'];

module.exports = {
	meta: {
		type: 'problem',
	},
	create: context => ({
		JSXOpeningElement(node) {
			const type = elementType(node);

			const isIntrinsic = type[0] === type[0].toLowerCase();

			const attributeKey = isIntrinsic ? 'data-tref' : 'tref';

			if (node.attributes
				.some(item => matchProps.includes(item.name.name))) {

				if (!hasProp(node.attributes, attributeKey)) {
					context.report({
						node,
						message: `This node is tracked by Heap, make sure you give it an [${attributeKey}]`,
					});
				}
			}
		},
	}),
};
