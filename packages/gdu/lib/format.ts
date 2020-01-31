import { format as prettierFormat } from 'prettier';

import prettierConfig from '../config/prettierConfig';

export const format = (code: string, parser = 'babel') =>
	prettierFormat(code, {
		...prettierConfig,
		parser,
	});
