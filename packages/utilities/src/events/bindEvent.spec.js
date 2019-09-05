import { bindEvent } from './bindEvent';

describe('Utils/BindEvent', () => {
	it('should execute just fine', () => {
		const handler = jest.fn();
		const mockEvent = jest.fn();

		bindEvent(
			{
				addEventListener: mockEvent,
			},
			'click',
			handler,
		);

		expect(mockEvent).toBeCalledWith('click', handler);
	});

	it('should un-bind when curry called', () => {
		const handler = jest.fn();
		const mockBindEvent = jest.fn();
		const mockUnbindEvent = jest.fn();

		const unbind = bindEvent(
			{
				addEventListener: mockBindEvent,
				removeEventListener: mockUnbindEvent,
			},
			'click',
			handler,
		);

		expect(mockBindEvent).toBeCalledWith('click', handler);

		unbind();

		expect(mockUnbindEvent).toBeCalledWith('click', handler);
	});
});
