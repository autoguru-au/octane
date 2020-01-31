import { isGithubActions } from './misc';

interface Outputs {
	artifact_path: string;
}

export const genGithubOutputs = (config: Outputs) => {
	if (!isGithubActions) return;

	Object.entries(config).forEach(([key, value]) => {
		console.log(`::set-output name=gdu__${key}::${value}`);
	});
};
