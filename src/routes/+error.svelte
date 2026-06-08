<!--
  Branded error boundary. Renders a friendly message for any uncaught
  load/render error (404, 500, …) using the reactive `page` from $app/state.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';

	// Map a few common statuses to friendlier copy; fall back to the raw message.
	const headline = $derived(
		page.status === 404
			? 'Page not found'
			: page.status >= 500
				? 'Something went wrong'
				: 'Unexpected error'
	);

	const description = $derived(
		page.status === 404
			? "The page you're looking for doesn't exist or may have been moved."
			: (page.error?.message ?? 'An unexpected error occurred. Please try again.')
	);
</script>

<svelte:head>
	<title>{page.status} · Admin Starter</title>
</svelte:head>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
	<div class="flex items-center gap-2">
		<div
			class="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
		>
			A
		</div>
		<span class="text-sm font-semibold tracking-tight">Admin Starter</span>
	</div>

	<p class="text-7xl font-bold tracking-tighter text-primary sm:text-8xl">
		{page.status}
	</p>

	<div class="space-y-2">
		<h1 class="text-2xl font-semibold tracking-tight">{headline}</h1>
		<p class="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
	</div>

	<Button href="/dashboard" class="mt-2">Back to dashboard</Button>
</div>
