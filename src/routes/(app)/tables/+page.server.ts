// Reference example of the production data-loading pattern: read from the
// server-only data seam (`$lib/server/db`) in a `load` function and pass the
// result to the page. Swap `db`'s implementation for a real database/API and
// this page keeps working unchanged. See docs/DEVELOPMENT.md.
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { products: await db.products.list() };
};
