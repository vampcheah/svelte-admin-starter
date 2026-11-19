<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import PortableTabBar from '#lib/core/shell/TabBar.svelte';
	import { i18n, translate as t } from '#lib/i18n/index.ts';
	import { tabs } from './tabs.svelte';
	import { resolveAppUrl, toAppUrl } from './paths';

	const currentUrl = $derived(toAppUrl(page.url));

	function navigate(url: string): Promise<void> {
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolves stored path and query through $app/paths.
		return goto(resolveAppUrl(url));
	}
</script>

<PortableTabBar
	{tabs}
	{currentUrl}
	locale={i18n.locale}
	{t}
	onNavigate={navigate}
	invalidate={invalidateAll}
/>
