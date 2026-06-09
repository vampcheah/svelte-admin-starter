// Supplies a friendly breadcrumb label (the user's name) for /users/[id], so the
// trail reads "… › Users › Olivia Martin" instead of the raw id segment.
import { demoUsers } from '$lib/data/users';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const user = demoUsers.find((u) => u.id === params.id);
	return { breadcrumb: user?.name };
};
