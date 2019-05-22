import { wrapEvent } from './wrapEvent';

describe('Utils/WrapEvent', () => {
	it('should execute just fine', () => {
		const fnc = jest.fn();
		wrapEvent(fnc)(new Event('onClick'));
		expect(fnc).toHaveBeenCalledTimes(1);
	});

	it("should always call our handler, even if it's prevented", () => {
		const fnc = jest.fn();
		const ev = new Event('onClick');
		ev.preventDefault();
		wrapEvent(fnc)(ev);
		expect(fnc).toHaveBeenCalledTimes(1);
	});

	it('should call consumer handler', () => {
		const fnc = jest.fn();
		const consumerFn = jest.fn();

		const ev = new Event('onClick');

		wrapEvent(fnc, consumerFn)(ev);

		expect(fnc).toHaveBeenCalledTimes(1);
		expect(consumerFn).toHaveBeenCalledTimes(1);
	});

	it('not fire if consumer prevents', () => {
		const fnc = jest.fn();
		const consumerFn = jest.fn();

		wrapEvent(fnc, consumerFn)({ defaultPrevented: true });

		expect(consumerFn).toHaveBeenCalledTimes(1);
		expect(fnc).toHaveBeenCalledTimes(0);
	});
});
