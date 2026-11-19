import { translate as t } from '#lib/i18n/index.ts';
import { leafCrumb } from './breadcrumb.svelte';
import { findNavItem } from './nav';
import { titleCase } from '#lib/core/shell/nav.ts';

export { titleCase };

export function translatedLabel(
	key: string | undefined,
	fallback: string,
	values?: Record<string, string | number>
): string {
	if (!key) return fallback;
	const translated = t(key, values);
	return translated === key ? fallback : translated;
}

export function navTitle(item: { title: string; titleKey?: string }): string {
	return translatedLabel(item.titleKey, item.title);
}

export function navGroupLabel(group: { label: string; labelKey?: string }): string {
	return translatedLabel(group.labelKey, group.label);
}

/** Shared leaf label for breadcrumbs and tabs, including page-supplied names. */
export function routeLabelFor(pathname: string, data?: unknown, override?: string): string {
	if (override) return override;
	const clientLabel = leafCrumb.get(pathname);
	if (clientLabel) return clientLabel;
	const breadcrumb = (data as { breadcrumb?: unknown } | undefined)?.breadcrumb;
	if (typeof breadcrumb === 'string' && breadcrumb.trim()) return breadcrumb;
	const match = findNavItem(pathname);
	if (match?.item.href === pathname) return navTitle(match.item);
	const segment = pathname.split('/').filter(Boolean).pop();
	return segment ? titleCase(segment) : translatedLabel('nav.untitled', 'Untitled');
}
