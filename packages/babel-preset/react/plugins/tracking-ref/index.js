const { declare } = require('@babel/helper-plugin-utils');
const { dirname, basename } = require('path');
const { cyan, yellow, dim } = require('kleur');
const { createHash } = require('crypto');
const { default: generate } = require('@babel/generator');

const t = require('@babel/types');

const matchProps = ['onClick', 'href', 'onChange'];
const renderPropKeys = ['is', 'as', 'component', 'render'];

const TRACKING_REF_STATIC = '__tref';
const TRACKING_REF_ATTR = 'data-tref';

module.exports = declare(function trackingRef(
	{ assertVersion },
	opts,
) {
	assertVersion(7);

	const { debug = false } = opts;

	return {
		inherits: require('@babel/plugin-syntax-jsx'),
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
			JSXElement(path) {
				if (isElementWeShouldTrack(path)) {
					const nodeId = generateNodeId(t.cloneDeep(path.node), path);

					applyNodeTransforms(nodeId, path);
				}
			},
		},
	};
});

function applyNodeTransforms(
	nodeId,
	path,
) {
	const attributeName = isIntrinsicComponent(path.node)
		? TRACKING_REF_ATTR
		: TRACKING_REF_STATIC;

	if (!isIntrinsicComponent(path.node)) {
		return;
	}

	// Check to see if there isnt a TRACKING_REF_STATIC being passed in
	// If so, ignore node, and spread it to the thing that is applying matchProps

	path.node.openingElement.attributes.push(
		t.jsxAttribute(
			t.jsxIdentifier(attributeName),
			t.stringLiteral(nodeId),
		),
	);
}

function isElementWeShouldTrack(path) {
	const { openingElement } = path.node;

	// TODO: Handle spread

	const isTrackableElement = openingElement.attributes
		.filter(item => t.isJSXIdentifier(item.name))
		.some(item => matchProps.includes(item.name.name));

	return isTrackableElement;
}

function isIntrinsicComponent({ openingElement }) {
	// TODO: Should probably check if this function exists

	const tagName = openingElement.name.name;

	return tagName[0] === tagName[0].toLowerCase();
}

function generateNodeId(node, path) {

	const { name: tagName } = node.openingElement.name;

	if (tagName === 'link') {
		console.log(path);
	}

	// Calculate hash from parent, if this element is being sent into a is,as,component or render prop

	const tagKey = tagName + node.children
		.map(item => generate(item).code)
		.join('')
		.replace(/[\s\t\n]+/g, '');

	const elementHash =
		createHash('sha256')
			.update(tagKey)
			.digest('hex');

	return elementHash.slice(0, 9);
}
