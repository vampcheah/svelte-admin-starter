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
		title="Basic Data Table"
		description="Typed columns and formatted cells without optional controls."
	/>
	<DataTable text={t} data={demoProducts.slice(0, 6)} columns={columns.slice(0, 4)} pageSize={6}>
		{#snippet cell(row, column)}<ProductCell {row} {column} />{/snippet}
	</DataTable>
</PageContainer>
