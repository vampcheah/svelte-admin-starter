<!--
  General settings. An organization form (name, support email, timezone, UI
  language) plus a read-only account section sourced from the mock auth user.
  All mutations operate on local $state — there is no backend.
-->
<script lang="ts">
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import * as Select from '#lib/core/components/ui/select/index.ts';
	import * as Avatar from '#lib/core/components/ui/avatar/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import FormField from '#lib/core/components/shared/FormField.svelte';
	import LanguageSelect from '#lib/features/settings/LanguageSelect.svelte';
	import { Badge } from '#lib/core/components/ui/badge/index.ts';
	import { Separator } from '#lib/core/components/ui/separator/index.ts';
	import { toast } from 'svelte-sonner';
	import { auth } from '#lib/auth/index.ts';
	import { logoutDialog } from '#lib/shell/index.ts';
	import { t } from '#lib/i18n/index.ts';
	import { roleLabel } from '#lib/features/users/presentation.ts';
	import { initials } from '#lib/i18n/formatters.ts';
	import Save from '@lucide/svelte/icons/save';

	// A small, static list of common timezones for the mock Select.
	const timezones = [
		{ value: 'UTC', label: 'UTC' },
		{ value: 'America/New_York', label: 'New York (UTC-05:00)' },
		{ value: 'America/Los_Angeles', label: 'Los Angeles (UTC-08:00)' },
		{ value: 'Europe/London', label: 'London (UTC+00:00)' },
		{ value: 'Europe/Berlin', label: 'Berlin (UTC+01:00)' },
		{ value: 'Asia/Shanghai', label: 'Shanghai (UTC+08:00)' },
		{ value: 'Asia/Tokyo', label: 'Tokyo (UTC+09:00)' }
	];

	// Local form state — seeded with sensible mock defaults.
	let orgName = $state('Acme Inc.');
	let supportEmail = $state('support@acme.example');
	let timezone = $state('UTC');

	const timezoneLabel = $derived(
		timezones.find((tz) => tz.value === timezone)?.label ?? t('settingsForm.selectTimezone')
	);

	const user = $derived(auth.user);

	function saveGeneral(event: SubmitEvent): void {
		event.preventDefault();
		// No backend — just confirm the (local) change.
		toast.success(t('settingsForm.saved'), {
			description: t('settingsForm.savedDescription')
		});
	}
</script>

<form onsubmit={saveGeneral} class="space-y-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>{t('settingsForm.organization')}</Card.Title>
			<Card.Description>
				{t('settingsForm.organizationDescription')}
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-5">
			<FormField label={t('settingsForm.organizationName')}>
				{#snippet children(control)}
					<Input {...control} bind:value={orgName} placeholder="Acme Inc." />
				{/snippet}
			</FormField>
			<FormField label={t('settingsForm.supportEmail')} description={t('settingsForm.supportHint')}>
				{#snippet children(control)}
					<Input
						{...control}
						type="email"
						bind:value={supportEmail}
						placeholder="support@example.com"
					/>
				{/snippet}
			</FormField>
			<div class="grid gap-5 sm:grid-cols-2">
				<FormField label={t('settingsForm.timezone')}>
					{#snippet children(control)}
						<Select.Root type="single" bind:value={timezone}>
							<Select.Trigger {...control} class="w-full">{timezoneLabel}</Select.Trigger>
							<Select.Content>
								{#each timezones as tz (tz.value)}
									<Select.Item value={tz.value} label={tz.label}>{tz.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</FormField>
				<LanguageSelect />
			</div>
		</Card.Content>
		<Card.Footer class="justify-end border-t">
			<Button type="submit">
				<Save class="size-4" />
				{t('settingsForm.save')}
			</Button>
		</Card.Footer>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>{t('common.account')}</Card.Title>
			<Card.Description>{t('settingsForm.accountDescription')}</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-4">
					<Avatar.Root class="size-12">
						{#if user?.avatarUrl}
							<Avatar.Image src={user.avatarUrl} alt={user.name} />
						{/if}
						<Avatar.Fallback>
							{user ? initials(user.name) : '?'}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<p class="truncate font-medium">{user?.name ?? t('common.guest')}</p>
							{#if user}
								<Badge variant="secondary" class="capitalize">{roleLabel(user.role)}</Badge>
							{/if}
						</div>
						<p class="text-muted-foreground truncate text-sm">
							{user?.email ?? t('settingsForm.notSignedIn')}
						</p>
					</div>
				</div>
				<Button
					type="button"
					variant="outline"
					class="text-destructive hover:text-destructive"
					onclick={() => (logoutDialog.open = true)}
				>
					{t('common.logout')}
				</Button>
			</div>
			<Separator class="my-4" />
			<p class="text-muted-foreground text-xs">
				{t('settingsForm.demoAccount')}
			</p>
		</Card.Content>
	</Card.Root>
</form>
