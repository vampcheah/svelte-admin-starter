<!-- Fixed viewport height + internal scroll layout for admin applications. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Sidebar from '../components/ui/sidebar';

	interface Props {
		sidebar: Snippet;
		header: Snippet;
		tabBar?: Snippet;
		outlet: Snippet;
	}

	let { sidebar, header, tabBar, outlet }: Props = $props();
</script>

<Sidebar.Provider>
	{@render sidebar()}
	<Sidebar.Inset class="h-svh overflow-hidden">
		{@render header()}
		{@render tabBar?.()}
		{@render outlet()}
	</Sidebar.Inset>
</Sidebar.Provider>
