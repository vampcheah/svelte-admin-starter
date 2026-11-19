<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- typed nav paths are already validated by SvelteKit. */
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { navGroups } from '#lib/shell/nav.ts';

	const examples = navGroups.find((group) => group.label === 'Data Tables')?.items ?? [];
</script>

<PageContainer>
	<PageHeader
		title="Data Tables"
		description="Choose a focused example for a common application table pattern."
	/>
	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
		{#each examples as example (example.href)}
			<a
				href={example.href}
				class="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<Card.Root
					class="h-full transition-colors group-hover:border-primary/50 group-hover:bg-muted/30"
				>
					<Card.Header
						><example.icon class="size-5 text-primary" /><Card.Title>{example.title}</Card.Title
						><Card.Description
							>View the {example.title.toLowerCase()} DataTable pattern.</Card.Description
						></Card.Header
					>
				</Card.Root>
			</a>
		{/each}
	</div>
</PageContainer>
