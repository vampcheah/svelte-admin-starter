<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import Plus from '@lucide/svelte/icons/plus';
	import Download from '@lucide/svelte/icons/download';
	import DataTable from '#lib/core/components/shared/DataTable.svelte';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import StatusBadge from '#lib/core/components/shared/StatusBadge.svelte';
	import type { Column } from '#lib/core/components/shared/DataTable.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';

	type Project = { id: number; name: string; owner: string; status: 'Active' | 'Draft' };

	const projects: Project[] = [
		{ id: 1, name: 'Website refresh', owner: 'Olivia Martin', status: 'Active' },
		{ id: 2, name: 'Mobile onboarding', owner: 'Liam Johnson', status: 'Draft' },
		{ id: 3, name: 'Billing migration', owner: 'Emma Williams', status: 'Active' }
	];
	const columns: Column<Project>[] = [
		{ key: 'name', header: 'Project', searchable: true, sortable: true },
		{ key: 'owner', header: 'Owner', searchable: true },
		{ key: 'status', header: 'Status', sortable: true }
	];
</script>

<PageContainer>
	<PageHeader
		title="List Template"
		description="A collection page with search, sorting and actions."
	>
		{#snippet actions()}
			<Button variant="outline"><Download class="size-4" />Export</Button>
			<Button><Plus class="size-4" />New project</Button>
		{/snippet}
	</PageHeader>
	<DataTable text={t} data={projects} {columns} searchable>
		{#snippet cell(row, column)}
			{#if column.key === 'name'}
				<span class="font-medium">{row.name}</span>
			{:else if column.key === 'owner'}
				<span class="text-muted-foreground">{row.owner}</span>
			{:else if column.key === 'status'}
				<StatusBadge tone={row.status === 'Active' ? 'success' : 'neutral'}
					>{row.status}</StatusBadge
				>
			{/if}
		{/snippet}
	</DataTable>
</PageContainer>
