import { clamp } from './clamp';

describe('Utils/clamp', () => {
	it('should return same value when within boundaries', () =>
		expect(clamp(10, 9, 11)).toEqual(10));

	it('should return same value when equal to upper limit', () =>
		expect(clamp(11, 9, 11)).toEqual(11));

	it('should return same value when equal to lower limit', () =>
		expect(clamp(9, 9, 11)).toEqual(9));

	it('should return max value value when greater than upper limit', () =>
		expect(clamp(12, 9, 11)).toEqual(11));

	it('should return min value value when less than lower limit', () =>
		expect(clamp(8, 9, 11)).toEqual(9));
});
