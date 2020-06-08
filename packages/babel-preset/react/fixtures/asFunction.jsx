import React, { memo } from 'react';

export const Test = memo(function () {
	return <h1>test</h1>;
});

export const Test2 = memo(function Named() {
	return <h1>test</h1>;
});
