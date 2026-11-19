<script lang="ts">
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Label } from '#lib/core/components/ui/label/index.ts';
	import { Switch } from '#lib/core/components/ui/switch/index.ts';

	let enabled = $state(true);
	const sections = ['General', 'Notifications', 'Security'];
	const instanceId = $props.id();
</script>

<PageContainer>
	<PageHeader title="Settings" description="Manage application preferences." />
	<div class="grid gap-6 lg:grid-cols-[14rem_1fr]">
		<nav aria-label="Settings sections" class="flex gap-2 overflow-x-auto lg:flex-col">
			{#each sections as section, index (section)}
				<Button variant={index === 0 ? 'secondary' : 'ghost'} class="justify-start"
					>{section}</Button
				>
			{/each}
		</nav>
		<Card.Root>
			<Card.Header><Card.Title>General</Card.Title></Card.Header>
			<Card.Content class="flex items-center justify-between gap-4">
				<div>
					<Label for={`${instanceId}-enabled`}>Preference</Label>
					<p class="text-sm text-muted-foreground">Describe what this setting controls.</p>
				</div>
				<Switch
					id={`${instanceId}-enabled`}
					checked={enabled}
					onCheckedChange={(checked) => (enabled = checked)}
				/>
			</Card.Content>
		</Card.Root>
	</div>
</PageContainer>
