<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import DataTable from '#lib/core/components/shared/DataTable.svelte';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import type { Column } from '#lib/core/components/shared/DataTable.svelte';

	type Item = { id: number; name: string };

	const items: Item[] = [];
	const columns: Column<Item>[] = [{ key: 'name', header: 'Name', searchable: true }];
</script>

<PageContainer>
	<PageHeader title="Items" description="Manage your items." />
	<DataTable text={t} data={items} {columns} searchable />
</PageContainer>
