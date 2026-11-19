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
		title="Search & Sort"
		description="Search marked columns and sort from the table headers."
	/>
	<DataTable text={t} data={demoProducts} {columns} searchable pageSize={8}>
		{#snippet cell(row, column)}<ProductCell {row} {column} />{/snippet}
	</DataTable>
</PageContainer>
