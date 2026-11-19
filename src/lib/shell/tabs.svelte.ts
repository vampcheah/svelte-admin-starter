import FileIcon from '@lucide/svelte/icons/file';
import { confirm } from '#lib/confirm.svelte.ts';
import { Tabs, TAB_SOFT_LIMIT } from '#lib/core/shell/tabs.svelte.ts';
import { t } from '#lib/i18n/index.ts';
import { findNavItem } from './nav';
import { config } from '#lib/config/index.ts';
import { routeLabelFor, translatedLabel } from './labels';

export function tabTitleFor(pathname: string, data?: unknown, override?: string): string {
	const title = routeLabelFor(pathname, data, override);
	if (pathname === '/tables' || pathname.startsWith('/tables/'))
		return translatedLabel('tabs.tableTitle', `Table: ${title}`, { title });
	if (pathname === '/templates' || pathname.startsWith('/templates/'))
		return translatedLabel('tabs.pageTitle', `Page: ${title}`, { title });
	if (pathname === '/settings' || pathname.startsWith('/settings/'))
		return translatedLabel('tabs.settingTitle', `Setting: ${title}`, { title });
	return title;
}

export const tabs = new Tabs({
	homePathname: config.app.homePath,
	describe(pathname, data, override) {
		const title = tabTitleFor(pathname, data, override);
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
export type { Tab } from '#lib/core/shell/tabs.svelte.ts';
