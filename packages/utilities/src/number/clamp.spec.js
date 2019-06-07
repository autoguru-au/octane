import { clamp } from './clamp';

describe('Utils/Clamp', () => {
	it.each`
		min   | max  | value | result
		${10} | ${9} | ${11} | ${10}
		${11} | ${9} | ${11} | ${11}
		${9}  | ${9} | ${11} | ${9}
		${12} | ${9} | ${11} | ${11}
		${8}  | ${9} | ${11} | ${9}
	`(
		'should pass for min: $min max: $max with val: $value -> $result',
		({ min, max, value, result }) => {
			expect(clamp(min, max, value)).toEqual(result);
		},
	);
});
