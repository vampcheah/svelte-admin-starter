<!--
  DataTable — a generic table with client-side and optional server-side modes.

  Features:
    • text search across columns flagged `searchable`
    • click-to-sort on columns flagged `sortable` (asc → desc → asc)
    • local or server-backed search, sorting and pagination
    • optional row selection (checkbox column; `selected` is bindable)
    • a loading skeleton state and an EmptyState when there is no data
    • snippet hooks for custom cells (`cell`), per-row `actions`, and a `toolbar`

  The `Column<T>` interface is exported from this file and re-exported as a
  type from the shared barrel.
-->
<script lang="ts" module>
	export interface Column<T> {
		key: string;
		header: string;
		sortable?: boolean;
		searchable?: boolean;
		class?: string;
		cellClass?: string;
		align?: 'left' | 'right' | 'center';
		/** Custom value extractor used for display, search and sort. */
		render?: (row: T) => string | number;
	}

	export interface ServerTableState {
		page: number;
		pageSize: number;
		total: number;
		onPageChange: (page: number) => void;
		onSearchChange?: (search: string) => void;
		onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
	}

	export type DataTableTextKey =
		| 'common.searchPlaceholder'
		| 'common.actions'
		| 'table.selectAll'
		| 'table.selectRow'
		| 'table.sortBy'
		| 'table.noMatches'
		| 'table.noResults'
		| 'table.adjustSearch'
		| 'table.noResultsDescription'
		| 'table.selected'
		| 'table.showing'
		| 'table.of'
		| 'table.prevPage'
		| 'table.nextPage'
		| 'table.goToPage';

	export interface DataTableText {
		(key: DataTableTextKey, params?: Record<string, string | number>): string;
	}
</script>

