# `@autoguru/tsconfig`

> The shareable config for how TypeScript get's compiled at AutoGuru.

## Usage

```sh
bun add --dev @autoguru/tsconfig
```

```json
{
	"extends": "@autoguru/tsconfig",
	"compilerOptions": {
		"allowSyntheticDefaultImports": true,
		"esModuleInterop": true,
		"outDir": "./dist",
		"baseUrl": "./src",
		"rootDir": "./src"
	}
}
```

> tsconfig.json

## Presets

- `@autoguru/tsconfig` is an alias of `@autoguru/tsconfig/web`
- `@autoguru/tsconfig/web` is useful for web-based targets, adds `dom` types as
  standard.
