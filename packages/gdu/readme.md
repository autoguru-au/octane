# `gdu`

> Auto**G**uru's MicroFrontend **D**evelopment **U**tility.

---

Quickly get up and running by bootstrapping a new mfe into our internal repos.
GDU will for the large part be zero-config, and 100% transparent. 1 dependency
`"gdu": "latest"`, is all you'll need. But does open up escape hatches for 100%
configurability on a similar vein as webpack, using `tapable`.

This tool has been heavily inspired by:

- [seek-oss/sku](https://github.com/seek-oss/sku)
- [facebook/create-react-app](https://github.com/facebook/create-react-app)

## Getting Started

Creating a new MFE:

```sh
yarn create guru <spa|ssr> <app_name>
# or
volta install gdu
gdu scaffold <spa|ssr> <app_name>
```

CLI usage:

```
  Usage
    $ gdu <command> [options]

  Available Commands
    scaffold          Creates a new gdu project
    configure         Sets up the gdu project, creating tsconfig gitignore files etc..
    start             Starts a development server
    build             Builds the target app ready for production
    format            Runs prettier over the current tree
```

For a project to be considered a `gdu` project. It must contain a
`guru.config.js`. This file should export the following config:

```ts
interface GuruConfig {
	type: 'spa' | 'ssr'; // Is set for you during scaffold.
	isRoot?: boolean; // When set is mainly for workspace roots, and other things. Advanced Usage.
	port?: number; // When starting, or running, use this port (default: 8080)
	publicPath?: string; // When deployed where to go find static assets (default: /)
	outputPath: string; // Where to build assets too (defualt-ssr: .next, default-spa: dist)
	srcPaths?: string[]; // Where file sources are located (default-ssr: {pages,components,scenes}, default-spa: src)

	// You can use this tap to hook into various parts of the flow, see below.
	tap?(hooks: Record<string, Hook>): void;
}
```

### Hooks

- `webpackConfig(config)` - After we have resolved a webpack config, but before
  we use it.
- `beforeServer(server)` - After we have initialized a new polka server, but
  before default routes kick in, mainly used to inject middleware.
- `afterServer(server)` - After we have injected all middleware, default routes.
- `beforeNextJSPrepare(app)` - Before we run `nextjs.prepare()`, but after
  `nextjs.getRequestHandler()`
- `afterNextJSConfig(config)` - After default nextjs config has been resolved to
  be sent forward into nextjs.
- `babelConfig(config)` - After babel config has been resolved, but before it's
  used.

<a href="http://www.autoguru.com.au/"><img src="https://cdn.autoguru.com.au/images/logos/autoguru.svg" alt="AutoGuru" width="150" /></a>
