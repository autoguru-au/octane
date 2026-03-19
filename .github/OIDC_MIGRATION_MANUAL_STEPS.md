# npm OIDC Trusted Publishers — Manual Steps

Reference: [AG-17631](https://autoguru.atlassian.net/browse/AG-17631)

## Prerequisites

- npm organisation admin access for `@autoguru` scope
- GitHub repository admin access for `autoguru-au/octane`

---

## Step 1: Create GitHub Environment

1. Go to [octane repo Settings > Environments](https://github.com/autoguru-au/octane/settings/environments)
2. Click **New environment**
3. Name it: `npm-publish`
4. (Optional) Add protection rules such as required reviewers

## Step 2: Configure Trusted Publishers on npmjs.com

For **each** package below, go to its npm Settings page > **Trusted Publisher** and add:

| Field             | Value          |
|-------------------|----------------|
| Organisation      | `autoguru-au`  |
| Repository        | `octane`       |
| Workflow filename | `publish.yml`  |
| Environment       | `npm-publish`  |

### Packages to configure

- [ ] [gdu](https://www.npmjs.com/package/gdu/access)
- [ ] [create-guru](https://www.npmjs.com/package/create-guru/access)
- [ ] [@autoguru/babel-preset](https://www.npmjs.com/package/@autoguru/babel-preset/access)
- [ ] [browserslist-config-autoguru](https://www.npmjs.com/package/browserslist-config-autoguru/access)
- [ ] [@autoguru/eslint-plugin](https://www.npmjs.com/package/@autoguru/eslint-plugin/access)
- [ ] [@autoguru/jest-preset](https://www.npmjs.com/package/@autoguru/jest-preset/access)
- [ ] [renovate-config-autoguru](https://www.npmjs.com/package/renovate-config-autoguru/access)
- [ ] [@autoguru/tsconfig](https://www.npmjs.com/package/@autoguru/tsconfig/access)
- [ ] [@autoguru/utilities](https://www.npmjs.com/package/@autoguru/utilities/access)

## Step 3: Post-merge Cleanup (after first successful publish)

- [ ] Remove `NPM_TOKEN` from [GitHub repository secrets](https://github.com/autoguru-au/octane/settings/secrets/actions)
- [ ] Revoke the npm automation token from [npm tokens page](https://www.npmjs.com/settings/~/tokens)

## Step 4: Harden Package Settings (optional)

For each package on npmjs.com, under Settings:

- [ ] Enable **"Require 2FA and disallow tokens"** for publishing
