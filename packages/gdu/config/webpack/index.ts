import {GuruConfig} from "../../lib/config";
import {Configuration} from "webpack";
import {getBuildEnvs} from "../../utils/configs";
import {baseOptions, makeWebpackConfig} from "./webpack.config";

const buildConfigs = (guruConfig: GuruConfig): Configuration[] => {
	if(guruConfig?.type === 'web-component'){
		return ['prod'].map((buildEnv) => ({
			...baseOptions(buildEnv, false),
			...makeWebpackConfig(buildEnv, false),
		}));
	}else{
		const buildEnvs = getBuildEnvs();
		return buildEnvs.map((buildEnv) => ({
			...baseOptions(buildEnv, buildEnvs.length > 1),
			...makeWebpackConfig(buildEnv, buildEnvs.length > 1),
		}));
	}
};

export default buildConfigs;
