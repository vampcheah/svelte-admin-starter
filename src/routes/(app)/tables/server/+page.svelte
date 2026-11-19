<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import DataTable from '#lib/core/components/shared/DataTable.svelte';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { demoProducts, type DemoProduct } from '#lib/data/products.ts';
	import ProductCell from '../ProductCell.svelte';
	import { columns } from '../demo';

	let page = $state(1);
	let search = $state('');
	let sortKey = $state<keyof DemoProduct>('name');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	const matches = $derived.by(() => {
		const query = search.trim().toLowerCase();
		const rows = query
			? demoProducts.filter((product) =>
					`${product.name} ${product.category}`.toLowerCase().includes(query)
				)
			: demoProducts;
		const direction = sortDirection === 'asc' ? 1 : -1;
		return [...rows].sort(
			(a, b) =>
				String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true }) *
				direction
		);
	});
	const rows = $derived(matches.slice((page - 1) * 5, page * 5));
</script>

<PageContainer>
	<PageHeader
		title="Server-side"
		description="Delegate search, sorting and pagination while passing only the active page."
	/>
	<DataTable
		text={t}
		data={rows}
		{columns}
		searchable
		server={{
			page,
			pageSize: 5,
			total: matches.length,
			sortKey,
			sortDirection,
			onPageChange: (next) => (page = next),
			onSearchChange: (next) => {
				search = next;
				page = 1;
			},
			onSortChange: (key, direction) => {
				sortKey = key as keyof DemoProduct;
				sortDirection = direction;
			}
		}}
	>
		{#snippet cell(row, column)}<ProductCell {row} {column} />{/snippet}
	</DataTable>
</PageContainer>
