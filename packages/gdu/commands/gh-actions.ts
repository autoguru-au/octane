import { format } from 'date-fns';

export default () => {
	const envOutput = {
		safe_branch_name: getBranchName(),
		versioned_release_name: `${format(
			new Date(),
			'yyyy.MM.dd-HHmmss',
		)}+${getBranchName()}`,
	};

	Object.entries(envOutput).forEach(([key, value]) =>
		console.log(`::set-env name=gdu__${key}::${value}`),
	);
};

function getBranchName() {
	return (process.env.GITHUB_REF ?? 'master')
		.replace('refs/heads/', '')
		.replace(/[^\w]+/g, '-');
}
