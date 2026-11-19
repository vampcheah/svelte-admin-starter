<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import Eye from '@lucide/svelte/icons/eye';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';
	import DataTable from '#lib/core/components/shared/DataTable.svelte';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { demoProducts } from '#lib/data/products.ts';
	import ProductCell from '../ProductCell.svelte';
	import { columns } from '../demo';
</script>

<PageContainer>
	<PageHeader
		title="Row Actions"
		description="A sticky trailing column for common record operations."
	/>
	<DataTable text={t} data={demoProducts.slice(0, 8)} {columns} pageSize={8}>
		{#snippet cell(row, column)}<ProductCell {row} {column} />{/snippet}
		{#snippet actions(row)}<div class="flex justify-end gap-1">
				<Button
					variant="ghost"
					size="icon"
					aria-label={`View ${row.name}`}
					onclick={() => toast.info(`View: ${row.name}`)}><Eye /></Button
				><Button
					variant="ghost"
					size="icon"
					aria-label={`Edit ${row.name}`}
					onclick={() => toast.info(`Edit: ${row.name}`)}><Pencil /></Button
				><Button
					variant="ghost"
					size="icon"
					aria-label={`Delete ${row.name}`}
					onclick={() => toast.info(`Delete: ${row.name}`)}><Trash2 /></Button
				>
			</div>{/snippet}
	</DataTable>
</PageContainer>
