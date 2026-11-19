<!-- Local profile draft; saving validates and shows demo feedback. -->
<script lang="ts">
	import Camera from '@lucide/svelte/icons/camera';
	import type { z } from 'zod';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import FormField from '#lib/core/components/shared/FormField.svelte';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import * as Avatar from '#lib/core/components/ui/avatar/index.ts';
	import * as Select from '#lib/core/components/ui/select/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import { Textarea } from '#lib/core/components/ui/textarea/index.ts';
	import { fieldError } from '#lib/core/utils/validators.ts';
	import { createProfileSchema } from '#lib/features/profile/schema.ts';
	import { USER_ROLES, roleLabel } from '#lib/features/users/presentation.ts';
	import { toast } from 'svelte-sonner';
	import { auth } from '#lib/auth/index.ts';
	import type { User } from '#lib/auth/types.ts';
	import { initials } from '#lib/i18n/formatters.ts';
	import { t } from '#lib/i18n/index.ts';

	let name = $state(auth.user?.name ?? '');
	let email = $state(auth.user?.email ?? '');
	let role = $state<string>(auth.user?.role ?? 'viewer');
	let bio = $state(t('profile.defaultBio'));
	let errors = $state<z.ZodError | null>(null);
	const avatarInitials = $derived(initials(name || t('profile.user')));

	function save(event: SubmitEvent) {
		event.preventDefault();
		const result = createProfileSchema(t).safeParse({ name, email, bio });
		if (!result.success) {
			errors = result.error;
			return;
		}
		errors = null;
		({ name, email, bio } = result.data);
		toast.success(t('profile.updated'));
	}

	function changeAvatar() {
		toast.info(t('profile.avatarUnavailable'));
	}
</script>

<PageContainer>
	<PageHeader title={t('profile.title')} description={t('profile.description')} />
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<Card.Root class="lg:col-span-1">
			<Card.Header>
				<Card.Title>{t('profile.photo')}</Card.Title>
				<Card.Description>{t('profile.photoDescription')}</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col items-center gap-4 text-center">
				<Avatar.Root class="size-24">
					{#if auth.user?.avatarUrl}
						<Avatar.Image src={auth.user.avatarUrl} alt={name} />
					{/if}
					<Avatar.Fallback class="text-2xl">{avatarInitials}</Avatar.Fallback>
				</Avatar.Root>
				<div class="space-y-0.5">
					<p class="font-medium text-foreground">{name || t('profile.unnamedUser')}</p>
					<p class="text-sm text-muted-foreground">{email}</p>
				</div>
				<Button variant="outline" size="sm" onclick={changeAvatar}>
					<Camera class="size-4" aria-hidden="true" />
					{t('profile.changeAvatar')}
				</Button>
			</Card.Content>
		</Card.Root>

		<Card.Root class="lg:col-span-2">
			<form onsubmit={save} novalidate>
				<Card.Header>
					<Card.Title>{t('profile.accountDetails')}</Card.Title>
					<Card.Description>{t('profile.accountDescription')}</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid gap-4 sm:grid-cols-2">
						<FormField label={t('common.name')} error={fieldError(errors, 'name')}>
							{#snippet children(control)}
								<Input
									{...control}
									bind:value={name}
									placeholder={t('profile.namePlaceholder')}
									autocomplete="name"
								/>
							{/snippet}
						</FormField>
						<FormField label={t('auth.email')} error={fieldError(errors, 'email')}>
							{#snippet children(control)}
								<Input
									{...control}
									type="email"
									bind:value={email}
									placeholder="you@example.com"
									autocomplete="email"
								/>
							{/snippet}
						</FormField>
					</div>

					<FormField label={t('profile.role')} description={t('profile.roleDescription')}>
						{#snippet children(control)}
							<Select.Root type="single" bind:value={role} disabled>
								<Select.Trigger {...control} class="w-full">
									{roleLabel(role as User['role'])}
								</Select.Trigger>
								<Select.Content>
									{#each Object.entries(USER_ROLES) as [value, presentation] (value)}
										<Select.Item {value} label={t(presentation.label)}>
											{t(presentation.label)}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</FormField>

					<FormField label={t('profile.bio')} error={fieldError(errors, 'bio')}>
						{#snippet children(control)}
							<Textarea
								{...control}
								bind:value={bio}
								rows={4}
								placeholder={t('profile.bioPlaceholder')}
							/>
						{/snippet}
					</FormField>
				</Card.Content>
				<Card.Footer class="justify-end gap-2">
					<Button type="submit">{t('users.saveChanges')}</Button>
				</Card.Footer>
			</form>
		</Card.Root>
	</div>
</PageContainer>
