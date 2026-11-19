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
	<PageHeader title="Pagination" description="Client-side pagination with five rows per page." />
	<DataTable text={t} data={demoProducts} {columns} pageSize={5}>
		{#snippet cell(row, column)}<ProductCell {row} {column} />{/snippet}
	</DataTable>
</PageContainer>
