<!--
  (app) route-group layout — mock auth guard + admin shell.
  Restores the mock session on the client; redirects to /login when not
  authenticated. The AppShell's keep-alive outlet renders the pages itself (it
  reads the current route from `page`); `children` is forwarded only so a load
  error (+error.svelte) can still render in-shell.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth';
	import { AppShell, logoutDialog } from '$lib/shell';
	import { ConfirmDialog } from '$lib/components/shared';
	import { config } from '$lib/config';
	import { t } from '$lib/i18n';

	let { children } = $props();
	let ready = $state(false);

	onMount(() => {
		auth.init();
		if (!auth.isAuthenticated) goto(resolve(config.auth.afterLogout));
		else ready = true;
	});
</script>

{#if ready}
	<AppShell {children} />
	<ConfirmDialog
		bind:open={logoutDialog.open}
		title={t('common.logoutConfirmTitle')}
		description={t('common.logoutConfirmDescription')}
		confirmText={t('common.logout')}
		cancelText={t('common.cancel')}
		variant="destructive"
		onConfirm={() => auth.logout()}
	/>
{/if}
