import { configure } from '../../lib/configure';
import { bindHooks } from '../../utils/hooks';
import { getApps } from '../../main';

export default async () => {
	bindHooks();

	for (const app of await getApps()) {
		await configure(app);
	}
};
