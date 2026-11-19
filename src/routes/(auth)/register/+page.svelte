<!--
  Register page. Collects name/email/password/confirm with light client-side
  validation, then calls the mock `auth.register` and routes to the dashboard.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { resolveAppUrl } from '#lib/shell/paths.ts';
	import { toast } from 'svelte-sonner';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import FormField from '#lib/core/components/shared/FormField.svelte';
	import PasswordInput from '#lib/core/components/shared/PasswordInput.svelte';
	import Spinner from '#lib/core/components/shared/Spinner.svelte';
	import { auth } from '#lib/auth/index.ts';
	import { emailSchema } from '#lib/core/utils/validators.ts';
	import { config } from '#lib/config/index.ts';
	import { t } from '#lib/i18n/index.ts';
	import { pageTitle } from '#lib/utils/page-title.ts';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirm = $state('');

	let errors = $state<{ name?: string; email?: string; password?: string; confirm?: string }>({});
	let formError = $state('');

	function validate(): { name: string; email: string; password: string } | undefined {
		const next: typeof errors = {};
		if (!name.trim()) next.name = t('auth.errors.nameRequired');

		const emailResult = emailSchema.safeParse(email);
		if (!emailResult.success) {
			next.email = t(email.trim() ? 'auth.errors.emailInvalid' : 'auth.errors.emailRequired');
		}

		if (password.length < config.auth.minPasswordLength) {
			next.password = t('auth.errors.passwordTooShort', { min: config.auth.minPasswordLength });
		}
		if (confirm !== password) next.confirm = t('auth.errors.passwordMismatch');

		errors = next;
		if (Object.keys(next).length > 0 || !emailResult.success) return;
		return { name: name.trim(), email: emailResult.data, password };
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (auth.loading) return;
		formError = '';
		const parsed = validate();
		if (!parsed) return;

		const result = await auth.register(parsed.name, parsed.email, parsed.password);

		if (result.ok) {
			toast.success(t('auth.registered'));
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolveAppUrl resolves through $app/paths boundary.
			void goto(resolveAppUrl(config.app.homePath));
		} else {
			formError = result.error;
			toast.error(formError);
		}
	}
</script>

<svelte:head>
	<title>{pageTitle(t('auth.createAccount'))}</title>
</svelte:head>

<Card.Root class="shadow-sm">
	<Card.Header class="space-y-1 text-center">
		<Card.Title class="text-xl">{t('auth.createYourAccount')}</Card.Title>
		<Card.Description>{t('auth.getStarted')}</Card.Description>
	</Card.Header>

	<Card.Content>
		<form class="space-y-4" onsubmit={handleSubmit} aria-busy={auth.loading} novalidate>
			<FormField label={t('auth.fullName')} error={errors.name}>
				{#snippet children(control)}
					<Input
						{...control}
						type="text"
						autocomplete="name"
						placeholder={t('auth.namePlaceholder')}
						bind:value={name}
					/>
				{/snippet}
			</FormField>

			<FormField label={t('auth.email')} error={errors.email}>
				{#snippet children(control)}
					<Input
						{...control}
						type="email"
						autocomplete="email"
						placeholder="you@example.com"
						bind:value={email}
					/>
				{/snippet}
			</FormField>

			<FormField label={t('auth.password')} error={errors.password}>
				{#snippet children(control)}
					<PasswordInput
						{...control}
						autocomplete="new-password"
						placeholder={t('auth.passwordPlaceholder', { min: config.auth.minPasswordLength })}
						bind:value={password}
						showLabel={t('auth.showPassword')}
						hideLabel={t('auth.hidePassword')}
					/>
				{/snippet}
			</FormField>

			<FormField label={t('auth.confirmPassword')} error={errors.confirm}>
				{#snippet children(control)}
					<PasswordInput
						{...control}
						autocomplete="new-password"
						placeholder={t('auth.confirmPlaceholder')}
						bind:value={confirm}
						showLabel={t('auth.showPassword')}
						hideLabel={t('auth.hidePassword')}
					/>
				{/snippet}
			</FormField>

			{#if formError}
				<p role="alert" class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
					{formError}
				</p>
			{/if}

			<Button type="submit" class="w-full" disabled={auth.loading}>
				{#if auth.loading}
					<Spinner class="size-4 text-primary-foreground" />
					{t('auth.creatingAccount')}
				{:else}
					{t('auth.createAccount')}
				{/if}
			</Button>
		</form>
	</Card.Content>

	<Card.Footer class="justify-center">
		<p class="text-sm text-muted-foreground">
			{t('auth.haveAccount')}
			<a
				href={resolve('login')}
				class="font-medium text-foreground underline-offset-4 hover:underline"
			>
				{t('auth.signIn')}
			</a>
		</p>
	</Card.Footer>
</Card.Root>
