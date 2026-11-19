<script lang="ts">
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import StatCard from '#lib/core/components/shared/StatCard.svelte';
	import * as Card from '#lib/core/components/ui/card/index.ts';

	const stats = [
		{ title: 'Total', value: 0 },
		{ title: 'Active', value: 0 }
	];
</script>

<PageContainer>
	<PageHeader title="Overview" description="A summary of your data." />
	<div class="grid gap-4 sm:grid-cols-2">
		{#each stats as stat (stat.title)}
			<StatCard title={stat.title} value={stat.value} />
		{/each}
	</div>
	<Card.Root>
		<Card.Header><Card.Title>Recent activity</Card.Title></Card.Header>
		<Card.Content><p class="text-sm text-muted-foreground">Add an overview here.</p></Card.Content>
	</Card.Root>
</PageContainer>
