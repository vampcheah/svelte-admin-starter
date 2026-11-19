<!-- Top-level admin layout: sidebar + inset (header, tab strip, keep-alive content outlet). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import PortableAppShell from '#lib/core/shell/AppShell.svelte';
	import { pageTitle } from '#lib/utils/page-title.ts';
	import AppSidebar from './AppSidebar.svelte';
	import AppHeader from './AppHeader.svelte';
	import TabBar from './TabBar.svelte';
	import KeepAliveOutlet from './KeepAliveOutlet.svelte';
	import { openLandedRoute } from '#lib/core/shell/tabs.svelte.ts';
	import type { TabRoute } from '#lib/core/shell/tab-route.ts';
	import { tabs } from './tabs.svelte';
	import { resolveAppUrl, toAppPathname, toAppUrl } from './paths';

	// `children` is only used to render +error.svelte on a load error; the outlet
	// handles the normal (keep-alive) rendering. See KeepAliveOutlet.
	let { children }: { children: Snippet } = $props();

	// Single wiring point: every navigation (sidebar, command menu, link, deep
	// link, initial load) opens or focuses a tab for the landed route.
	async function openCurrentRoute(): Promise<void> {
		const pathname = toAppPathname(page.url.pathname);
		const url = toAppUrl(page.url);
		const route: TabRoute | null = page.error
			? null
			: {
					pathname,
					url: new URL(page.url.href),
					params: { ...page.params },
					data: page.data,
					form: page.form
				};
		await openLandedRoute(
			tabs,
			pathname,
			page.data,
			url,
			async (fallback) => {
				// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolves stored path and query through $app/paths.
				await goto(resolveAppUrl(fallback), { replaceState: true });
			},
			route
		);
	}

	afterNavigate(() => {
		void openCurrentRoute();
	});
</script>

<svelte:head>
	{#if !page.error && tabs.activeTab}
		<title>{pageTitle(tabs.activeTab.title)}</title>
	{/if}
</svelte:head>

<PortableAppShell>
	{#snippet sidebar()}
		<AppSidebar />
	{/snippet}
	{#snippet header()}
		<AppHeader />
	{/snippet}
	{#snippet tabBar()}
		<TabBar />
	{/snippet}
	{#snippet outlet()}
		<KeepAliveOutlet {children} />
	{/snippet}
</PortableAppShell>
