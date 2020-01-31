export const columnLoop = char =>
	new Array(process.stdout.columns).fill('').join(char);
