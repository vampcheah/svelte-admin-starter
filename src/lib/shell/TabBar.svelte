<!-- Multi-tab strip under the header: open routes as switchable, closable tabs. -->
<script lang="ts">
	import { tick } from 'svelte';
	import type { Tab } from './tabs.svelte';
	import X from '@lucide/svelte/icons/x';
	import PanelTopOpen from '@lucide/svelte/icons/panel-top-open';
	import Copy from '@lucide/svelte/icons/copy';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { t } from '$lib/i18n';
	import { cn } from '$lib/utils';
	import { tabs } from './tabs.svelte';

	let draggedId = $state<string | null>(null);
	let dragTargetId = $state<string | null>(null);
	let dropAfter = $state(false);
	let tabStrip = $state<HTMLDivElement | null>(null);
	let hasOverflow = $state(false);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

	function updateScrollState(): void {
		if (!tabStrip) return;
		const maxScroll = Math.max(0, tabStrip.scrollWidth - tabStrip.clientWidth);
		hasOverflow = maxScroll > 1;
		canScrollLeft = tabStrip.scrollLeft > 1;
		canScrollRight = tabStrip.scrollLeft < maxScroll - 1;
	}

	$effect(() => {
		const strip = tabStrip;
		const itemCount = tabs.items.length;
		if (!strip || itemCount === 0) return;
		const observer = new ResizeObserver(updateScrollState);
		observer.observe(strip);
		void tick().then(updateScrollState);
		return () => observer.disconnect();
	});

	// A hidden scrollbar must not hide the active tab. Reveal it whenever a tab
	// is opened or selected without disturbing the page's vertical scroll.
	$effect(() => {
		const activeId = tabs.active;
		const itemCount = tabs.items.length;
		if (!activeId || itemCount === 0) return;
		void tick().then(() => {
			if (!tabStrip) return;
			const activeTab = Array.from(tabStrip.querySelectorAll<HTMLElement>('[data-shell-tab]')).find(
				(element) => element.dataset.tabId === activeId
			);
			if (!activeTab) return;

			const stripLeft = tabStrip.scrollLeft;
			const stripRight = stripLeft + tabStrip.clientWidth;
			const tabLeft = activeTab.offsetLeft;
			const tabRight = tabLeft + activeTab.offsetWidth;
			if (tabLeft < stripLeft) tabStrip.scrollTo({ left: Math.max(0, tabLeft - 8) });
			else if (tabRight > stripRight)
				tabStrip.scrollTo({ left: tabRight - tabStrip.clientWidth + 8 });
			updateScrollState();
		});
	});

	function scrollByPage(direction: -1 | 1): void {
		if (!tabStrip) return;
		tabStrip.scrollBy({
			left: direction * Math.max(120, tabStrip.clientWidth * 0.75),
			behavior: 'smooth'
		});
	}

	function scrollToEdge(edge: 'start' | 'end'): void {
		if (!tabStrip) return;
		tabStrip.scrollTo({ left: edge === 'start' ? 0 : tabStrip.scrollWidth, behavior: 'smooth' });
	}

	function scrollWithWheel(event: WheelEvent): void {
		if (!tabStrip || tabStrip.scrollWidth <= tabStrip.clientWidth) return;
		// Trackpads already emit deltaX. Convert a conventional mouse wheel's
		// vertical delta only while the pointer is over the horizontal tab strip.
		if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
		event.preventDefault();
		tabStrip.scrollLeft += event.deltaY;
	}

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

	function clone(tab: Tab): void {
		const cloned = tabs.clone(tab.id);
		if (cloned && cloned.href !== page.url.pathname) goto(resolve(cloned.href));
	}

	function closeAll(): void {
		const next = tabs.closeAll();
		if (next !== page.url.pathname) goto(resolve(next));
	}

	function resetDrag(): void {
		draggedId = null;
		dragTargetId = null;
		dropAfter = false;
	}

	function startDrag(event: DragEvent, tab: Tab): void {
		draggedId = tab.id;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', tab.id);
		}
	}

	function dragOver(event: DragEvent): void {
		if (!draggedId) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

		const tabBar = event.currentTarget as HTMLElement;
		const barBounds = tabBar.getBoundingClientRect();
		const scrollEdge = 36;
		const scrollStep = 14;
		if (event.clientX < barBounds.left + scrollEdge) tabBar.scrollLeft -= scrollStep;
		if (event.clientX > barBounds.right - scrollEdge) tabBar.scrollLeft += scrollStep;

		// Calculate the insertion point from the whole strip. Ignoring the dragged
		// tab's original box prevents that box from becoming a dead drop zone.
		const candidates = Array.from(tabBar.querySelectorAll<HTMLElement>('[data-shell-tab]')).filter(
			(element) => element.dataset.tabId !== draggedId
		);
		if (candidates.length === 0) return;

		const before = candidates.find((element) => {
			const bounds = element.getBoundingClientRect();
			return event.clientX < bounds.left + bounds.width / 2;
		});
		const target = before ?? candidates[candidates.length - 1];
		if (!target?.dataset.tabId) return;

		dragTargetId = target.dataset.tabId;
		dropAfter = before == null;
	}

	function drop(event: DragEvent): void {
		event.preventDefault();
		if (draggedId && dragTargetId) tabs.move(draggedId, dragTargetId, dropAfter);
		resetDrag();
	}
