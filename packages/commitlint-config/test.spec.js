const { load, lint } = require('@commitlint/core');

describe('config', () => {
	let config;

	beforeAll(async () => {
		config = await load(require('./index'));
	});

	it.each`
		message                                                                                          | result
		${'chore: Work'}                                                                                 | ${true}
		${'chore: fails'}                                                                                | ${false}
		${'chore(something): Works lowercase scope'}                                                     | ${true}
		${'chore(Something): Works uppercase scope'}                                                     | ${true}
		${'chore(Something): Should fail with full stop.'}                                               | ${false}
		${'chore: Should fail because way too too too too too too too too too too too too too too long'} | ${false}
	`("message '$message' should be $result", async ({ message, result }) =>
		expect(await lint(message, config.rules)).toHaveProperty(
			'valid',
			result
		)
	);
});
