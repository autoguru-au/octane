import React, { memo } from 'react';

export const Test = something
	? memo(() => <h1>test a</h1>)
	: memo(() => <h1>test b</h1>);
