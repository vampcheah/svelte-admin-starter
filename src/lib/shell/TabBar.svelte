<!-- Multi-tab strip under the header: open routes as switchable, closable tabs. -->
<script lang="ts">
	import type { Tab } from './tabs.svelte';
	import X from '@lucide/svelte/icons/x';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { tabs } from './tabs.svelte';

	function select(tab: Tab): void {
		if (tab.id === tabs.active) return;
		tabs.active = tab.id;
		// Only navigate when the URL must change; switching between two tabs of the
		// same route just flips the active id (URL is already correct).
		if (tab.href !== page.url.pathname) goto(resolve(tab.href));
	}

	function close(tab: Tab): void {
		const next = tabs.close(tab.id);
		if (next && next !== page.url.pathname) goto(resolve(next));
	}
</script>

{#if tabs.items.length > 0}
	<div
		class="bg-background flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b px-2"
		role="tablist"
	>
		{#each tabs.items as tab (tab.id)}
			{@const active = tab.id === tabs.active}
			<div
				class={cn(
					'group flex h-7 shrink-0 items-center rounded-md border transition-colors',
					active
						? 'border-primary/30 bg-primary/10 text-primary'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
				)}
			>
				<button
					type="button"
					role="tab"
					aria-selected={active}
					onclick={() => select(tab)}
					class="flex h-full items-center gap-1.5 rounded-l-md py-1 pr-1.5 pl-2.5 text-sm"
				>
					<tab.icon class="size-3.5 shrink-0" />
					<span class="max-w-40 truncate">{tab.title}</span>
				</button>
				<button
					type="button"
					aria-label={`Close ${tab.title}`}
					onclick={() => close(tab)}
					class={cn(
						'hover:bg-foreground/10 mr-1 flex size-4 items-center justify-center rounded-sm transition-opacity',
						active ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
					)}
				>
					<X class="size-3" />
				</button>
			</div>
		{/each}
	</div>
{/if}
