<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';
	import DataTable from '#lib/core/components/shared/DataTable.svelte';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { demoProducts } from '#lib/data/products.ts';
	import ProductCell from '../ProductCell.svelte';
	import { columns } from '../demo';

	let selected = $state<(string | number)[]>([]);
</script>

<PageContainer>
	<PageHeader
		title="Selection"
		description="Checkbox selection with application-owned bulk actions."
	/>
	<DataTable text={t} data={demoProducts} {columns} selectable bind:selected pageSize={8}>
		{#snippet toolbar()}<Button
				variant="destructive"
				size="sm"
				disabled={!selected.length}
				onclick={() => toast.info(`${selected.length} selected`)}><Trash2 />Delete selected</Button
			>{/snippet}
		{#snippet cell(row, column)}<ProductCell {row} {column} />{/snippet}
	</DataTable>
</PageContainer>
