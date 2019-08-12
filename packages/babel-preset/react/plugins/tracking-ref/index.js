const { declare } = require('@babel/helper-plugin-utils');
const { dirname, basename } = require('path');
const { cyan, yellow, dim } = require('kleur');
const { createHash } = require('crypto');
const { default: generate } = require('@babel/generator');
const { codeFrameColumns } = require('@babel/code-frame');
const { hasProp, getPropValue, hasAnyProp } = require('jsx-ast-utils');

const t = require('@babel/types');

const matchProps = ['onClick', 'href'];
const renderPropKeys = ['is', 'as', 'component', 'render'];

const TRACKING_REF_STATIC = 'tref';
const TRACKING_REF_ATTR = 'data-tref';

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

			this.refs = [];
		},
		post(state) {
			if (debug && this.refs.length > 0) {
				console.log(state.opts.filename + '\n' + this.refs.map(ref => {
					return (`${cyan(ref.hashKey)} ${dim('@')} ${dim(ref.loc)} (${yellow(ref.component)})`);
				}).join('\n'));
			}
		},
		visitor: {
			JSXElement(path) {
				if (isElementWeShouldTrack(path)) {
					applyNodeTransforms.call(this, path);
				}
			},
		},
	};
});

function applyNodeTransforms(
	path,
) {
	if (!isIntrinsicComponent(path.node)) {
		return;
	}

	const nodeFrom = getAnnotatingNode(path);

	const attributeName = isIntrinsicComponent(nodeFrom.node)
		? TRACKING_REF_ATTR
		: TRACKING_REF_STATIC;

	const nodeId = generateNodeId.call(this, nodeFrom);

	if (!nodeId) {
		return;
	}

	nodeFrom.node.openingElement.attributes.push(
		t.jsxAttribute(
			t.jsxIdentifier(attributeName),
			t.stringLiteral(nodeId),
		),
	);
}

function isElementWeShouldTrack(path) {
	const { openingElement } = path.node;

	if (hasAnyProp(openingElement.attributes, [
		TRACKING_REF_STATIC,
		TRACKING_REF_ATTR,
	])) {
		return false;
	}

	// TODO: Handle spread

	return hasAnyProp(
		openingElement.attributes,
		matchProps,
	);
}

function isIntrinsicComponent({ openingElement }) {
	const tagName = openingElement.name.name;

	return tagName[0] === tagName[0].toLowerCase();
}

function getAnnotatingNode(path) {
	let nodeFrom = path;

	const maybeRenderProp = path.findParent(item => t.isJSXAttribute(item));
	if (maybeRenderProp) {
		if (renderPropKeys.includes(maybeRenderProp.node.name.name)) {
			const parent = maybeRenderProp.findParent(t.isJSXElement);
			nodeFrom = parent;
		}
	}

	return nodeFrom;
}

function generateNodeId(nodeFrom) {

	const componentMarkup = generate(nodeFrom.node).code.replace(/[\s\t\n]+/g, ' ');

	const children = nodeFrom.node.children.length > 0
		? nodeFrom.node.children
		: hasProp(nodeFrom.node.openingElement.attributes, 'children')
			? getPropValue(nodeFrom.node.openingElement.attributes, 'children')
			: false;

	if (children === false) {
		console.log(
			codeFrameColumns(nodeFrom.hub.file.code, {
				start: {
					line: nodeFrom.node.loc.start.line,
				},
			}, {
				highlightCode: true,
				message: 'Missing children',
			}),
		);

		return false;
	}

	const tagKey = (Array.isArray(children) ? children : [children])
		.map(item => generate(item).code)
		.join('')
		.replace(/[\s\t\n]+/g, '');

	const elementHash =
		createHash('sha256')
			.update(tagKey)
			.digest('hex');

	const hashKey = elementHash.slice(0, 9);

	this.refs.push(
		{
			hashKey,
			loc: `${nodeFrom.node.loc.start.line}:${nodeFrom.node.loc.start.column}`,
			component: componentMarkup,
		},
	);

	return hashKey;
}
