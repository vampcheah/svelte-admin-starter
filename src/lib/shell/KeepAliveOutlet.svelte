<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import PortableKeepAliveOutlet from '$lib/core/shell/KeepAliveOutlet.svelte';
	import { t } from '$lib/i18n';
	import { tabs } from './tabs.svelte';
	import { invalidateRoute, loadRoute } from './route-registry';

	let { children }: { children: Snippet } = $props();
	const currentUrl = $derived(`${page.url.pathname}${page.url.search}`);
</script>

<PortableKeepAliveOutlet
	{children}
	{tabs}
	{currentUrl}
	currentData={page.data}
	routeError={page.error}
	translate={t}
	{loadRoute}
	{invalidateRoute}
/>
