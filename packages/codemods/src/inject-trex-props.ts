import { execSync } from 'child_process';
import { Transform } from 'jscodeshift';
import { CommentLine, JSXAttribute, JSXOpeningElement, Program } from 'jscodeshift/src/core';

const transform: Transform = (file, api, _options) => {
	const j = api.jscodeshift;

	const root = j(file.source);

	const hasFileId = root.find(j.CommentLine, (maybeLine: CommentLine) => /\@id\s.*/.test(maybeLine.value));

	const fileId =
		hasFileId.length > 0
			? hasFileId.nodes()[0].value.match(/@guid\s(.*)/)[1]
			: execSync(`git log --pretty=format:"%H" --diff-filter=A -- ${file.path}`).toString();

	if (hasFileId.length < 1) {

		console.log(fileId);


	}

	return root
		.find(j.JSXOpeningElement, (node: JSXOpeningElement) => {
			return ((node.attributes as JSXAttribute[]).some((item: JSXAttribute) => item.name.name === 'href'));
		})
		.forEach(node => {
			let x = node;

			do {
				x = x.parentPath;
			} while ((x.node.type as any) !== 'Program' && (x.node.type as any) !== 'ArrowFunctionExpression');

			const trackingConst = j.memberExpression(
				x.parentPath.value.id,
				j.identifier('trex'),
			);

			x.parent.insertAfter(
				j.assignmentExpression('=', trackingConst, j.stringLiteral('test')),
			);
		})
		.toSource();
};

export const parser = 'tsx';
export default transform;
