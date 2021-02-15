/*
import React from 'react';
import * as config from 'gdu/config';
import { api, auth, url as url2 } from 'gdu/config';

~~ OUT

import React from 'react';
const config = global.GDU_CONFIG();
const {
  api: api,
  auth: auth,
  url: url2
} = global.GDU_GLOBAL();
*/

const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare(function ({ types: t, assertVersion }) {
	assertVersion(7);

	/*
	global.GDU_GLOBAL_CONFIG()
	 */
	const gdu_config_call = t.callExpression(
		t.memberExpression(
			t.identifier('global'),
			t.identifier('GDU_GLOBAL_CONFIG'),
		),
		[],
	);

	return {
		name: 'gdu-config-plugin',
		visitor: {
			ImportDeclaration(path) {
				const { value: importedFrom } = path.get('source').node;

				// Check that its not affecting `import React from 'react';` for instance.
				if (importedFrom !== 'gdu/config') return;

				const specifiers = path.get('specifiers');

				if (
					specifiers.length > 0 &&
					specifiers.some((n) => t.isImportDefaultSpecifier(n))
				)
					throw path.buildCodeFrameError(
						'Only single specifiers supported.',
					);
				if (specifiers.length === 0)
					throw path.buildCodeFrameError(
						'At least one import required.',
					);

				// ImportNamespaceSpecifier (import * as)
				if (
					specifiers.length === 1 &&
					t.isImportNamespaceSpecifier(specifiers[0])
				) {
					// * as  --> __config__
					const { local: local_name } = specifiers[0].node;

					// const __config__ = global.GDU_GLOBAL_CONFIG();
					path.replaceWith(
						t.variableDeclaration('const', [
							t.variableDeclarator(local_name, gdu_config_call),
						]),
					);
					return;
				}
				// ImportSpecifier (import {x})
				else if (specifiers.length > 0) {
					/*
					import { api, auth, url as url2 } from 'gdu/config';
					~~ OUT
					const {
					  api: api,
					  auth: auth,
					  url: url2
					} = global.GDU_GLOBAL_CONFIG();
					*/

					/*
					  api: api,
					  auth: auth,
					  url: url2
					 */
					const local_name_declarations = specifiers.map((n) =>
						t.objectProperty(
							n.node.imported,
							n.node.local,
							false,
							true,
						),
					);

					/*
					{
					 ...
					} =  global.GDU_GLOBAL_CONFIG();
					 */
					const local_object = t.variableDeclarator(
						t.objectPattern(local_name_declarations),
						gdu_config_call,
					);

					path.replaceWith(
						/*
						const ...
						 */
						t.variableDeclaration('const', [local_object]),
					);
					return;
				}

				throw path.buildCodeFrameError(`Unsupported import format. Use only:
import * as config from 'gdu/config'; ✅
import { api } from 'gdu/config'; ✅

import config, { api } from 'gdu/config'; ❌
import { default as config } from 'gdu/config'; ❌
import config from 'gdu/config'; ❌`);
			},
		},
	};
});
