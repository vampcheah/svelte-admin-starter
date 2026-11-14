<!-- Breadcrumb trail derived from the current path + nav model. -->
<script lang="ts">
	import PortableBreadcrumbs from '$lib/core/shell/Breadcrumbs.svelte';
	import { buildBreadcrumbTrail } from '$lib/core/shell/nav';
	import { page } from '$app/state';
	import { navGroups } from './nav';
	import { navGroupLabel, navTitle, routeLabelFor, translatedLabel } from './labels';
	import { resolveAppUrl, toAppPathname } from './paths';
	import { config } from '$lib/config';

	const crumbs = $derived.by(() => {
		const pathname = toAppPathname(page.url.pathname);
		return buildBreadcrumbTrail({
			pathname,
			groups: navGroups,
			home: { label: translatedLabel('nav.home', 'Home'), href: config.app.homePath },
			groupLabel: navGroupLabel,
			itemTitle: navTitle,
			leafLabel: routeLabelFor(pathname, page.data)
		});
	});
</script>

<PortableBreadcrumbs {crumbs} resolveHref={resolveAppUrl} />
