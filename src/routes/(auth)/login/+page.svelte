<!--
  Login page. Validates with `loginSchema`, surfaces per-field errors via
  `fieldError`, and calls the mock `auth.login`. Includes a show/hide password
  toggle and a demo-credentials hint.
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
	import { loginSchema, fieldError } from '#lib/core/utils/validators.ts';
	import { config } from '#lib/config/index.ts';
	import { t } from '#lib/i18n/index.ts';
	import { pageTitle } from '#lib/utils/page-title.ts';

	let email = $state(config.auth.demo.email);
	let password = $state(config.auth.demo.password);

	// Field errors are only shown after a submit attempt to avoid nagging.
	let errors = $state<{ email?: string; password?: string }>({});
	let formError = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (auth.loading) return;
		formError = '';

		const parsed = loginSchema.safeParse({ email, password });
		if (!parsed.success) {
			errors = {
				email: fieldError(parsed.error, 'email')
					? t(email.trim() ? 'auth.errors.emailInvalid' : 'auth.errors.emailRequired')
					: undefined,
				password: fieldError(parsed.error, 'password')
					? t('auth.errors.passwordRequired')
					: undefined
			};
			return;
		}
		errors = {};

		const result = await auth.login(parsed.data.email, parsed.data.password);

		if (result.ok) {
			toast.success(t('auth.signedIn'));
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolveAppUrl resolves through $app/paths boundary.
			void goto(resolveAppUrl(config.app.homePath));
		} else {
			formError = result.error;
			toast.error(formError);
		}
	}

	function fillDemo() {
		email = config.auth.demo.email;
		password = config.auth.demo.password;
		errors = {};
		formError = '';
	}
</script>

<svelte:head>
	<title>{pageTitle(t('auth.signIn'))}</title>
</svelte:head>

<Card.Root class="shadow-sm">
	<Card.Header class="space-y-1 text-center">
		<Card.Title class="text-xl">{t('auth.welcomeBack')}</Card.Title>
		<Card.Description>{t('auth.signInDescription')}</Card.Description>
	</Card.Header>

	<Card.Content>
		<!-- Demo credentials hint -->
		<button
			type="button"
			onclick={fillDemo}
			disabled={auth.loading}
			class="mb-5 w-full rounded-lg border border-dashed border-border bg-muted/50 px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted"
		>
			<span class="font-medium text-foreground">{t('auth.demoCredentials')}</span> — {t(
				'auth.autofillHint'
			)}
			<span class="font-mono">{config.auth.demo.email}</span> /
			<span class="font-mono">{config.auth.demo.password}</span>
		</button>

		<form class="space-y-4" onsubmit={handleSubmit} aria-busy={auth.loading} novalidate>
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
				{#snippet labelAction()}
					<a
						href={resolve('forgot-password')}
						class="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
					>
						{t('auth.forgotPassword')}
					</a>
				{/snippet}
				{#snippet children(control)}
					<PasswordInput
						{...control}
						autocomplete="current-password"
						placeholder="••••••••"
						bind:value={password}
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
					{t('auth.signingIn')}
				{:else}
					{t('auth.signIn')}
				{/if}
			</Button>
		</form>
	</Card.Content>

	<Card.Footer class="justify-center">
		<p class="text-sm text-muted-foreground">
			{t('auth.noAccount')}
			<a
				href={resolve('register')}
				class="font-medium text-foreground underline-offset-4 hover:underline"
			>
				{t('auth.signUp')}
			</a>
		</p>
	</Card.Footer>
</Card.Root>
