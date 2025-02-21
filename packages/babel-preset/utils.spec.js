const { isDevelopment } = require('./utils');

describe('utils', () => {
	it.each`
		env              | result
		${'development'} | ${true}
		${'test'}        | ${true}
		${'production'}  | ${false}
	`('it should be $result for env $env', ({ env, result }) => {
		expect(isDevelopment(getEnvApiFor(env))).toEqual(result);
	});
});

function getEnvApiFor(envName) {
	const mockEnv = jest.fn();
	mockEnv.mockReturnValue(envName);

	return {
		env: mockEnv,
	};
}