<script lang="ts" generics="T extends { id: string | number }">
	import { untrack, type Snippet } from 'svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Inbox from '@lucide/svelte/icons/inbox';
	import * as Table from '../ui/table';
	import * as Pagination from '../ui/pagination';
	import { Checkbox } from '../ui/checkbox';
	import { Skeleton } from '../ui/skeleton';
	import { buttonVariants } from '../ui/button';
	import { usePagination } from '../../hooks/use-pagination.svelte';
	import { cn } from '../../utils';
	import EmptyState from './EmptyState.svelte';
	import SearchInput from './SearchInput.svelte';

	const fallbackText: Record<DataTableTextKey, string> = {
		'common.searchPlaceholder': 'Search...',
		'common.actions': 'Actions',
		'table.selectAll': 'Select all rows on this page',
		'table.selectRow': 'Select row',
		'table.sortBy': 'Sort by {col}',
		'table.noMatches': 'No matches',
		'table.noResults': 'No results',
		'table.adjustSearch': 'Try adjusting your search terms.',
		'table.noResultsDescription': 'There is nothing to show here yet.',
		'table.selected': 'selected',
		'table.showing': 'Showing',
		'table.of': 'of',
		'table.prevPage': 'Go to previous page',
		'table.nextPage': 'Go to next page',
		'table.goToPage': 'Go to page {n}'
	};

	function defaultText(
		key: DataTableTextKey,
		params: Record<string, string | number> = {}
	): string {
		return Object.entries(params).reduce(
			(value, [name, replacement]) => value.replaceAll(`{${name}}`, String(replacement)),
			fallbackText[key]
		);
	}

	interface Props {
		data: T[];
		columns: Column<T>[];
		searchable?: boolean;
		selectable?: boolean;
		/** Whether to pin the actions column to the right side on horizontal scroll (default: true). */
		stickyActions?: boolean;
		loading?: boolean;
		pageSize?: number;
		text?: DataTableText;
		emptyTitle?: string;
		emptyDescription?: string;
		/** Currently selected row ids (bindable). */
		selected?: (string | number)[];
		/** Current text search query (bindable for filter-aware external actions). */
		search?: string;
		/** Render a custom cell; receives the row and its column. */
		cell?: Snippet<[T, Column<T>]>;
		/** Trailing per-row actions column. */
		actions?: Snippet<[T]>;
		/** Extra controls rendered in the toolbar (left of search). */
		toolbar?: Snippet;
		/** Optional layout classes for the underlying table. */
		tableClass?: string;
		/** Enables real backend pagination/search/sort instead of slicing the full dataset. */
		server?: ServerTableState;
	}

	let {
		data,
		columns,
		searchable = false,
		selectable = false,
		stickyActions = true,
		loading = false,
		pageSize = 10,
		text = defaultText,
		emptyTitle,
		emptyDescription,
		selected = $bindable([]),
		search = $bindable(''),
		cell,
		actions,
		toolbar,
		tableClass,
		server
	}: Props = $props();

	let sortKey = $state<string | null>(null);
	let sortDir = $state<'asc' | 'desc'>('asc');

	// `pageSize` seeds the paginator; keep it in sync if the prop later changes.
	// svelte-ignore state_referenced_locally
	const pagination = usePagination({ pageSize });
	$effect(() => {
		pagination.setPageSize(server?.pageSize ?? pageSize);
	});

	const serverSearchEnabled = $derived(Boolean(server?.onSearchChange));
	let searchEffectReady = false;
	$effect(() => {
		const query = search;
		if (!serverSearchEnabled) {
			searchEffectReady = false;
			return;
		}
		// Inline server state changes identity after every response. Do not turn
		// those response updates into duplicate search requests.
		const callback = untrack(() => server?.onSearchChange);
		if (!callback) return;
		if (!searchEffectReady) {
			searchEffectReady = true;
			return;
		}
		const timer = setTimeout(() => callback(query), 200);
		return () => clearTimeout(timer);
	});

	/** Read a column's comparable/display value for a row. */
	function valueOf(row: T, column: Column<T>): string | number {
		if (column.render) return column.render(row);
		const raw = (row as Record<string, unknown>)[column.key];
		return raw == null ? '' : (raw as string | number);
	}

	// --- Filtering ---------------------------------------------------------
	const searchableColumns = $derived(columns.filter((c) => c.searchable));

	const filtered = $derived.by(() => {
		if (server) return data;
		const query = search.trim().toLowerCase();
		if (!query || searchableColumns.length === 0) return data;
		return data.filter((row) =>
			searchableColumns.some((c) => String(valueOf(row, c)).toLowerCase().includes(query))
		);
	});

	// --- Sorting -----------------------------------------------------------
	const sorted = $derived.by(() => {
		if (server) return filtered;
		if (!sortKey) return filtered;
		const column = columns.find((c) => c.key === sortKey);
		if (!column) return filtered;
		const factor = sortDir === 'asc' ? 1 : -1;
		return [...filtered].sort((a, b) => {
			const av = valueOf(a, column);
			const bv = valueOf(b, column);
			if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
			return String(av).localeCompare(String(bv), undefined, { numeric: true }) * factor;
		});
	});

	// Keep the paginator's total in sync with the filtered/sorted row count.
	$effect(() => {
		pagination.setTotal(server?.total ?? sorted.length);
	});

	$effect(() => {
		if (server) pagination.setPage(server.page);
	});

	// Reset to the first page whenever the search query changes.
	$effect(() => {
		// Bare reference registers `search` as a reactive dependency of this effect.
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		search;
		pagination.setPage(1);
	});

	// --- Pagination slice --------------------------------------------------
	// Derive bounds from page/pageSize directly so behaviour is independent of
	// the hook's `start`/`end` index convention.
	const activePage = $derived(server?.page ?? pagination.page);
	const activePageSize = $derived(server?.pageSize ?? pagination.pageSize);
	const totalRows = $derived(server?.total ?? sorted.length);
	const sliceStart = $derived((activePage - 1) * activePageSize);
	const sliceEnd = $derived(
		Math.min(sliceStart + (server ? data.length : activePageSize), totalRows)
	);
	const pageRows = $derived(server ? data : sorted.slice(sliceStart, sliceEnd));
	const hasPrev = $derived(activePage > 1);
	const hasNext = $derived(activePage * activePageSize < totalRows);
	const initialLoading = $derived(loading && data.length === 0);

	const columnCount = $derived(columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0));

	const allOnPageSelected = $derived(
		pageRows.length > 0 && pageRows.every((row) => selected.includes(row.id))
	);
	const someOnPageSelected = $derived(
		pageRows.some((row) => selected.includes(row.id)) && !allOnPageSelected
	);

	function toggleSort(column: Column<T>) {
		if (!column.sortable) return;
		let nextDirection: 'asc' | 'desc';
		if (sortKey === column.key) {
			nextDirection = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = column.key;
			nextDirection = 'asc';
		}
		sortDir = nextDirection;
		if (server?.onSortChange) server.onSortChange(column.key, nextDirection);
		else pagination.setPage(1);
	}

	function changePage(next: number) {
		if (loading || next === activePage) return;
		if (server) server.onPageChange(next);
		else pagination.setPage(next);
	}

	function toggleRow(row: T, checked: boolean) {
		if (checked) {
			if (!selected.includes(row.id)) selected = [...selected, row.id];
		} else {
			selected = selected.filter((id) => id !== row.id);
		}
	}

	function toggleAllOnPage(checked: boolean) {
		const pageIds = pageRows.map((r) => r.id);
		if (checked) {
			const merged = new Set([...selected, ...pageIds]);
			selected = [...merged];
		} else {
			selected = selected.filter((id) => !pageIds.includes(id));
		}
	}

	function alignClass(align?: 'left' | 'right' | 'center') {
		return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
	}
