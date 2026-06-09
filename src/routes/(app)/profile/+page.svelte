<!--
  Profile — view and edit the current user's account details. Two-column layout:
  an avatar card on the left, an editable form on the right. All state is local
  ($state copies of auth.user); saving just fires a toast (no backend).
-->
<script lang="ts">
	import Camera from '@lucide/svelte/icons/camera';

	import { PageContainer, PageHeader } from '$lib/components/shared';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	import { toast } from 'svelte-sonner';

	import { auth } from '$lib/auth';
	import { initials } from '$lib/utils/formatters';

	// `value` is typed `string` to satisfy the single-select binding (bits-ui).
	const ROLE_OPTIONS: { value: string; label: string }[] = [
		{ value: 'admin', label: 'Admin' },
		{ value: 'editor', label: 'Editor' },
		{ value: 'viewer', label: 'Viewer' }
	];

	// Local editable copy of the user's profile (mock — no persistence).
	let name = $state(auth.user?.name ?? '');
	let email = $state(auth.user?.email ?? '');
	let role = $state<string>(auth.user?.role ?? 'viewer');
	let bio = $state(
		'Product-focused engineer who loves clean, accessible interfaces and shipping fast.'
	);

	const roleLabel = $derived(ROLE_OPTIONS.find((r) => r.value === role)?.label ?? 'Viewer');
	const avatarInitials = $derived(initials(name || 'User'));

	function save(event: SubmitEvent) {
		event.preventDefault();
		toast.success('Profile updated');
	}

	function changeAvatar() {
		toast.info('Avatar upload is not available in this demo');
	}
</script>

<svelte:head>
	<title>Profile · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader
		title="Profile"
		description="Manage your personal information and account preferences."
	/>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Left: avatar card -->
		<Card.Root class="lg:col-span-1">
			<Card.Header>
				<Card.Title>Your photo</Card.Title>
				<Card.Description>This is how you appear across the workspace.</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col items-center gap-4 text-center">
				<Avatar.Root class="size-24">
					{#if auth.user?.avatarUrl}
						<Avatar.Image src={auth.user.avatarUrl} alt={name} />
					{/if}
					<Avatar.Fallback class="text-2xl">{avatarInitials}</Avatar.Fallback>
				</Avatar.Root>
				<div class="space-y-0.5">
					<p class="font-medium text-foreground">{name || 'Unnamed user'}</p>
					<p class="text-sm text-muted-foreground">{email}</p>
				</div>
				<Button variant="outline" size="sm" onclick={changeAvatar}>
					<Camera class="size-4" aria-hidden="true" />
					Change avatar
				</Button>
			</Card.Content>
		</Card.Root>

		<!-- Right: editable form -->
		<Card.Root class="lg:col-span-2">
			<form onsubmit={save}>
				<Card.Header>
					<Card.Title>Account details</Card.Title>
					<Card.Description>Update your name, contact email, and bio.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="name">Name</Label>
							<Input id="name" bind:value={name} placeholder="Your full name" autocomplete="name" />
						</div>
						<div class="space-y-2">
							<Label for="email">Email</Label>
							<Input
								id="email"
								type="email"
								bind:value={email}
								placeholder="you@example.com"
								autocomplete="email"
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="role">Role</Label>
						<Select.Root type="single" bind:value={role} disabled>
							<Select.Trigger id="role" class="w-full">
								{roleLabel}
							</Select.Trigger>
							<Select.Content>
								{#each ROLE_OPTIONS as option (option.value)}
									<Select.Item value={option.value} label={option.label}>
										{option.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<p class="text-xs text-muted-foreground">
							Roles are managed by your workspace administrator.
						</p>
					</div>

					<div class="space-y-2">
						<Label for="bio">Bio</Label>
						<Textarea
							id="bio"
							bind:value={bio}
							rows={4}
							placeholder="Tell us a little about yourself"
						/>
					</div>
				</Card.Content>
				<Card.Footer class="justify-end gap-2">
					<Button type="submit">Save changes</Button>
				</Card.Footer>
			</form>
		</Card.Root>
	</div>
</PageContainer>
