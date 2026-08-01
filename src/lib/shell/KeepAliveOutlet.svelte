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
  route-specific shape.

  On a load error, page.error is set and SvelteKit makes `children` the error
	subtree; we render that instead so +error.svelte still works.

	The scroll containers reserve their vertical scrollbar gutter. Scrolling and
	short pages therefore have the same content width and do not shift on switch.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { SvelteMap } from 'svelte/reactivity';
	import { cn } from '$lib/core/utils';
	import { t } from '$lib/i18n';
	import { Button } from '$lib/core/components/ui/button';
	import Spinner from '$lib/core/components/shared/Spinner.svelte';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { tabs } from './tabs.svelte';
	import { invalidateRoute, loadRoute } from './route-registry';
	import LayoutChain from './LayoutChain.svelte';

	let { children }: { children: Snippet } = $props();
	let routeLoadRevision = $state(0);

	function retryRoute(pathname: string) {
		invalidateRoute(pathname);
		routeLoadRevision += 1;
	}

	// Snapshot each route's load data under its own pathname so inactive tabs keep
	// the data they last had while the global page.data follows the active route.
	const dataCache = new SvelteMap<string, unknown>();
	const currentUrl = $derived(`${page.url.pathname}${page.url.search}`);
	$effect(() => {
		if (page.data !== undefined) dataCache.set(currentUrl, page.data);
	});
	function dataFor(url: string): unknown | undefined {
		if (url === currentUrl && page.data !== undefined) return page.data;
		return dataCache.get(url);
	}
	// Release a tab's cached data once it closes.
	$effect(() => {
		const open = new Set<string>(tabs.items.map((t) => t.url));
		for (const key of dataCache.keys()) if (!open.has(key)) dataCache.delete(key);
	});
</script>

<div class="relative min-h-0 flex-1">
	{#if page.error}
		<div class="absolute inset-0 [scrollbar-gutter:stable] overflow-auto">
			{@render children()}
		</div>
	{:else}
		{#each tabs.items as tab (tab.id)}
			{@const active = tab.id === tabs.active}
			{@const tabData = dataFor(tab.url)}
			<div
				class={cn('absolute inset-0 [scrollbar-gutter:stable] overflow-auto', !active && 'hidden')}
			>
				{#key tab.revision}
					{#if tabData === undefined}
						<div class="flex h-full items-center justify-center">
							<Spinner class="text-primary size-6" />
						</div>
					{:else}
						{#await loadRoute(tab.href, routeLoadRevision)}
							<div class="flex h-full items-center justify-center">
								<Spinner class="text-primary size-6" />
							</div>
						{:then components}
							<LayoutChain {components} {active} data={tabData} />
						{:catch}
							<div class="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
								<p class="text-muted-foreground text-sm">
									{t('error.unexpectedDescriptionApp')}
								</p>
								<Button variant="outline" onclick={() => retryRoute(tab.href)}>
									<RotateCcw class="size-4" aria-hidden="true" />
									{t('common.retry')}
								</Button>
							</div>
						{/await}
					{/if}
				{/key}
			</div>
		{/each}
	{/if}
</div>
