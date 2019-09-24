# `@autoguru/eslint-plugin`

## Usage

```sh
yarn add --dev @autoguru/eslint-plugin \
	eslint
```

then in your `package.json` or `.eslintrc.yml` file:

```yml
extends:
    - 'plugin:@autoguru/base'
    - 'plugin:@autoguru/typescript' // if your project uses TypeScript (you can omit /base)
    - 'plugin:@autoguru/react' // react and react hook checks
    - 'plugin:@autoguru/jest' // jest, so we test better
```
