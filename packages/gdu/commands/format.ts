import execa from 'execa';
import { cyan } from 'kleur';

import { resolvePathFromCaller } from '../lib/resolve';
import { GDU_ROOT, PROJECT_ROOT } from '../lib/roots';

export default options => {
	console.log(`${cyan('Formatting with prettier...')}`);

	const shouldWrite =
		options['list-different'] === 'false' && options.write === 'true';

	execa(
		'prettier',
		[
			'--config',
			require.resolve('../config/prettierConfig.js'),
			'--ignore-path',
			resolvePathFromCaller('.prettierignore'),
			shouldWrite ? '--write' : '-l',
			'**/*.+(js|jsx|ts|tsx|css|scss|json|yml|gql|graphql|md|mdx)',
		],
		{
			stdio: 'inherit',
			cwd: PROJECT_ROOT,
			localDir: GDU_ROOT,
		},
	);
};
