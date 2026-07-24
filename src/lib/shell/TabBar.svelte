<!-- Multi-tab strip under the header: open routes as switchable, closable tabs. -->
<script lang="ts">
	import { tick, untrack } from 'svelte';
	import type { Tab } from './tabs.svelte';
	import X from '@lucide/svelte/icons/x';
	import PanelTopOpen from '@lucide/svelte/icons/panel-top-open';
	import Copy from '@lucide/svelte/icons/copy';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Pathname } from '$app/types';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { i18n, t } from '$lib/i18n';
	import { cn } from '$lib/utils';
	import { tabs } from './tabs.svelte';

	let draggedId = $state<string | null>(null);
	let dragTargetId = $state<string | null>(null);
	let dropAfter = $state(false);
	let tabStrip = $state<HTMLElement | null>(null);
	let hasOverflow = $state(false);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);
	const currentUrl = $derived(`${page.url.pathname}${page.url.search}`);

	$effect(() => {
		const _locale = i18n.locale;
		untrack(() => tabs.refreshTitles());
	});

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
		const activeTitle = tabs.items.find((tab) => tab.id === activeId)?.title;
		const _hasOverflow = hasOverflow;
		const activeIsLast = tabs.items.at(-1)?.id === activeId;
		if (!activeId || !activeTitle || itemCount === 0) return;
		void tick().then(() => {
			if (!tabStrip) return;
			const activeTab = Array.from(tabStrip.querySelectorAll<HTMLElement>('[data-shell-tab]')).find(
				(element) => element.dataset.tabId === activeId
			);
			if (!activeTab) return;
			if (activeIsLast) {
				tabStrip.scrollTo({ left: tabStrip.scrollWidth });
				updateScrollState();
				return;
			}

			const stripBounds = tabStrip.getBoundingClientRect();
			const tabBounds = activeTab.getBoundingClientRect();
			if (tabBounds.left < stripBounds.left) {
				tabStrip.scrollBy({ left: tabBounds.left - stripBounds.left - 8 });
			} else if (tabBounds.right > stripBounds.right) {
				tabStrip.scrollBy({ left: tabBounds.right - stripBounds.right + 8 });
			}
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
		if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
		event.preventDefault();
		tabStrip.scrollLeft += event.deltaY;
	}

	function navigate(url: string): void {
		const queryAt = url.indexOf('?');
		const pathname = (queryAt === -1 ? url : url.slice(0, queryAt)) as Pathname;
		const search = queryAt === -1 ? '' : url.slice(queryAt);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve(pathname as '/dashboard')}${search}`);
	}

	async function refresh(tab: Tab): Promise<void> {
		tabs.active = tab.id;
		if (tab.url !== currentUrl) {
			const queryAt = tab.url.indexOf('?');
			const pathname = (queryAt === -1 ? tab.url : tab.url.slice(0, queryAt)) as Pathname;
			const search = queryAt === -1 ? '' : tab.url.slice(queryAt);
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(`${resolve(pathname as '/dashboard')}${search}`);
		}
		await invalidateAll();
		tabs.refresh(tab.id);
	}

	function select(tab: Tab): void {
		if (tab.id === tabs.active) return;
		tabs.active = tab.id;
		if (tab.url !== currentUrl) navigate(tab.url);
	}

	function close(tab: Tab): void {
		const next = tabs.close(tab.id);
		if (next && next !== currentUrl) navigate(next);
	}

	function closeOthers(tab: Tab): void {
		const next = tabs.closeOthers(tab.id);
		if (next && next !== currentUrl) navigate(next);
	}

	function closeLeft(tab: Tab): void {
		const next = tabs.closeLeft(tab.id);
		if (next && next !== currentUrl) navigate(next);
	}

	function closeRight(tab: Tab): void {
		const next = tabs.closeRight(tab.id);
		if (next && next !== currentUrl) navigate(next);
	}

	async function clone(tab: Tab): Promise<void> {
		if (!(await tabs.confirmOverflow())) return;
		const cloned = tabs.clone(tab.id, true);
		if (cloned && cloned.url !== currentUrl) navigate(cloned.url);
	}

	function closeAll(): void {
		const next = tabs.closeAll();
		if (next !== currentUrl) navigate(next);
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
	<div class="dark:bg-background flex h-10 shrink-0 items-center border-b bg-slate-200">
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

		<nav
			bind:this={tabStrip}
			class="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2"
			aria-label={t('tabs.navigationLabel')}
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
									'group relative flex h-7 shrink-0 items-center rounded-md border transition-colors select-none',
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
									aria-current={active ? 'page' : undefined}
									draggable="false"
									onclick={() => select(tab)}
									class="flex h-full items-center gap-1.5 rounded-l-md py-1 pr-1.5 pl-2.5 text-sm"
								>
									<tab.icon class="size-3.5 shrink-0" />
									<span class="max-w-64 truncate" title={tab.title}>{tab.title}</span>
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
						<ContextMenu.Item onSelect={() => void refresh(tab)}>
							<RefreshCw class="size-4" />
							{t('tabs.refresh')}
						</ContextMenu.Item>
						<ContextMenu.Separator />
						<ContextMenu.Item disabled={soleDashboard} onSelect={() => close(tab)}>
							<X class="size-4" />
							{t('tabs.close')}
						</ContextMenu.Item>
						<ContextMenu.Item disabled={tabs.items.length <= 1} onSelect={() => closeOthers(tab)}>
							<CircleX class="size-4" />
							{t('tabs.closeOthers')}
						</ContextMenu.Item>
						<ContextMenu.Item
							disabled={tabs.items[0]?.id === tab.id}
							onSelect={() => closeLeft(tab)}
						>
							<ChevronsLeft class="size-4" />
							{t('tabs.closeLeft')}
						</ContextMenu.Item>
						<ContextMenu.Item
							disabled={tabs.items[tabs.items.length - 1]?.id === tab.id}
							onSelect={() => closeRight(tab)}
						>
							<ChevronsRight class="size-4" />
							{t('tabs.closeRight')}
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
		</nav>

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
