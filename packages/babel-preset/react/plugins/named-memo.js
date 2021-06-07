/* eslint-disable unicorn/prefer-module */
const { default: annotateAsPure } = require('@babel/helper-annotate-as-pure');
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare(function ({ types: t, assertVersion }) {
	assertVersion(7);

	return {
		name: 'named-memo',
		visitor: {
			ImportDeclaration(path) {
				if (path.node.source.value === 'react') {
					for (const item of path.node.specifiers) {
						if (
							t.isImportDefaultSpecifier(item) ||
							t.isImportSpecifier(item)
						) {
							const bindings =
								path.scope.getBinding(item.local.name)
									.referencePaths || [];

							if (t.isImportDefaultSpecifier(item)) {
								bindings
									.filter((item) =>
										t.isMemberExpression(item.parent),
									)
									.filter((item) =>
										t.isIdentifier(item.parent.property, {
											name: 'memo',
										}),
									)
									.forEach(assignNameFor(t));
							} else if (
								t.isImportSpecifier(item) &&
								item.imported.name === 'memo'
							) {
								bindings.forEach(assignNameFor(t));
							}
						}
					}
				}
			},
		},
	};
});

function assignNameFor(t) {
	function getName(path) {
		const maybeParent = path.findParent(t.isVariableDeclaration);

		if (maybeParent === null) {
			return null;
		}

		return maybeParent.node.declarations[0].id.name;
	}

	return (path) => {
		const blockLevelStatement = path.find((node) => {
			if (node.parentPath.isBlock()) {
				return node;
			}

			return false;
		});

		const componentRef = path.scope.generateUidIdentifier('cmp');
		const memoFnExpression = path.findParent(t.isCallExpression);

		const name = getName(memoFnExpression);

		if (name === null) return;

		const componentName = t.stringLiteral(name);

		const wrappedComponent = memoFnExpression.node.arguments[0];

		if (
			!(
				t.isArrowFunctionExpression(wrappedComponent) ||
				t.isFunctionExpression(wrappedComponent)
			)
		) {
			return;
		}

		if (
			t.isFunctionExpression(wrappedComponent) &&
			Boolean(wrappedComponent.id)
		) {
			return;
		}

		annotateAsPure(wrappedComponent); // Because it should be.

		const newComponent = t.variableDeclaration('var', [
			t.variableDeclarator(componentRef, wrappedComponent),
		]);

		const newComponentRefDisplayNameProp = t.expressionStatement(
			t.assignmentExpression(
				'=',
				t.memberExpression(componentRef, t.identifier('displayName')),
				componentName,
			),
		);

		blockLevelStatement.insertBefore([
			newComponent,
			newComponentRefDisplayNameProp,
		]);

		memoFnExpression.node.arguments[0] = componentRef;
	};
}
