<!--
  Keep-alive content outlet. Renders every open tab's page at once, showing only
  the active one (others are `hidden`, which preserves their DOM, component state
  AND scroll position). A keyed {#each} over tabs never remounts an existing
  entry, so switching tabs is pure show/hide — nothing is destroyed until a tab
  is closed. Each tab is its own scroll container, so scroll position is per-tab.

  Data selection is keyed off `page.url.pathname`, NOT `tabs.active`: SvelteKit
  commits page.url + page.data together, but `tabs.active` is set later (in
  afterNavigate). Keying off the lagging active state would briefly feed the
  still-active tab the *next* route's data and crash pages that read a
  route-specific shape (e.g. tables' data.products).

  On a load error, page.error is set and SvelteKit makes `children` the error
  subtree; we render that instead so +error.svelte still works.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { SvelteMap } from 'svelte/reactivity';
	import { cn } from '$lib/utils';
	import { tabs } from './tabs.svelte';
	import { loadRoute } from './route-registry';
	import LayoutChain from './LayoutChain.svelte';

	let { children }: { children: Snippet } = $props();

	// Snapshot each route's load data under its own pathname so inactive tabs keep
	// the data they last had while the global page.data follows the active route.
	const dataCache = new SvelteMap<string, unknown>();
	$effect(() => {
		dataCache.set(page.url.pathname, page.data);
	});
	// Release a tab's cached data once it closes.
	$effect(() => {
		const open = new Set<string>(tabs.items.map((t) => t.href));
		for (const key of dataCache.keys()) if (!open.has(key)) dataCache.delete(key);
	});
</script>

<div class="relative min-h-0 flex-1">
	{#if page.error}
		<div class="absolute inset-0 overflow-auto">{@render children()}</div>
	{:else}
		{#each tabs.items as tab (tab.id)}
			{@const active = tab.id === tabs.active}
			<div class={cn('absolute inset-0 overflow-auto', !active && 'hidden')}>
				{#await loadRoute(tab.href) then components}
					<LayoutChain
						{components}
						data={tab.href === page.url.pathname ? page.data : dataCache.get(tab.href)}
					/>
				{/await}
			</div>
		{/each}
	{/if}
</div>
