import { config } from '#lib/config/index.ts';

/** Keep browser titles aligned with the configured app brand. */
export function pageTitle(title: string | number): string {
	return `${title} · ${config.app.name}`;
}
