# gdu

## 4.0.0-next.5

### Patch Changes

-   GDU: Allows app level configs

## 4.0.0-next.4

### Patch Changes

-   GDU: Fixed config file paths

## 4.0.0-next.3

### Patch Changes

-   GDU: Uses dotenv for env variables
-   Dev server: Removed invalid options

## 4.0.0-next.2

### Patch Changes

-   GDU upgrades webpack dependency to v5

## 4.0.0-next.1

### Patch Changes

-   Upgrades webpack dependencies

## 4.0.0-next.0

### Major Changes

-   GDU: Upgrades babel

## 3.3.0

### Minor Changes

-   55153b1: GDU: Upgrades treat to latest version

### Patch Changes

-   Updated dependencies [14e78dc]
    -   browserslist-config-autoguru@2.0.0

## 3.2.1

### Patch Changes

-   e625578: GDU: No longer follows "unicorn/prefer-node-protocol" rule

## 3.2.0

### Minor Changes

-   d80a10b: Unicorn eslint rules: Upgraded to v33

    Prettier: Upgrades to v2.3

### Patch Changes

-   Updated dependencies [d80a10b]
    -   @autoguru/babel-preset@1.2.0
    -   browserslist-config-autoguru@1.1.0
    -   @autoguru/utilities@1.1.0

## 3.1.0

### Minor Changes

-   7917b5d: graphql config endpoint gets support for optional schema
    normalisers patterns
-   4f954f8: graphql config endpoint normaliser pattern gets optional flag

## 3.0.1

### Patch Changes

-   cdace6e: graphql-schema command expects endpointConfig url to be the
    complete url to the schema
-   cdace6e: graphql-schema command respects endpointConfig's http method

## 3.0.0

### Major Changes

-   41b6042: Uses named webpack chunks

## 2.2.2

### Patch Changes

-   3078dbf: Correctly split the chunks such that gdu is included with main

## 2.2.1

### Patch Changes

-   5990714: Process all node_modules through babel as well
-   ea885c9: Upgrades treat to latest

## 2.2.0

### Minor Changes

-   941261e: Supports latest nextjs as well new babel integration
-   68ae99c: Adds support for React Native to use our config strategy.

    Usage:

    ```js
    // index.js (the entrypoint)
    import 'gdu/react-native/config';
    ```

    ```js
    // consumer
    import * as config from 'gdu/config';
    import { api } from 'gdu/config';
    import { auth, url as url2 } from 'gdu/config';
    ```

    ```js
    // babel.config.js

    module.exports = {
    	plugins: [
    		require.resolve('babel-plugin-macros'),
    		require.resolve('gdu/babel/config-plugin'),
    	],
    };
    ```

    > Make sure you have `babel-plugin-macros` added to your project.

    > _**Note**_ Please only use this for react-native projects, config is
    > managed via webpack for our browser apps.

-   00da6cc: Removes sass support, we are now treat through-and-through.

### Patch Changes

-   919e4a0: Upgraded all dev and prod deps
-   Updated dependencies [941261e]
-   Updated dependencies [919e4a0]
    -   @autoguru/babel-preset@1.1.0
    -   browserslist-config-autoguru@1.0.89
    -   @autoguru/tsconfig@1.0.79
    -   @autoguru/utilities@1.0.98

## 2.1.3

### Patch Changes

-   d016ff6: Adds in an intersection observer polyfill

## 2.1.2

### Patch Changes

-   4260eb3: Bumps deps and publishes new peerDeeps ranges
-   Updated dependencies [4260eb3]
    -   @autoguru/babel-preset@1.0.98

## 2.1.1

### Patch Changes

-   6886f49: GDU will now render a stack trace for errors
-   3deb6b9: Fix issue where the next-babel-loader is at index 0, not 1

## 2.1.0

### Minor Changes

-   b5c0b8f: Performs schema fetching using HC's `/schema` endpoint
-   69a313d: gdu.d.ts file is now removed in favour of npm maintained file,
    allowing for more defined properties and can be _more_ global.

### Patch Changes

-   dc79f71: Drops custom sass from NextJs apps

## 2.0.46

### Patch Changes

-   b0d77f1: Performance metrics added and better global app debug info
-   Updated dependencies [b0d77f1]
    -   @autoguru/babel-preset@1.0.97
    -   browserslist-config-autoguru@1.0.88
    -   @autoguru/tsconfig@1.0.78
    -   @autoguru/utilities@1.0.97

## 2.0.39

### Patch Changes

-   724083c: GDU html-webpack-plugin requires template to be a string, and never
    undefined.

    **BUG FIXES**

    When no consumer template.html the property should be set to `auto`