</script>

<div class="space-y-4">
	{#if searchable || toolbar}
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			{#if toolbar}
				<div class="flex flex-wrap items-center gap-2">{@render toolbar()}</div>
			{:else}
				<div></div>
			{/if}
			{#if searchable}
				<div class="w-full sm:w-64">
					<SearchInput bind:value={search} placeholder={text('common.searchPlaceholder')} />
				</div>
			{/if}
		</div>
	{/if}

	<div class="bg-card overflow-hidden rounded-lg border border-border" aria-busy={loading}>
		<div class="overflow-x-auto">
			<Table.Root class={tableClass}>
				<Table.Header>
					<Table.Row class="border-primary bg-primary hover:[&>th]:!bg-primary">
						{#if selectable}
							<Table.Head class="w-10">
								<Checkbox
									checked={allOnPageSelected}
									indeterminate={someOnPageSelected}
									onCheckedChange={(v) => toggleAllOnPage(v === true)}
									aria-label={text('table.selectAll')}
								/>
							</Table.Head>
						{/if}
						{#each columns as column (column.key)}
							<Table.Head
								class={cn(
									'text-primary-foreground/80 text-xs font-medium tracking-wide uppercase',
									alignClass(column.align),
									column.class
								)}
							>
								{#if column.sortable}
									<button
										type="button"
										onclick={() => toggleSort(column)}
										class={cn(
											'text-primary-foreground/80 hover:text-primary-foreground focus-visible:ring-primary-foreground/50 -mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
											column.align === 'right' && 'flex-row-reverse'
										)}
										aria-label={text('table.sortBy', { col: column.header })}
									>
										{column.header}
										{#if sortKey === column.key}
											{#if sortDir === 'asc'}
												<ArrowUp class="text-primary-foreground size-3.5" aria-hidden="true" />
											{:else}
												<ArrowDown class="text-primary-foreground size-3.5" aria-hidden="true" />
											{/if}
										{:else}
											<ChevronsUpDown
												class="text-primary-foreground/60 size-3.5"
												aria-hidden="true"
											/>
										{/if}
									</button>
								{:else}
									{column.header}
								{/if}
							</Table.Head>
						{/each}
						{#if actions}
							<Table.Head
								class={cn('w-12 text-right', stickyActions && 'sticky right-0 z-20 bg-primary')}
							>
								<span class="sr-only">{text('common.actions')}</span>
							</Table.Head>
						{/if}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if initialLoading}
						{#each Array(Math.min(activePageSize, 5)) as _, i (i)}
							<Table.Row>
								{#if selectable}
									<Table.Cell><Skeleton class="size-4 rounded" /></Table.Cell>
								{/if}
								{#each columns as column (column.key)}
									<Table.Cell class={cn(alignClass(column.align), column.class, column.cellClass)}>
										<Skeleton class="h-4 w-24" />
									</Table.Cell>
								{/each}
								{#if actions}
									<Table.Cell
										class={cn('text-right', stickyActions && 'sticky right-0 z-10 bg-muted')}
									>
										<Skeleton class="ms-auto h-4 w-8" />
									</Table.Cell>
								{/if}
							</Table.Row>
						{/each}
					{:else if pageRows.length === 0}
						<Table.Row class="hover:bg-transparent">
							<Table.Cell colspan={columnCount} class="p-0">
								<EmptyState
									icon={Inbox}
									title={search ? text('table.noMatches') : (emptyTitle ?? text('table.noResults'))}
									description={search
										? text('table.adjustSearch')
										: (emptyDescription ?? text('table.noResultsDescription'))}
									class="rounded-none border-0"
								/>
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each pageRows as row (row.id)}
							<Table.Row
								class="group/row"
								data-state={selected.includes(row.id) ? 'selected' : undefined}
							>
								{#if selectable}
									<Table.Cell class="w-10">
										<Checkbox
											checked={selected.includes(row.id)}
											onCheckedChange={(v) => toggleRow(row, v === true)}
											aria-label={text('table.selectRow')}
										/>
									</Table.Cell>
								{/if}
								{#each columns as column (column.key)}
									<Table.Cell class={cn(alignClass(column.align), column.class, column.cellClass)}>
										{#if cell}
											{@render cell(row, column)}
										{:else}
											{valueOf(row, column)}
										{/if}
									</Table.Cell>
								{/each}
								{#if actions}
									<Table.Cell
										class={cn(
											'text-right',
											stickyActions &&
												'sticky right-0 z-10 bg-muted group-hover/row:bg-amber-50 dark:group-hover/row:bg-amber-950/60 group-data-[state=selected]/row:bg-amber-100/70 dark:group-data-[state=selected]/row:bg-amber-900/40'
										)}
									>
										{@render actions(row)}
									</Table.Cell>
								{/if}
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	{#if totalRows > 0}
		<div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
			<p class="text-sm whitespace-nowrap text-muted-foreground">
				{#if selectable && selected.length > 0}
					{selected.length} {text('table.selected')} ·
				{/if}
				{text('table.showing')}
				<span class="font-medium text-foreground">{totalRows === 0 ? 0 : sliceStart + 1}</span
				>–<span class="font-medium text-foreground">{sliceEnd}</span>
				{text('table.of')}
				<span class="font-medium text-foreground">{totalRows}</span>
			</p>

			{#if Math.ceil(totalRows / activePageSize) > 1}
				<Pagination.Root
					count={totalRows}
					perPage={activePageSize}
					page={activePage}
					onPageChange={changePage}
					class="mx-0 w-auto justify-end"
				>
					<Pagination.Content>
						<Pagination.Item>
							<button
								type="button"
								onclick={() => changePage(activePage - 1)}
								disabled={loading || !hasPrev}
								aria-label={text('table.prevPage')}
								class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
							>
								<ChevronLeft class="size-4" aria-hidden="true" />
							</button>
						</Pagination.Item>

						{#each pagination.pages as p, i (i)}
							<Pagination.Item>
								{#if p === -1}
									<Pagination.Ellipsis />
								{:else}
									<button
										type="button"
										onclick={() => changePage(p)}
										aria-label={text('table.goToPage', { n: p })}
										disabled={loading}
										aria-current={p === activePage ? 'page' : undefined}
										class={cn(
											buttonVariants({
												variant: p === activePage ? 'outline' : 'ghost',
												size: 'icon'
											})
										)}
									>
										{p}
									</button>
								{/if}
							</Pagination.Item>
						{/each}

						<Pagination.Item>
							<button
								type="button"
								onclick={() => changePage(activePage + 1)}
								disabled={loading || !hasNext}
								aria-label={text('table.nextPage')}
								class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
							>
								<ChevronRight class="size-4" aria-hidden="true" />
							</button>
						</Pagination.Item>
					</Pagination.Content>
				</Pagination.Root>
			{/if}
		</div>
	{/if}
</div>
