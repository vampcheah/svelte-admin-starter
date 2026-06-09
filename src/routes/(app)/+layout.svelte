<!--
  (app) route-group layout — mock auth guard + admin shell.
  Restores the mock session on the client; redirects to /login when not
  authenticated, otherwise renders the children inside the AppShell.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth';
	import { AppShell } from '$lib/shell';
	import { config } from '$lib/config';

	let { children } = $props();
	let ready = $state(false);

	onMount(() => {
		auth.init();
		if (!auth.isAuthenticated) goto(resolve(config.auth.afterLogout));
		else ready = true;
	});
</script>

{#if ready}
	<AppShell>{@render children()}</AppShell>
{/if}
