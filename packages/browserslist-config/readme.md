# `browserslist-config-autoguru`

## Usage

```sh
yarn add --dev browserslist-config-autoguru
```

then in your `package.json` or `.browserslistrc` file:

```
extends browserslist-config-autoguru
```

### Maintenance

To keep us up to date:
1. From the root octane directory:
  1. Run `npx browserslist@latest --update-db`
1. From the browserlist-config directory:
  1. Update package.json with latest [browserslist](https://www.npmjs.com/package/browserslist) version
  1. Run `yarn`
  1. Run tests `yarn run jest -u`
1. Push changes and release
1. Bump consumers to use the new release (like Retail)
1. Bump versions in Retail's old-browser.js file (which configures the out of date banner) based on the latest jest snapshot

### Support

[browserl.ist](https://browserl.ist/?q=%3E%200.50%25%20in%20au,%20last%202%20chrome%20versions,%20not%20chrome%20%3C%2069,%20last%202%20firefox%20versions,%20last%204%20opera%20versions,%20edge%20%3E=%2017,%20safari%20%3E=%2011,%20not%20ios_saf%20%3C%2011,%20samsung%20%3E=%206,%20not%20samsung%20%3C=%204,%20and_chr%20%3E%2056,%20and_ff%20%3E=%2064,%20not%20ie%2011,%20not%20op_mini%20all,%20not%20dead)
