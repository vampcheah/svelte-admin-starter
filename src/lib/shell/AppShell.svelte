<!-- Top-level admin layout: sidebar + inset (header, tab strip, keep-alive content outlet). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Pathname } from '$app/types';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Sidebar from '$lib/core/components/ui/sidebar';
	import { config } from '$lib/config';
	import AppSidebar from './AppSidebar.svelte';
	import AppHeader from './AppHeader.svelte';
	import TabBar from './TabBar.svelte';
	import KeepAliveOutlet from './KeepAliveOutlet.svelte';
	import { tabs } from './tabs.svelte';

	// `children` is only used to render +error.svelte on a load error; the outlet
	// handles the normal (keep-alive) rendering. See KeepAliveOutlet.
	let { children }: { children: Snippet } = $props();

	// Single wiring point: every navigation (sidebar, command menu, link, deep
	// link, initial load) opens or focuses a tab for the landed route.
	async function openCurrentRoute(): Promise<void> {
		const pathname = page.url.pathname as Pathname;
		if (tabs.open(pathname, page.data)) return;

		const fallback = tabs.items.find((tab) => tab.id === tabs.active);
		if (await tabs.confirmOverflow()) {
			tabs.open(pathname, page.data, pathname, true);
		} else if (fallback && fallback.href !== pathname) {
			await goto(resolve(fallback.href), { replaceState: true });
		}
	}

	afterNavigate(() => {
		void openCurrentRoute();
	});

	// Single source of truth for the document title: kept-alive pages all mount at
	// once, so their per-page <title> effects clobber each other — re-assert the
	// active tab's title on every switch instead.
	$effect(() => {
		const current = tabs.items.find((t) => t.id === tabs.active);
		if (current) document.title = `${current.title} · ${config.app.name}`;
	});
</script>

<!-- Fixed viewport height + internal scroll, so each tab keeps its own scroll position. -->
<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset class="h-svh overflow-hidden">
		<AppHeader />
		<TabBar />
		<KeepAliveOutlet {children} />
	</Sidebar.Inset>
</Sidebar.Provider>
