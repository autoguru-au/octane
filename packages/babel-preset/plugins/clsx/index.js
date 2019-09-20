const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare(function ({ types: t, assertVersion }) {

	assertVersion(7);

	return {
		name: 'clsx',

		visitor: {
			ImportDeclaration(path) {
				if (path.node.source.value === 'clsx') {

					const [defaultImport] = path.node.specifiers.filter(item => t.isImportDefaultSpecifier(item));

					const bindings = path.scope.getBinding(defaultImport.local.name)
						.referencePaths || [];

					for (const binding of bindings) {
						const caller = binding.parentPath;

						const parts = [
							t.stringLiteral(''),
						];

						for (const segment of caller.node.arguments) {
							classNameExp(t, parts, segment);
						}

						parts[0].value = parts[0].value.trim();

						if (parts[0].value === '') {
							parts.shift();
						}

						// Concat all string literals together
						caller.replaceWith(
							parts.reduce((result, item) => {
								if (result === null)
									return item;

								return t.binaryExpression('+', result, item);
							}, null),
						);
					}

					path.remove();

				}
			},
		},
	};

});

function classNameExp(t, parts, segment) {
	switch (segment.type) {
		case 'StringLiteral': {
			parts[0].value += ` ${segment.value}`;
			return;
		}

		case 'Identifier': {
			parts.push(t.conditionalExpression(segment,
				t.binaryExpression('+', t.stringLiteral(' '), segment),
				t.stringLiteral('')));
			return;
		}

		case 'ArrayExpression': {
			segment.elements.forEach(element => {
				classNameExp(t, parts, element);
			});

			return;
		}

		case 'ObjectExpression': {
			console.log(segment.properties);

		}
	}
}
