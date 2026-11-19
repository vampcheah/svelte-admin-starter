<!--
  Settings layout. Wraps every settings sub-page in a shared PageContainer +
  PageHeader and a responsive secondary nav (vertical list on sm+, horizontally
  scrollable tabs on mobile). The active link is derived from the current path.
-->
<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- variable nav URLs use resolveAppUrl's $app/paths boundary. */
	import { getContext, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { TAB_ROUTE, type TabRoute } from '#lib/core/shell/tab-route.ts';
	import { resolveAppUrl, toAppPathname, type AppPathname } from '#lib/shell/paths.ts';
	import { translatedLabel } from '#lib/shell/labels.ts';
	import { t } from '#lib/i18n/index.ts';
	import { cn } from '#lib/core/utils.ts';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import Palette from '@lucide/svelte/icons/palette';
	import Bell from '@lucide/svelte/icons/bell';
	import type { Component } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
	const route = getContext<TabRoute | undefined>(TAB_ROUTE);
	const pathname = $derived(route?.pathname ?? toAppPathname(page.url.pathname));

	interface SettingsNavItem {
		title: string;
		titleKey: string;
		href: AppPathname;
		icon: Component;
	}

	const navItems: SettingsNavItem[] = [
		{ title: 'General', titleKey: 'settings.general', href: '/settings', icon: SlidersHorizontal },
		{
			title: 'Appearance',
			titleKey: 'settings.appearance',
			href: '/settings/appearance',
			icon: Palette
		},
		{
			title: 'Notifications',
			titleKey: 'settings.notifications',
			href: '/settings/notifications',
			icon: Bell
		}
	];

	// Exact match for the index route, prefix match for nested ones so that the
	// correct tab stays highlighted on every sub-page.
	function isActive(href: string): boolean {
		if (href === '/settings') return pathname === href;
		return pathname === href || pathname.startsWith(`${href}/`);
	}
</script>

<PageContainer>
	<PageHeader
		title={t('nav.settings')}
		description={translatedLabel(
			'settings.description',
			'Manage your organization, appearance, and notification preferences.'
		)}
	/>

	<div class="flex flex-col gap-6 lg:flex-row lg:gap-10">
		<!-- Secondary nav: horizontal scroll on mobile, vertical list from sm up. -->
		<nav
			aria-label={t('nav.settings')}
			class="-mx-1 flex shrink-0 gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:w-52 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
		>
			{#each navItems as item (item.href)}
				{@const active = isActive(item.href)}
				<a
					href={resolveAppUrl(item.href)}
					aria-current={active ? 'page' : undefined}
					class={cn(
						'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
						'hover:bg-accent hover:text-accent-foreground',
						active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
					)}
				>
					<item.icon class="size-4" />
					{translatedLabel(item.titleKey, item.title)}
				</a>
			{/each}
		</nav>

		<div class="min-w-0 flex-1 space-y-6">
			{@render children()}
		</div>
	</div>
</PageContainer>
