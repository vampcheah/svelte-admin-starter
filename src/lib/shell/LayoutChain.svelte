<!--
  Renders a resolved route as [outer layout, ...inner layouts, page], nesting
  each layout around the next via its `children` snippet — the same shape
  SvelteKit would build, but assembled by the keep-alive outlet so the page can
  stay mounted. `data` (SvelteKit's load result) is passed to every level;
  levels that don't declare it simply ignore it.
-->
<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		components: Component[];
		data: unknown;
	}

	let { components, data }: Props = $props();
</script>

{#snippet chain(comps: Component[])}
	{@const Head = comps[0] as Component<{ data: unknown; children?: import('svelte').Snippet }>}
	{#if Head}
		{#if comps.length > 1}
			<Head {data}>
				{@render chain(comps.slice(1))}
			</Head>
		{:else}
			<Head {data} />
		{/if}
	{/if}
{/snippet}

{@render chain(components)}
