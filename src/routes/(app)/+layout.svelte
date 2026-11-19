<!--
  (app) route-group layout — mock auth guard + admin shell.
  Restores the mock session on the client; redirects to /login when not
  authenticated. The AppShell's keep-alive outlet renders the pages itself (it
  reads the current route from `page`); `children` is forwarded only so a load
  error (+error.svelte) can still render in-shell.
-->
<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveAppUrl } from '#lib/shell/paths.ts';
	import { auth } from '#lib/auth/index.ts';
	import AppShell from '#lib/shell/AppShell.svelte';
	import { logoutDialog } from '#lib/shell/logout-dialog.svelte.ts';
	import { leafCrumb } from '#lib/shell/breadcrumb.svelte.ts';
	import { tabs } from '#lib/shell/tabs.svelte.ts';
	import ConfirmDialog from '#lib/components/shared/ConfirmDialog.svelte';
	import ConfirmHost from '#lib/components/shared/ConfirmHost.svelte';
	import { config } from '#lib/config/index.ts';
	import { t } from '#lib/i18n/index.ts';
	import { USERS_STATE, createUsersState } from '#lib/features/users/state.svelte.ts';
	import {
		NOTIFICATIONS_STATE,
		createNotificationsState
	} from '#lib/stores/notifications.svelte.ts';

	let { children } = $props();
	let ready = $state(false);
	setContext(USERS_STATE, createUsersState());
	setContext(NOTIFICATIONS_STATE, createNotificationsState());

	onMount(() => {
		leafCrumb.clear();
		tabs.refreshTitles();
		auth.init();
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolveAppUrl resolves through $app/paths boundary.
		if (!auth.isAuthenticated) goto(resolveAppUrl(config.auth.afterLogout));
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
	<ConfirmHost />
{:else}
	<div
		class="bg-background text-foreground flex min-h-svh"
		role="status"
		aria-label={t('common.loading')}
	>
		<div aria-hidden="true" class="bg-sidebar hidden w-64 shrink-0 space-y-6 border-r p-5 md:block">
			<div class="bg-muted h-9 w-36 animate-pulse rounded-md motion-reduce:animate-none"></div>
			<div class="space-y-3">
				{#each Array(7) as _, index (index)}
					<div class="bg-muted h-8 animate-pulse rounded-md motion-reduce:animate-none"></div>
				{/each}
			</div>
		</div>
		<div aria-hidden="true" class="min-w-0 flex-1">
			<div class="flex h-14 items-center border-b px-6">
				<div class="bg-muted h-5 w-44 animate-pulse rounded-md motion-reduce:animate-none"></div>
			</div>
			<div class="space-y-6 p-6">
				<div class="bg-muted h-8 w-56 animate-pulse rounded-md motion-reduce:animate-none"></div>
				<div class="grid gap-4 sm:grid-cols-3">
					{#each Array(3) as _, index (index)}
						<div class="bg-muted h-28 animate-pulse rounded-lg motion-reduce:animate-none"></div>
					{/each}
				</div>
				<div class="bg-muted h-64 animate-pulse rounded-lg motion-reduce:animate-none"></div>
			</div>
		</div>
		<span class="sr-only">{t('common.loading')}</span>
	</div>
{/if}