</script>

{#if tabs.items.length > 0}
	<div class="bg-background flex h-10 shrink-0 items-center border-b">
		{#if hasOverflow}
			<div class="flex shrink-0 items-center border-r px-0.5">
				<button
					type="button"
					class="text-muted-foreground hover:bg-muted hover:text-foreground flex size-6 items-center justify-center rounded-sm disabled:pointer-events-none disabled:opacity-30 sm:size-7"
					disabled={!canScrollLeft}
					onclick={() => scrollToEdge('start')}
					aria-label={t('tabs.scrollStart')}
					title={t('tabs.scrollStart')}
				>
					<ChevronsLeft class="size-3.5" />
				</button>
				<button
					type="button"
					class="text-muted-foreground hover:bg-muted hover:text-foreground flex size-6 items-center justify-center rounded-sm disabled:pointer-events-none disabled:opacity-30 sm:size-7"
					disabled={!canScrollLeft}
					onclick={() => scrollByPage(-1)}
					aria-label={t('tabs.scrollPrevious')}
					title={t('tabs.scrollPrevious')}
				>
					<ChevronLeft class="size-3.5" />
				</button>
			</div>
		{/if}

		<div
			bind:this={tabStrip}
			class="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2"
			role="tablist"
			tabindex="-1"
			onscroll={updateScrollState}
			onwheel={scrollWithWheel}
			ondragover={dragOver}
			ondrop={drop}
		>
			{#each tabs.items as tab (tab.id)}
				{@const active = tab.id === tabs.active}
				{@const soleDashboard = tabs.items.length === 1 && tab.href === '/dashboard'}
				<ContextMenu.Root>
					<ContextMenu.Trigger>
						{#snippet child({ props })}
							<div
								{...props}
								data-shell-tab
								data-tab-id={tab.id}
								draggable="true"
								aria-grabbed={draggedId === tab.id}
								ondragstart={(event) => startDrag(event, tab)}
								ondragend={resetDrag}
								class={cn(
									'group relative flex h-7 shrink-0 select-none items-center rounded-md border transition-colors',
									active
										? 'border-primary/30 bg-primary/10 text-primary'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground border-transparent',
									draggedId === tab.id && 'opacity-50',
									dragTargetId === tab.id &&
										(dropAfter
											? 'after:bg-primary after:absolute after:inset-y-1 after:-right-1 after:w-0.5 after:rounded-full'
											: 'before:bg-primary before:absolute before:inset-y-1 before:-left-1 before:w-0.5 before:rounded-full')
								)}
							>
								<button
									type="button"
									role="tab"
									aria-selected={active}
									draggable="false"
									onclick={() => select(tab)}
									class="flex h-full items-center gap-1.5 rounded-l-md py-1 pr-1.5 pl-2.5 text-sm"
								>
									<tab.icon class="size-3.5 shrink-0" />
									<span class="max-w-40 truncate">{tab.title}</span>
								</button>
								<button
									type="button"
									aria-label={t('tabs.closeLabel', { title: tab.title })}
									draggable="false"
									disabled={soleDashboard}
									onclick={() => close(tab)}
									class={cn(
										'hover:bg-foreground/10 mr-1 flex size-4 items-center justify-center rounded-sm transition-opacity disabled:pointer-events-none disabled:opacity-30',
										active ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
									)}
								>
									<X class="size-3" />
								</button>
							</div>
						{/snippet}
					</ContextMenu.Trigger>
					<ContextMenu.Content class="w-44">
						<ContextMenu.Item onSelect={() => select(tab)}>
							<PanelTopOpen class="size-4" />
							{t('tabs.open')}
						</ContextMenu.Item>
						<ContextMenu.Item onSelect={() => clone(tab)}>
							<Copy class="size-4" />
							{t('tabs.clone')}
						</ContextMenu.Item>
						<ContextMenu.Separator />
						<ContextMenu.Item disabled={soleDashboard} onSelect={() => close(tab)}>
							<X class="size-4" />
							{t('tabs.close')}
						</ContextMenu.Item>
						<ContextMenu.Item
							disabled={tabs.items.length === 1 && tabs.items[0]?.href === '/dashboard'}
							onSelect={closeAll}
						>
							<CircleX class="size-4" />
							{t('tabs.closeAll')}
						</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			{/each}
		</div>

		{#if hasOverflow}
			<div class="flex shrink-0 items-center border-l px-0.5">
				<button
					type="button"
					class="text-muted-foreground hover:bg-muted hover:text-foreground flex size-6 items-center justify-center rounded-sm disabled:pointer-events-none disabled:opacity-30 sm:size-7"
					disabled={!canScrollRight}
					onclick={() => scrollByPage(1)}
					aria-label={t('tabs.scrollNext')}
					title={t('tabs.scrollNext')}
				>
					<ChevronRight class="size-3.5" />
				</button>
				<button
					type="button"
					class="text-muted-foreground hover:bg-muted hover:text-foreground flex size-6 items-center justify-center rounded-sm disabled:pointer-events-none disabled:opacity-30 sm:size-7"
					disabled={!canScrollRight}
					onclick={() => scrollToEdge('end')}
					aria-label={t('tabs.scrollEnd')}
					title={t('tabs.scrollEnd')}
				>
					<ChevronsRight class="size-3.5" />
				</button>
			</div>
		{/if}
	</div>
{/if}
