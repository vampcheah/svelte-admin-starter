<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import StatusBadge from '#lib/core/components/shared/StatusBadge.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import * as Card from '#lib/core/components/ui/card/index.ts';

	const fields = [
		['Owner', 'Olivia Martin'],
		['Created', 'August 12, 2026'],
		['Department', 'Product Design'],
		['Visibility', 'Workspace']
	];
</script>

<PageContainer>
	<Button variant="ghost" class="w-fit"><ArrowLeft class="size-4" />Back to projects</Button>
	<PageHeader
		title="Website refresh"
		description="A record detail layout with summary and context."
	>
		{#snippet actions()}<StatusBadge tone="success">Active</StatusBadge><Button
				><Pencil class="size-4" />Edit</Button
			>{/snippet}
	</PageHeader>
	<div class="grid gap-6 lg:grid-cols-3">
		<Card.Root class="lg:col-span-2">
			<Card.Header
				><Card.Title>Overview</Card.Title><Card.Description
					>The main record content belongs here.</Card.Description
				></Card.Header
			>
			<Card.Content
				><p class="text-sm leading-6 text-muted-foreground">
					Use this area for descriptions, activity, related records or tabs.
				</p></Card.Content
			>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title>Details</Card.Title></Card.Header>
			<Card.Content
				><dl class="grid gap-4">
					{#each fields as field (field[0])}<div>
							<dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{field[0]}
							</dt>
							<dd class="mt-1 text-sm">{field[1]}</dd>
						</div>{/each}
				</dl></Card.Content
			>
		</Card.Root>
	</div>
</PageContainer>
