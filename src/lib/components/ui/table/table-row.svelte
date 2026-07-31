<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableRowElement>> = $props();
</script>

<tr
	bind:this={ref}
	data-slot="table-row"
	class={cn(
		'hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-amber-50 dark:hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-amber-950/60 data-[state=selected]:bg-amber-100/70 dark:data-[state=selected]:bg-amber-900/40 border-b transition-colors',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
