<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import DataTable from '#lib/core/components/shared/DataTable.svelte';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import * as Select from '#lib/core/components/ui/select/index.ts';
	import { demoProducts } from '#lib/data/products.ts';
	import ProductCell from '../ProductCell.svelte';
	import { columns } from '../demo';

	let category = $state('all');
	let status = $state('all');
	const categories = [...new Set(demoProducts.map((product) => product.category))].sort();
	const rows = $derived(
		demoProducts.filter(
			(product) =>
				(category === 'all' || product.category === category) &&
				(status === 'all' || product.status === status)
		)
	);
</script>

<PageContainer>
	<PageHeader
		title="Filters"
		description="Application-owned filters combined with built-in text search."
	/>
	<DataTable text={t} data={rows} {columns} searchable pageSize={8}>
		{#snippet toolbar()}
			<Select.Root type="single" bind:value={category}
				><Select.Trigger size="sm" class="w-40"
					>{category === 'all' ? 'All categories' : category}</Select.Trigger
				><Select.Content
					><Select.Item
						value="all"
						label="All categories"
					/>{#each categories as item (item)}<Select.Item
							value={item}
							label={item}
						/>{/each}</Select.Content
				></Select.Root
			>
			<Select.Root type="single" bind:value={status}
				><Select.Trigger size="sm" class="w-32"
					>{status === 'all' ? 'All statuses' : status}</Select.Trigger
				><Select.Content
					><Select.Item value="all" label="All statuses" /><Select.Item
						value="in_stock"
						label="In stock"
					/><Select.Item value="low" label="Low" /><Select.Item
						value="out"
						label="Out"
					/></Select.Content
				></Select.Root
			>
			<Button
				variant="ghost"
				size="sm"
				onclick={() => {
					category = 'all';
					status = 'all';
				}}><RotateCcw />Reset</Button
			>
		{/snippet}
		{#snippet cell(row, column)}<ProductCell {row} {column} />{/snippet}
	</DataTable>
</PageContainer>
