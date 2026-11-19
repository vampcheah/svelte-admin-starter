// Initial breadcrumb fallback from seed data. The mounted detail page publishes
// the current session's name (including new, edited or deleted users).
import { demoUsers } from '#lib/data/users.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const user = demoUsers.find((u) => u.id === params.id);
	return { breadcrumb: user?.name };
};
