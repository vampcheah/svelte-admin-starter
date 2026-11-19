// The index route is just an entry point — send visitors to the configured home page.
import { redirect } from '@sveltejs/kit';
import { resolveAppUrl } from '#lib/shell/paths.ts';
import { config } from '#lib/config/index.ts';

export function load(): never {
	throw redirect(307, resolveAppUrl(config.app.homePath));
}
