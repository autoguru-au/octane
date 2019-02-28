# `@autoguru/babel-preset`

[AutoGuru](https://www.autoguru.com.au/)'s org-wide Babel set of presets and plugins.

## Usage

```sh
yarn add --dev @babel/core @autoguru/babel-preset
```

Then, in your `babel.config.js`, or `.babelrc` file:

```js
module.exports = {
	presets: [
		'@autoguru/babel-preset/web', // for browser based targets
		'@autoguru/babel-preset/react', // additional presets for web based react projects
	],
};
```

## Presets

-   `@autoguru/babel-preset` is merely an alias of `@autoguru/babel-preset/web`.
-   `@autoguru/babel-preset/node` is for node based targets.

    -   `version` (default: current) - the version of node you're targeting
    -   `modules` (default: commonjs) - what module transformations to apply.
    -   `debug` (default: isProduction) - a boolean indicating if you want debug information from [@babel/preset-env](https://github.com/babel/babel/tree/master/packages/babel-preset-env).

-   `@autoguru/babel-preset/web` is used for browser based targets, which adds typical transformations needed to support esnext features on older browsers. This will look for a [browserslist config](https://github.com/browserslist/browserslist) file up the tree.

    -   `modules` (default: false) - if you require module transformations. False is default as we use webpack's bundling system and want naked esmodules.
    -   `debug` (default: isProduction) - a boolean indicating if you want debug information from [@babel/preset-env](https://github.com/babel/babel/tree/master/packages/babel-preset-env).

-   `@autoguru/babel-preset/react` is for React based projects, including transformations for JSX. Also hoists `FunctionComponents` to the root, where it can. See [@babel/plugin-transform-react-constant-elements](https://babeljs.io/docs/en/babel-plugin-transform-react-constant-elements). You can use this alongside `@autoguru/babel-preset/web`.
