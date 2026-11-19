<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import DataTable from '#lib/core/components/shared/DataTable.svelte';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { demoProducts } from '#lib/data/products.ts';
	import ProductCell from '../ProductCell.svelte';
	import { columns } from '../demo';
</script>

<PageContainer>
	<PageHeader
		title="Loading & Empty States"
		description="Common feedback states presented as separate table examples."
	/>
	<div class="grid gap-6 xl:grid-cols-2">
		<div class="space-y-3">
			<h2 class="font-semibold">Loading</h2>
			<DataTable text={t} data={[]} {columns} loading pageSize={5} />
		</div>
		<div class="space-y-3">
			<h2 class="font-semibold">Empty</h2>
			<DataTable
				text={t}
				data={[]}
				{columns}
				emptyTitle="No products yet"
				emptyDescription="Add a product to start building your catalog."
			/>
		</div>
	</div>
	<div class="space-y-3">
		<h2 class="font-semibold">No search results</h2>
		<DataTable text={t} data={demoProducts} {columns} searchable search="not-a-real-product"
			><!-- Custom cells demonstrate that empty search still owns the state. -->{#snippet cell(
				row,
				column
			)}<ProductCell {row} {column} />{/snippet}</DataTable
		>
	</div>
</PageContainer>
