const { basename, extname } = require('path');
const annotateAsPure = require('@babel/helper-annotate-as-pure').default;

module.exports = function({ types: t }) {
	return {
		name: 'named-memo',

		visitor: {
			ImportDeclaration(path, state) {
				if (path.node.source.value === 'react') {
					path.node.specifiers.forEach(item => {
						if (
							t.isImportDefaultSpecifier(item) ||
							t.isImportSpecifier(item)
						) {
							const bindings =
								path.scope.getBinding(item.local.name)
									.referencePaths || [];

							if (t.isImportDefaultSpecifier(item)) {
								bindings
									.filter(item =>
										t.isMemberExpression(item.parent),
									)
									.filter(item =>
										t.isIdentifier(item.parent.property, {
											name: 'memo',
										}),
									)
									.forEach(assignNameFor(t, state));
							} else if (
								t.isImportSpecifier(item) &&
								item.imported.name === 'memo'
							) {
								bindings.forEach(assignNameFor(t, state));
							}
						}
					});
				}
			},
		},
	};
};

function assignNameFor(t, state) {
	function getName(path) {
		if (t.isExportDefaultDeclaration(path.parent)) {
			return basename(
				state.file.opts.filename,
				extname(state.file.opts.filename),
			);
		}

		return path.findParent(t.isVariableDeclaration).node.declarations[0].id
			.name;
	}

	return path => {
		const blockLevelStatement = path.find(node => {
			if (node.parentPath.isBlock()) {
				return node;
			}

			return false;
		});

		const componentRef = path.scope.generateUidIdentifier('cmp');
		const memoFnExpression = path.findParent(t.isCallExpression);

		const componentName = t.stringLiteral(getName(memoFnExpression));

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
