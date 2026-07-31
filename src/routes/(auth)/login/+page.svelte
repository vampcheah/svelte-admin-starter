<!--
  Login page. Validates with `loginSchema`, surfaces per-field errors via
  `fieldError`, and calls the mock `auth.login`. Includes a show/hide password
  toggle and a demo-credentials hint.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { PasswordInput, Spinner } from '$lib/components/shared';
	import { auth } from '$lib/auth';
	import { loginSchema, fieldError } from '$lib/utils/validators';
	import { config } from '$lib/config';

	let email = $state(config.auth.demo.email);
	let password = $state(config.auth.demo.password);
	let submitting = $state(false);

	// Field errors are only shown after a submit attempt to avoid nagging.
	let errors = $state<{ email?: string; password?: string }>({});
	let formError = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		formError = '';

		const parsed = loginSchema.safeParse({ email, password });
		if (!parsed.success) {
			errors = {
				email: fieldError(parsed.error, 'email'),
				password: fieldError(parsed.error, 'password')
			};
			return;
		}
		errors = {};

		submitting = true;
		const result = await auth.login(parsed.data.email, parsed.data.password);
		submitting = false;

		if (result.ok) {
			toast.success('Welcome back!');
			goto(resolve('/dashboard'));
		} else {
			formError = result.error ?? 'Unable to sign in. Please try again.';
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
	<title>Sign in · Admin Starter</title>
</svelte:head>

<Card.Root class="shadow-sm">
	<Card.Header class="space-y-1 text-center">
		<Card.Title class="text-xl">Welcome back</Card.Title>
		<Card.Description>Sign in to your account to continue</Card.Description>
	</Card.Header>

	<Card.Content>
		<!-- Demo credentials hint -->
		<button
			type="button"
			onclick={fillDemo}
			class="mb-5 w-full rounded-lg border border-dashed border-border bg-muted/50 px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted"
		>
			<span class="font-medium text-foreground">Demo credentials</span> — click to autofill:
			<span class="font-mono">{config.auth.demo.email}</span> /
			<span class="font-mono">{config.auth.demo.password}</span>
		</button>

		<form class="space-y-4" onsubmit={handleSubmit} novalidate>
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					autocomplete="email"
					placeholder="you@example.com"
					bind:value={email}
					aria-invalid={errors.email ? 'true' : undefined}
				/>
				{#if errors.email}
					<p class="text-xs text-red-500">{errors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label for="password">Password</Label>
					<a
						href={resolve('/forgot-password')}
						class="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
					>
						Forgot password?
					</a>
				</div>
				<PasswordInput
					id="password"
					autocomplete="current-password"
					placeholder="••••••••"
					bind:value={password}
					aria-invalid={errors.password ? 'true' : undefined}
				/>
				{#if errors.password}
					<p class="text-xs text-red-500">{errors.password}</p>
				{/if}
			</div>

			{#if formError}
				<p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-red-500">{formError}</p>
			{/if}

			<Button type="submit" class="w-full" disabled={submitting}>
				{#if submitting}
					<Spinner class="size-4 text-primary-foreground" />
					Signing in…
				{:else}
					Sign in
				{/if}
			</Button>
		</form>
	</Card.Content>

	<Card.Footer class="justify-center">
		<p class="text-sm text-muted-foreground">
			Don't have an account?
			<a
				href={resolve('/register')}
				class="font-medium text-foreground underline-offset-4 hover:underline"
			>
				Sign up
			</a>
		</p>
	</Card.Footer>
</Card.Root>
