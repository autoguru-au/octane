# gdu

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
