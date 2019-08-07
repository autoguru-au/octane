const { declare } = require('@babel/helper-plugin-utils');
const { dirname, basename } = require('path');
const { cyan, yellow, dim } = require('kleur');
const { createHash } = require('crypto');
const { default: generate } = require('@babel/generator');

const t = require('@babel/types');

const matchProps = ['onClick', 'href', 'onChange'];

const nameCache = new Set();

module.exports = declare(function trackingRef(
	{ assertVersion },
	opts,
) {
	assertVersion(7);

	const { debug = false } = opts;

	return {
		inherits: require('babel-plugin-syntax-jsx'),
		pre(state) {
			const { filename } = state.opts;
			const shortFilename = basename(filename).split('.')[0];

			this.fileIdentifier = shortFilename.includes('index')
				? basename(dirname(filename))
				: shortFilename;

			this.trackingList = [];
		},
		post(state) {
			if (debug && this.trackingList.length > 0) {
				const collect = new Map();

				this.trackingList.forEach(item => {
					collect.set(item.componentName, [
						...(collect.get(item.componentName) || []),
						`${item.trackingRef} ${dim(
							`@ ${item.loc.start.line}:${item.loc.start.column}`,
						)}`,
					]);
				});

				console.log(
					`${cyan(state.opts.filename)}\n${[...collect.entries()]
						.map(([key, value]) => {
							return `${yellow(key)}\n${value
								.map(item => `\t${item}`)
								.join('\n')}`;
						})
						.join('\n')}`,
				);
			}
		},
		visitor: {
			JSXElement(path, state) {

				if (isElementWeShouldTrack(path)) {

					const nodeId = generateNodeId(
						t.cloneDeep(path.node),
					);


					path.node.openingElement.attributes.push(
						t.jsxAttribute(
							t.jsxIdentifier('test'),
							t.stringLiteral(nodeId),
						),
					);
				}

			},
			/*JSXOpeningElement(path) {
				if (!path.node.name.name) {
					return;
				}

				// Skip JSX Nodes that are not intrinsic
				if (
					path.node.name.name[0] !==
					path.node.name.name[0].toLowerCase()
				) {
					return;
				}

				const shouldTrack =  path.node.attributes.some(item => {
					const { name } = item.name;
					return matchProps.includes(name);
				});

				if (shouldTrack) {
					const maybeParent = path.findParent(
						item =>
							t.isArrowFunctionExpression(item) ||
							t.isFunctionExpression(item),
					);
					if (!maybeParent) {
						return;
					}

					if (maybeParent.parent.type === 'CallExpression') {
						return;
					}

					const componentName = maybeParent.parent.id.name;

					const trackingRef = getTrackingRefFor(
						path,
						componentName,
						this.fileIdentifier,
					);

					this.trackingList.push({
						componentName,
						trackingRef,
						loc: path.node.loc,
					});

					attributes.push(
						t.jsxAttribute(
							t.jsxIdentifier('data-tref'),
							t.stringLiteral(trackingRef),
						),
					);
				}
			},*/
		},
	};
});

function isElementWeShouldTrack(path) {
	const { openingElement } = path.node;

	// TODO: Handle spread

	return openingElement.attributes
		.filter(item => t.isJSXIdentifier(item.name))
		.some(item => matchProps.includes(item.name.name));
}

function generateNodeId(node) {

	const { name: tagName } = node.openingElement.name;

	const elementHash =
		createHash('sha256')
			.update(
				tagName + node.children
					.map(item => generate(item, {
						comments: null
					}).code)
					.join('')
					.replace(/[\s\t\n]+/g, '')
			)
			.digest('hex');

	return elementHash.slice(0, 7);
}

function getTrackingRefFor(path, componentName, fileIdentifier) {
	const maybeName = `${fileIdentifier}:${componentName}:${path.node.name.name}`;

	if (nameCache.has(maybeName)) {
		let idx = 0;
		let maybeNewName;

		do {
			maybeNewName = maybeName + `:${++idx}`;
		} while (nameCache.has(maybeNewName));

		nameCache.add(maybeNewName);

		return maybeNewName;
	}

	nameCache.add(maybeName);

	return maybeName;
}
