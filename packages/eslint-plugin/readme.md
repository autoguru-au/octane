# `@autoguru/eslint-plugin`

## Usage

```sh
yarn add --dev @autoguru/eslint-plugin \
	eslint
```

Modern eslint requires the flat config format and the package exports config for
use with eslint.config.m/js.

```js
import { base, react, typescript } from '@autoguru/eslint-plugin/config';

/** @type {import('eslint').Linter.Config[]} */
export default [
	...base,
	...typescript,
	...react,
	{
		rules: {
			// custom rules as normal
		},
	},
];
```

### Legacy eslint

For versions prior to 9, configure it by extending your `package.json` or
`.eslintrc.yml` file:

```yml
extends:
    - 'plugin:@autoguru/base'
    - 'plugin:@autoguru/typescript' // if your project uses TypeScript (you can omit /base)
    - 'plugin:@autoguru/react' // react and react hook checks
    - 'plugin:@autoguru/jest' // jest, so we test better
```

If there are incompabitiblities with a version of eslint plugin coming from the
@autoguru/eslint-plugin, you may need to pin an older version by using package
file resolutions.
