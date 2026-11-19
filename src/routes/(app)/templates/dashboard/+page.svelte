<script lang="ts">
	import Users from '@lucide/svelte/icons/users';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Clock from '@lucide/svelte/icons/clock';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import StatCard from '#lib/core/components/shared/StatCard.svelte';
	import * as Card from '#lib/core/components/ui/card/index.ts';

	const stats = [
		{ title: 'Members', value: 128, change: 8, icon: Users },
		{ title: 'Projects', value: 24, change: 4, icon: FolderKanban },
		{ title: 'Completed', value: 312, change: 12, icon: CircleCheck },
		{ title: 'Hours', value: '1,248', change: -3, icon: Clock }
	];
	const activity = [
		'Website refresh moved to review',
		'Olivia invited three members',
		'Billing migration was completed'
	];
</script>

<PageContainer>
	<PageHeader
		title="Dashboard Template"
		description="A metric-led overview with primary and secondary panels."
	/>
	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each stats as stat (stat.title)}<StatCard {...stat} hint="vs last month" />{/each}
	</div>
	<div class="grid gap-4 lg:grid-cols-3">
		<Card.Root class="lg:col-span-2"
			><Card.Header
				><Card.Title>Primary visualization</Card.Title><Card.Description
					>Place a chart, map or operational summary here.</Card.Description
				></Card.Header
			><Card.Content
				><div class="flex h-64 items-end gap-3 rounded-lg border bg-muted/20 p-6">
					{#each [40, 64, 48, 82, 58, 92, 70] as height, index (index)}<div
							class="flex-1 rounded-t bg-primary/80"
							style={`height: ${height}%`}
						></div>{/each}
				</div></Card.Content
			></Card.Root
		>
		<Card.Root
			><Card.Header><Card.Title>Recent activity</Card.Title></Card.Header><Card.Content
				><ul class="space-y-4">
					{#each activity as item (item)}<li class="border-l-2 border-primary pl-3 text-sm">
							{item}
						</li>{/each}
				</ul></Card.Content
			></Card.Root
		>
	</div>
</PageContainer>
