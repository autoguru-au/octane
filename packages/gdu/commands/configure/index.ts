import { configure } from '../../lib/configure';
import { getApps } from '../../main';
import { bindHooks } from '../../utils/hooks';

export default async () => {
	bindHooks();

	for (const app of await getApps()) {
		await configure(app);
	}
};
