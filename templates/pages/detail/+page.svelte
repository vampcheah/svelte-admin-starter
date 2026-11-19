<script lang="ts">
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import * as Card from '#lib/core/components/ui/card/index.ts';

	const item = { name: 'Item name', description: 'Item description' };
</script>

<PageContainer>
	<PageHeader title={item.name} description={item.description} />
	<Card.Root>
		<Card.Header><Card.Title>Details</Card.Title></Card.Header>
		<Card.Content>
			<p class="text-sm text-muted-foreground">Replace with record fields.</p>
		</Card.Content>
	</Card.Root>
</PageContainer>
