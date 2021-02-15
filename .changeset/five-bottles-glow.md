---
'gdu': minor
---

Adds support for React Native to use our config strategy.

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
	]
}
```

> Make sure you have `babel-plugin-macros` added to your project.

> _**Note**_ Please only use this for react-native projects, config is managed via webpack for our browser apps.
