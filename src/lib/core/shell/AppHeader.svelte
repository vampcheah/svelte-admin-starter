<!-- Sticky top bar inside the inset: trigger, breadcrumbs, search, notifications, toggles, user menu. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Sidebar from '../components/ui/sidebar';
	import * as DropdownMenu from '../components/ui/dropdown-menu';
	import * as Avatar from '../components/ui/avatar';
	import { Separator } from '../components/ui/separator';
	import { Button } from '../components/ui/button';
	import ThemeToggle from '../components/shared/ThemeToggle.svelte';
	import { initials } from '../utils/formatters';
	import { coreI18n } from '../i18n.svelte';
	import Search from '@lucide/svelte/icons/search';
	import LogOut from '@lucide/svelte/icons/log-out';

	interface Props {
		user?: { name: string; email?: string; avatarUrl?: string } | null;
		onSearchClick?: () => void;
		onLogout?: () => void;
		breadcrumbs?: Snippet;
		actions?: Snippet;
		accountMenuItems?: Snippet;
		afterHeader?: Snippet;
		searchLabel?: string;
		accountLabel?: string;
		guestLabel?: string;
		logoutLabel?: string;
		lightThemeLabel?: string;
		darkThemeLabel?: string;
	}

	let {
		user = null,
		onSearchClick,
		onLogout,
		breadcrumbs,
		actions,
		accountMenuItems,
		afterHeader,
		searchLabel,
		accountLabel,
		guestLabel,
		logoutLabel,
		lightThemeLabel,
		darkThemeLabel
	}: Props = $props();

	const resolvedSearch = $derived(searchLabel ?? coreI18n.t('common.search'));
	const resolvedAccount = $derived(accountLabel ?? coreI18n.t('common.account'));
	const resolvedGuest = $derived(guestLabel ?? coreI18n.t('common.guest'));
	const resolvedLogout = $derived(logoutLabel ?? coreI18n.t('common.logout'));
	const resolvedLight = $derived(lightThemeLabel ?? coreI18n.t('common.switchToLightTheme'));
	const resolvedDark = $derived(darkThemeLabel ?? coreI18n.t('common.switchToDarkTheme'));
</script>

<header
	class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur"
>
	<Sidebar.Trigger class="-ml-1" />
	<Separator orientation="vertical" class="mr-1 data-[orientation=vertical]:h-4" />
	{@render breadcrumbs?.()}

	<div class="ml-auto flex items-center gap-1 sm:gap-2">
		{#if onSearchClick}
			<!-- Search: opens the command palette -->
			<Button
				variant="outline"
				size="sm"
				class="text-muted-foreground hidden h-8 w-48 justify-start gap-2 px-2.5 sm:flex lg:w-64"
				onclick={onSearchClick}
			>
				<Search class="size-4" />
				<span class="flex-1 text-left">{resolvedSearch}</span>
				<kbd
					class="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-0.5 rounded border px-1.5 text-[10px] font-medium sm:inline-flex"
				>
					<span class="text-xs">⌘</span>K
				</kbd>
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="sm:hidden"
				aria-label={resolvedSearch}
				onclick={onSearchClick}
			>
				<Search />
			</Button>
		{/if}

		{@render actions?.()}

		<ThemeToggle lightLabel={resolvedLight} darkLabel={resolvedDark} />

		<Separator
			orientation="vertical"
			class="mx-1 hidden data-[orientation=vertical]:h-4 sm:block"
		/>

		<!-- User menu -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="icon"
						class="rounded-full"
						aria-label={resolvedAccount}
					>
						<Avatar.Root class="size-8">
							{#if user?.avatarUrl}
								<Avatar.Image src={user.avatarUrl} alt={user.name} />
							{/if}
							<Avatar.Fallback>{user ? initials(user.name) : '?'}</Avatar.Fallback>
						</Avatar.Root>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="min-w-56">
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="size-8">
							{#if user?.avatarUrl}
								<Avatar.Image src={user.avatarUrl} alt={user.name} />
							{/if}
							<Avatar.Fallback>{user ? initials(user.name) : '?'}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 leading-tight">
							<span class="truncate font-semibold">{user?.name ?? resolvedGuest}</span>
							<span class="text-muted-foreground truncate text-xs">{user?.email ?? ''}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				{#if accountMenuItems}
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						{@render accountMenuItems()}
					</DropdownMenu.Group>
				{/if}
				{#if onLogout}
					<DropdownMenu.Separator />
					<DropdownMenu.Item variant="destructive" onSelect={onLogout}>
						<LogOut />
						{resolvedLogout}
					</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>

{@render afterHeader?.()}
