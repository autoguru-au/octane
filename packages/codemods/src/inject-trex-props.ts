import { Transform } from 'jscodeshift';
import { JSXAttribute, JSXOpeningElement } from 'jscodeshift/src/core';

const transform: Transform = (file, api, _options) => {
	const j = api.jscodeshift;

	const root = j(file.source);

	return root
		.find(j.JSXOpeningElement, (node: JSXOpeningElement) => {
			return ((node.attributes as JSXAttribute[]).some((item: JSXAttribute) => item.name.name === 'href'));
		})
		.forEach(node => {
			j(node)
				.find(j.ArrowFunctionExpression)
				.forEach(console.log)
		});
};

export const parser = 'tsx';
export default transform;
