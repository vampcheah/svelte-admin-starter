<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Pathname } from '$app/types';
	import PortableTabBar from '$lib/core/shell/TabBar.svelte';
	import { i18n, t } from '$lib/i18n';
	import { tabs } from './tabs.svelte';

	const currentUrl = $derived(`${page.url.pathname}${page.url.search}`);

	function navigate(url: string): Promise<void> {
		const queryAt = url.indexOf('?');
		const pathname = (queryAt === -1 ? url : url.slice(0, queryAt)) as Pathname;
		const search = queryAt === -1 ? '' : url.slice(queryAt);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		return goto(`${resolve(pathname)}${search}`);
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
