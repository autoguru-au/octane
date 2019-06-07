# `@autoguru/eslint-config`

## Usage

```sh
yarn add --dev @autoguru/eslint-config \
	eslint
```

then in your `package.json` or `.eslintrc.yml` file:

```yml
extends:
    - @autoguru/eslint-config
      - @autoguru/eslint-config/typescript // if your project uses TypeScript
      - @autoguru/eslint-config/react // react and react hook checks
      - @autoguru/eslint-config/jest // react and react hook checks
```
