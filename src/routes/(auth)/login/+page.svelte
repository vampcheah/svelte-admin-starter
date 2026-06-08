<!--
  Login page. Validates with `loginSchema`, surfaces per-field errors via
  `fieldError`, and calls the mock `auth.login`. Includes a show/hide password
  toggle and a demo-credentials hint.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Spinner } from '$lib/components/shared';
	import { auth } from '$lib/auth';
	import { loginSchema, fieldError } from '$lib/utils/validators';

	let email = $state('admin@example.com');
	let password = $state('password');
	let showPassword = $state(false);
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
			goto('/dashboard');
		} else {
			formError = result.error ?? 'Unable to sign in. Please try again.';
			toast.error(formError);
		}
	}

	function fillDemo() {
		email = 'admin@example.com';
		password = 'password';
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
			<span class="font-mono">admin@example.com</span> / <span class="font-mono">password</span>
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
						href="/forgot-password"
						class="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
					>
						Forgot password?
					</a>
				</div>
				<div class="relative">
					<Input
						id="password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="current-password"
						placeholder="••••••••"
						class="pr-10"
						bind:value={password}
						aria-invalid={errors.password ? 'true' : undefined}
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<EyeOff class="size-4" aria-hidden="true" />
						{:else}
							<Eye class="size-4" aria-hidden="true" />
						{/if}
					</button>
				</div>
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
				href="/register"
				class="font-medium text-foreground underline-offset-4 hover:underline"
			>
				Sign up
			</a>
		</p>
	</Card.Footer>
</Card.Root>
