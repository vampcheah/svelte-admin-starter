<!--
  CommandMenu — a ⌘K / Ctrl+K command palette. Lists every navigation route
  (grouped, from `#lib/shell/nav.ts`) and navigates on select.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import CoreCommandMenu from '#lib/core/components/shared/CommandMenu.svelte';
	import { navGroups } from '#lib/shell/nav.ts';
	import { navGroupLabel, navTitle } from '#lib/shell/labels.ts';
	import { resolveAppUrl, type AppPathname } from '#lib/shell/paths.ts';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	function handleSelect(href: string) {
		// The shared boundary calls $app/paths.resolve and preserves app-relative URLs.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(resolveAppUrl(href as AppPathname));
	}
</script>

<CoreCommandMenu
	bind:open
	groups={navGroups}
	groupLabel={navGroupLabel}
	itemTitle={navTitle}
	onSelect={handleSelect}
/>
