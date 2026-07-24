<!--
  Renders a resolved route as [outer layout, ...inner layouts, page], nesting
  each layout around the next via its `children` snippet — the same shape
  SvelteKit would build, but assembled by the keep-alive outlet so the page can
  stay mounted. `data` (SvelteKit's load result) is passed to every level;
  levels that don't declare it simply ignore it.
-->
<script lang="ts">
	import { setContext, type Component } from 'svelte';
	import { TAB_ACTIVITY, type TabActivity } from './tab-activity';

	interface Props {
		components: Component[];
		data: unknown;
		active: boolean;
	}

	let { components, data, active }: Props = $props();

	setContext<TabActivity>(TAB_ACTIVITY, {
		get active() {
			return active;
		}
	});
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
