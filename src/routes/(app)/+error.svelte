<!--
  In-app error boundary — renders inside the admin shell so the sidebar, header
  and navigation stay available when a route under (app) throws. Status-aware
  copy with recovery actions.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { resolveAppUrl } from '#lib/shell/paths.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import House from '@lucide/svelte/icons/house';
	import { config } from '#lib/config/index.ts';
	import { t } from '#lib/i18n/index.ts';
	import { pageTitle } from '#lib/utils/page-title.ts';

	const headline = $derived(
		page.status === 404
			? t('error.notFoundTitle')
			: page.status >= 500
				? t('error.serverTitle')
				: t('error.unexpectedTitle')
	);

	const description = $derived(
		page.status === 404
			? t('error.notFoundDescriptionApp')
			: (page.error?.message ?? t('error.unexpectedDescriptionApp'))
	);

	function reload() {
		if (typeof location !== 'undefined') location.reload();
	}
</script>

<svelte:head>
	<title>{pageTitle(page.status)}</title>
</svelte:head>

<PageContainer>
	<div class="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
		<div
			class="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-2xl"
		>
			<TriangleAlert class="size-7" aria-hidden="true" />
		</div>

		<div class="space-y-1.5">
			<p class="text-muted-foreground text-sm font-medium tabular-nums">
				{t('error.status', { status: page.status })}
			</p>
			<h1 class="text-2xl font-semibold tracking-tight">{headline}</h1>
			<p class="text-muted-foreground mx-auto max-w-md text-sm">{description}</p>
		</div>

		<div class="flex flex-wrap items-center justify-center gap-2">
			<Button onclick={reload}>
				<RotateCcw class="size-4" aria-hidden="true" />
				{t('common.retry')}
			</Button>
			<Button href={resolveAppUrl(config.app.homePath)} variant="outline">
				<House class="size-4" aria-hidden="true" />
				{t('error.backHome')}
			</Button>
		</div>
	</div>
</PageContainer>
