# Octane

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square)](https://lernajs.io/)
[![Styled with Prettier](https://img.shields.io/badge/styled%20with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

> A collection of packages for TypeScript/JavaScript projects at [AutoGuru](https://www.autoguru.com.au/).

## Usage

The project is maintained as a monorepo which composes a wide array of npm packages, each package has it's own readme
that document its own usage.

### Index

| package |     |
| ------- | --- |

{{#each packages}} | [`{{this.name}}`]({{this.folder}})
| [![npm version](http://img.shields.io/npm/v/{{this.name}}.svg?style=flat-square)](https://npmjs.org/package/{{this.name}} 'View {{this.name}} on npm')
| {{/each}}

## License

MIT &copy; [AutoGuru](https://www.autoguru.com.au/)

<a href="http://www.autoguru.com.au/"><img src="https://cdn.autoguru.com.au/images/logos/autoguru.svg" alt="AutoGuru" width="150" /></a>
