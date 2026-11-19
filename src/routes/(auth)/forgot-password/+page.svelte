<!--
  Forgot-password page. Accepts an email and shows a neutral success state that
  never reveals whether the account exists. Purely mock — no email is sent.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import MailCheck from '@lucide/svelte/icons/mail-check';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import FormField from '#lib/core/components/shared/FormField.svelte';
	import Spinner from '#lib/core/components/shared/Spinner.svelte';
	import { emailSchema } from '#lib/core/utils/validators.ts';
	import { t } from '#lib/i18n/index.ts';
	import { pageTitle } from '#lib/utils/page-title.ts';

	let email = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let error = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;
		error = '';

		const result = emailSchema.safeParse(email);
		if (!result.success) {
			error = t(email.trim() ? 'auth.errors.emailInvalid' : 'auth.errors.emailRequired');
			return;
		}

		submitting = true;
		email = result.data;
		// Simulate a request round-trip for a realistic mock experience.
		await new Promise((resolve) => setTimeout(resolve, 600));
		submitting = false;
		submitted = true;
	}
</script>

<svelte:head>
	<title>{pageTitle(t('auth.resetPassword'))}</title>
</svelte:head>

<Card.Root class="shadow-sm">
	{#if submitted}
		<Card.Header class="items-center space-y-3 text-center">
			<div
				class="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
			>
				<MailCheck class="size-6" aria-hidden="true" />
			</div>
			<Card.Title class="text-xl">{t('auth.checkInbox')}</Card.Title>
			<Card.Description>
				{t('auth.resetSent', { email })}
			</Card.Description>
		</Card.Header>
		<Card.Footer class="justify-center">
			<Button href={resolve('login')} variant="outline" class="w-full">
				<ArrowLeft class="size-4" aria-hidden="true" />
				{t('auth.backToSignIn')}
			</Button>
		</Card.Footer>
	{:else}
		<Card.Header class="space-y-1 text-center">
			<Card.Title class="text-xl">{t('auth.forgotTitle')}</Card.Title>
			<Card.Description>{t('auth.resetDescription')}</Card.Description>
		</Card.Header>

		<Card.Content>
			<form class="space-y-4" onsubmit={handleSubmit} aria-busy={submitting} novalidate>
				<FormField label={t('auth.email')} {error}>
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

				<Button type="submit" class="w-full" disabled={submitting}>
					{#if submitting}
						<Spinner class="size-4 text-primary-foreground" />
						{t('auth.sending')}
					{:else}
						{t('auth.sendReset')}
					{/if}
				</Button>
			</form>
		</Card.Content>

		<Card.Footer class="justify-center">
			<a
				href={resolve('login')}
				class="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
			>
				<ArrowLeft class="size-4" aria-hidden="true" />
				{t('auth.backToSignIn')}
			</a>
		</Card.Footer>
	{/if}
</Card.Root>
