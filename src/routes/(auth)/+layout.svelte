<!--
  Auth layout — a centered, card-friendly canvas on a subtle muted backdrop.
  Shows the brand mark and a corner theme/language toggle. Already-authenticated
  visitors are bounced to the dashboard.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth';
	import { ThemeToggle, LanguageToggle } from '$lib/components/shared';

	let { children } = $props();

	onMount(() => {
		auth.init();
		if (auth.isAuthenticated) goto('/dashboard');
	});
</script>

<div class="relative flex min-h-svh flex-col bg-muted/40">
	<!-- Decorative top glow — pure design tokens, dark-mode safe. -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 to-transparent"
		aria-hidden="true"
	></div>

	<!-- Corner controls -->
	<div class="absolute right-4 top-4 z-10 flex items-center gap-1">
		<LanguageToggle />
		<ThemeToggle />
	</div>

	<main class="relative flex flex-1 items-center justify-center p-4 sm:p-6">
		<div class="w-full max-w-sm space-y-6">
			<!-- Brand mark -->
			<a href="/" class="flex items-center justify-center gap-2">
				<div
					class="flex size-8 items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground shadow-sm"
				>
					A
				</div>
				<span class="text-lg font-semibold tracking-tight">Admin Starter</span>
			</a>

			{@render children()}
		</div>
	</main>

	<footer class="relative pb-6 text-center text-xs text-muted-foreground">
		A SvelteKit admin starter template.
	</footer>
</div>
