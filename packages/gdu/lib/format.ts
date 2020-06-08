import { BuiltInParserName, format as prettierFormat } from 'prettier';

import prettierConfig from '../config/prettierConfig';

export const format = (code: string, parser: BuiltInParserName = 'babel') =>
	prettierFormat(code, {
		...(prettierConfig as any),
		parser,
	});
