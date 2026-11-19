<script lang="ts">
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import { Label } from '#lib/core/components/ui/label/index.ts';
	import { Textarea } from '#lib/core/components/ui/textarea/index.ts';

	let name = $state('');
	let description = $state('');
	const instanceId = $props.id();
</script>

<PageContainer>
	<PageHeader title="Form Template" description="A focused create or edit page." />
	<form class="grid max-w-3xl gap-6" onsubmit={(event) => event.preventDefault()}>
		<Card.Root>
			<Card.Header
				><Card.Title>Basic information</Card.Title><Card.Description
					>Describe the record being created.</Card.Description
				></Card.Header
			>
			<Card.Content class="grid gap-5">
				<div class="grid gap-2">
					<Label for={`${instanceId}-template-name`}>Name</Label><Input
						id={`${instanceId}-template-name`}
						bind:value={name}
						required
					/>
				</div>
				<div class="grid gap-2">
					<Label for={`${instanceId}-template-description`}>Description</Label><Textarea
						id={`${instanceId}-template-description`}
						bind:value={description}
						rows={4}
					/>
				</div>
			</Card.Content>
			<Card.Footer class="justify-end gap-2"
				><Button variant="outline">Cancel</Button><Button type="submit">Save</Button></Card.Footer
			>
		</Card.Root>
	</form>
</PageContainer>
