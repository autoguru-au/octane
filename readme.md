# Octane

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square)](https://lernajs.io/)
[![Styled with Prettier](https://img.shields.io/badge/styled%20with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

> A collection of packages for TypeScript/JavaScript projects at
> [AutoGuru](https://www.autoguru.com.au/).

## Usage

The project is maintained as a monorepo which composes a wide array of npm
packages, each package has it's own readme that document its own usage.

## Claude Code Review

This repository uses Claude Code for AI-powered code reviews on pull requests.
The Claude Code workflow automatically reviews all pull requests and provides
intelligent feedback and suggestions.

### Features

- 🤖 Automated AI-powered code reviews on every PR
- 🔍 Consistent code quality checks
- 💡 Intelligent suggestions for improvements
- ⚡ Faster review cycles

### Configuration

The workflow is configured in `.github/workflows/claude-code-review.yml` and
requires the `ANTHROPIC_API_KEY` repository secret to be set.

### Index

| package                                                                 |                                                                                                                                                                                                     |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@autoguru/babel-preset`](packages/babel-preset)                       | [![npm version](http://img.shields.io/npm/v/@autoguru/babel-preset.svg?style=flat-square)](https://npmjs.org/package/@autoguru/babel-preset 'View @autoguru/babel-preset on npm')                   |
| [`@autoguru/commitlint-config`](packages/commitlint-config)             | [![npm version](http://img.shields.io/npm/v/@autoguru/commitlint-config.svg?style=flat-square)](https://npmjs.org/package/@autoguru/commitlint-config 'View @autoguru/commitlint-config on npm')    |
| [`@autoguru/eslint-plugin`](packages/eslint-plugin)                     | [![npm version](http://img.shields.io/npm/v/@autoguru/eslint-plugin.svg?style=flat-square)](https://npmjs.org/package/@autoguru/eslint-plugin 'View @autoguru/eslint-plugin on npm')                |
| [`@autoguru/jest-preset`](packages/jest-preset)                         | [![npm version](http://img.shields.io/npm/v/@autoguru/jest-preset.svg?style=flat-square)](https://npmjs.org/package/@autoguru/jest-preset 'View @autoguru/jest-preset on npm')                      |
| [`@autoguru/tsconfig`](packages/tsconfig)                               | [![npm version](http://img.shields.io/npm/v/@autoguru/tsconfig.svg?style=flat-square)](https://npmjs.org/package/@autoguru/tsconfig 'View @autoguru/tsconfig on npm')                               |
| [`@autoguru/utilities`](packages/utilities)                             | [![npm version](http://img.shields.io/npm/v/@autoguru/utilities.svg?style=flat-square)](https://npmjs.org/package/@autoguru/utilities 'View @autoguru/utilities on npm')                            |
| [`browserslist-config-autoguru`](packages/browserslist-config-autoguru) | [![npm version](http://img.shields.io/npm/v/browserslist-config-autoguru.svg?style=flat-square)](https://npmjs.org/package/browserslist-config-autoguru 'View browserslist-config-autoguru on npm') |
| [`create-guru`](packages/create-guru)                                   | [![npm version](http://img.shields.io/npm/v/create-guru.svg?style=flat-square)](https://npmjs.org/package/create-guru 'View create-guru on npm')                                                    |
| [`gdu`](packages/gdu)                                                   | [![npm version](http://img.shields.io/npm/v/gdu.svg?style=flat-square)](https://npmjs.org/package/gdu 'View gdu on npm')                                                                            |
| [`renovate-config-autoguru`](packages/renovate-config)                  | [![npm version](http://img.shields.io/npm/v/renovate-config-autoguru.svg?style=flat-square)](https://npmjs.org/package/renovate-config-autoguru 'View renovate-config-autoguru on npm')             |

## License

MIT &copy; [AutoGuru](https://www.autoguru.com.au/)

<a href="http://www.autoguru.com.au/"><img src="https://cdn.autoguru.com.au/images/logos/autoguru.svg" alt="AutoGuru" width="150" /></a>
