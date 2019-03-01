import { warning } from './warning';

describe('Utils/Warning', () => {
	it('should not be in development env', () =>
		expect(process.env.NODE_ENV).toEqual('test'));

	it('should not throw', () =>
		expect(() => warning(false, 'test')).not.toThrow());

	it('should throw condition is required', () => {
		expect(() => warning(true)).toThrow(/requires a message/);
	});

	it('should should have console logged', () => {
		const warn = console.warn;

		const mockWarn = (console.warn = jest.fn());

		warning(true, 'warning message');

		expect(mockWarn).toHaveBeenCalledTimes(1);
		expect(mockWarn.mock.calls[0][0]).toMatch(/Warning.*warning message/);

		console.warn = warn;
	});
});
