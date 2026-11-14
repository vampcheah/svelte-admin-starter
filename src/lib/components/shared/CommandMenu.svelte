<!--
  CommandMenu — a ⌘K / Ctrl+K command palette. Lists every navigation route
  (grouped, from `$lib/shell/nav`) and navigates on select.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Pathname } from '$app/types';
	import CoreCommandMenu from '$lib/core/components/shared/CommandMenu.svelte';
	import { navGroups } from '$lib/shell/nav';
	import { navGroupLabel, navTitle } from '$lib/shell/labels';
	import { resolveAppUrl } from '$lib/shell/paths';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	function handleSelect(href: string) {
		// The shared boundary calls $app/paths.resolve and preserves app-relative URLs.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(resolveAppUrl(href as Pathname));
	}
</script>

<CoreCommandMenu
	bind:open
	groups={navGroups}
	groupLabel={(group) => navGroupLabel(group as Parameters<typeof navGroupLabel>[0])}
	itemTitle={(item) => navTitle(item as Parameters<typeof navTitle>[0])}
	onSelect={handleSelect}
/>
