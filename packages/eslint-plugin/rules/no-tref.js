const crypto = require('crypto');
const { elementType } = require('jsx-ast-utils');
const { ulid } = require('ulid');

const matchProps = ['onClick', 'href', 'onChange'];

const TREF_DATA_ATTRIBUTE = 'data-tref';
const TREF_STAT_ATTRIBUTE = '__tref';

module.exports = {
	name: 'no-tref',
	meta: {
		type: 'problem',
		fixable: 'code',
		messages: {
			requiredAttribute:
				'This node is tracked by Heap, make sure you give it an [{{ attributeKey }}]',
		},
	},
	create: context => ({
		JSXElement(node) {
			const scope = context.getScope();

			const tag = elementType(node.openingElement);

			const isIntrinsic = tag[0] === tag[0].toLowerCase();

			const attributeKey = isIntrinsic
				? TREF_DATA_ATTRIBUTE
				: TREF_STAT_ATTRIBUTE;

			const spreadProps = node.openingElement.attributes.filter(
				item => item.type === 'JSXSpreadAttribute',
			);
			const attributes = node.openingElement.attributes.filter(
				item => item.type === 'JSXAttribute',
			);

			const isCorrectAttribute = attributes.some(item =>
				matchProps.includes(item.name.name),
			);

			const isSpreadPropWeCareAbout = spreadProps
				.reduce(
					(results, item) => [
						...results,
						...getSpreadPropKeys(item.argument, scope),
					],
					[],
				)
				.some(item => matchProps.includes(item));

			if (isSpreadPropWeCareAbout || isCorrectAttribute) {
				const props = [
					...spreadProps.reduce(
						(results, item) => [
							...results,
							...getSpreadPropKeys(item.argument, scope),
						],
						[],
					),
					...attributes.map(item => item.name.name),
				];

				if (!props.includes(attributeKey)) {
					context.report({
						node,
						messageId: 'requiredAttribute',
						data: {
							attributeKey,
						},
						fix(fixer) {
							const lastAttribute =
								node.openingElement.attributes[
									node.openingElement.attributes.length - 1
								];

							return fixer.insertTextAfterRange(
								lastAttribute.range,
								` ${attributeKey}="${getRandomKey(
									node.openingElement.loc.start,
								)}"`,
							);
						},
					});
				}
			}
		},
	}),
};

function getSpreadPropKeys(identifier, scope) {
	const refs = scope.references;

	const ref = refs.find(ref => ref.identifier === identifier);

	if (!ref) {
		return [];
	}

	return ref.resolved.defs
		.map(item => item.node.init)
		.filter(Boolean)
		.filter(item => item.type === 'ObjectExpression')
		.map(item => item.properties)
		.reduce((results, items) => [...results, ...items], [])
		.filter(item => item.type === 'Property' || item.type === 'Literal')
		.map(item => item.key.name || item.key.value)
		.filter(Boolean);
}

function getRandomKey({ line, column }) {
	return crypto
		.createHmac('sha256', ulid())
		.update(`${line}:${column}`)
		.digest('hex')
		.toLowerCase()
		.slice(0, 9);
}
