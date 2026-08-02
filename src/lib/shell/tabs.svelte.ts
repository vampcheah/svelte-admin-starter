import FileIcon from '@lucide/svelte/icons/file';
import { confirm } from '$lib/confirm.svelte';
import { Tabs, TAB_SOFT_LIMIT } from '$lib/core/shell/tabs.svelte';
import { t } from '$lib/i18n';
import { leafCrumb } from './breadcrumb.svelte';
import { findNavItem } from './nav';

function titleCase(segment: string): string {
	return segment
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function baseLabelFor(pathname: string, data?: unknown, override?: string): string {
	if (override) return override;
	const clientLabel = leafCrumb.get(pathname);
	if (clientLabel) return clientLabel;
	const breadcrumb = (data as { breadcrumb?: unknown } | undefined)?.breadcrumb;
	if (typeof breadcrumb === 'string' && breadcrumb.trim()) return breadcrumb;
	const match = findNavItem(pathname);
	if (match?.item.href === pathname) return match.item.title;
	const segment = pathname.split('/').filter(Boolean).pop();
	return segment ? titleCase(segment) : 'Untitled';
}

export const tabs = new Tabs({
	homePathname: '/dashboard',
	describe(pathname, data, override) {
		const title = baseLabelFor(pathname, data, override);
		return { title, baseTitle: title, icon: findNavItem(pathname)?.item.icon ?? FileIcon };
	},
	confirmOverflow(limit) {
		return confirm({
			title: t('common.tabLimitTitle'),
			description: t('common.tabLimitDescription', { count: limit }),
			highlights: [String(limit)],
			confirmText: t('common.forceContinue'),
			cancelText: t('common.cancel')
		});
	}
});

export { TAB_SOFT_LIMIT };
export type { Tab } from '$lib/core/shell/tabs.svelte';
