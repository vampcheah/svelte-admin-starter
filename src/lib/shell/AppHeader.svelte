<!-- Sticky top bar inside the inset: trigger, breadcrumbs, search, notifications, toggles, user menu. -->
<script lang="ts">
	import PortableAppHeader from '$lib/core/shell/AppHeader.svelte';
	import * as DropdownMenu from '$lib/core/components/ui/dropdown-menu';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth';
	import { t } from '$lib/i18n';
	import { logoutDialog } from './logout-dialog.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import NotificationsMenu from './NotificationsMenu.svelte';
	import LanguageToggle from '$lib/components/shared/LanguageToggle.svelte';
	import CommandMenu from '$lib/components/shared/CommandMenu.svelte';
	import UserIcon from '@lucide/svelte/icons/user';
	import SettingsIcon from '@lucide/svelte/icons/settings';

	let commandOpen = $state(false);
</script>

<PortableAppHeader
	user={auth.user}
	onSearchClick={() => (commandOpen = true)}
	onLogout={() => (logoutDialog.open = true)}
>
	{#snippet breadcrumbs()}
		<Breadcrumbs />
	{/snippet}

	{#snippet actions()}
		<NotificationsMenu />
		<LanguageToggle />
	{/snippet}

	{#snippet accountMenuItems()}
		<DropdownMenu.Item>
			{#snippet child({ props })}
				<a href={resolve('/profile')} {...props}>
					<UserIcon />
					{t('common.profile')}
				</a>
			{/snippet}
		</DropdownMenu.Item>
		<DropdownMenu.Item>
			{#snippet child({ props })}
				<a href={resolve('/settings')} {...props}>
					<SettingsIcon />
					{t('common.settings')}
				</a>
			{/snippet}
		</DropdownMenu.Item>
	{/snippet}

	{#snippet afterHeader()}
		<CommandMenu bind:open={commandOpen} />
	{/snippet}
</PortableAppHeader>
