<!-- Admin sidebar: brand header, grouped nav with active highlighting, user footer dropdown. -->
<script lang="ts">
	import PortableAppSidebar from '#lib/core/shell/AppSidebar.svelte';
	import * as DropdownMenu from '#lib/core/components/ui/dropdown-menu/index.ts';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '#lib/auth/index.ts';
	import { config } from '#lib/config/index.ts';
	import { t } from '#lib/i18n/index.ts';
	import { findNavItem, navGroups } from './nav';
	import { navGroupLabel, navTitle, translatedLabel } from './labels';
	import { resolveAppUrl, toAppPathname, toAppUrl, type AppPathname } from './paths';
	import { tabs } from './tabs.svelte';
	import { logoutDialog } from './logout-dialog.svelte';
	import UserIcon from '@lucide/svelte/icons/user';
	import SettingsIcon from '@lucide/svelte/icons/settings';

	const pathname = $derived(toAppPathname(page.url.pathname));
	const homeTitle = $derived.by(() => {
		const item = findNavItem(config.app.homePath)?.item;
		return item ? navTitle(item) : translatedLabel('nav.home', 'Home');
	});

	async function openInNewTab(href: string): Promise<void> {
		if (!(await tabs.openNew(href as AppPathname))) return;
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolveAppUrl resolves through $app/paths boundary.
		if (href !== toAppUrl(page.url)) await goto(resolveAppUrl(href as AppPathname));
	}
</script>

<PortableAppSidebar
	brand={{
		name: config.app.name,
		logo: config.app.logo,
		subtitle: homeTitle,
		href: config.app.homePath
	}}
	{navGroups}
	{pathname}
	user={auth.user}
	groupLabel={navGroupLabel}
	itemTitle={navTitle}
	resolveHref={resolveAppUrl}
	onOpenInNewTab={openInNewTab}
	onLogout={() => (logoutDialog.open = true)}
>
	{#snippet accountMenuItems({ closeMobile })}
		<DropdownMenu.Item>
			{#snippet child({ props })}
				<a href={resolve('profile')} onclick={closeMobile} {...props}>
					<UserIcon />
					{t('common.profile')}
				</a>
			{/snippet}
		</DropdownMenu.Item>
		<DropdownMenu.Item>
			{#snippet child({ props })}
				<a href={resolve('settings')} onclick={closeMobile} {...props}>
					<SettingsIcon />
					{t('common.settings')}
				</a>
			{/snippet}
		</DropdownMenu.Item>
	{/snippet}
</PortableAppSidebar>
