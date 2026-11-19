<script lang="ts">
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import { Label } from '#lib/core/components/ui/label/index.ts';

	let name = $state('');

	function submit(event: SubmitEvent) {
		event.preventDefault();
	}
	const instanceId = $props.id();
</script>

<PageContainer>
	<PageHeader title="Create item" description="Add a new item." />
	<form onsubmit={submit} class="max-w-2xl">
		<Card.Root>
			<Card.Content class="space-y-4 pt-6">
				<div class="grid gap-2">
					<Label for={`${instanceId}-name`}>Name</Label>
					<Input id={`${instanceId}-name`} bind:value={name} required />
				</div>
				<Button type="submit">Save</Button>
			</Card.Content>
		</Card.Root>
	</form>
</PageContainer>
