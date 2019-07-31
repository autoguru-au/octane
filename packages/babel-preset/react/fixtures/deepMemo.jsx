import React, { memo } from 'react';

const test = () => {
	return factory(someProp => {
		return memo(() => <h1>{someProp}</h1>);
	});
};

const test2 = () => {
	return factory(someProp => {
		const WrappedFn = () => <h1>{someProp}</h1>;
		WrappedFn.displayName = 'boom bang, click clak';
		return memo(WrappedFn);
	});
};
