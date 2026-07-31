<!--
  SearchInput — a text input with a leading search icon and a trailing clear
  (x) button that appears only when there is a value. `value` is bindable.
  Includes built-in debouncing to protect low-end CPUs from high-frequency reflows.
-->
<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';
	import { onDestroy } from 'svelte';

	interface Props {
		value?: string;
		placeholder?: string;
		class?: string;
		debounceMs?: number;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		class: className,
		debounceMs = 150
	}: Props = $props();

	let innerValue = $state(value);
	let timer: ReturnType<typeof setTimeout> | null = null;

	// Keep innerValue synced if outer value changes externally (e.g. reset/clear)
	$effect(() => {
		if (value !== innerValue) {
			innerValue = value;
		}
	});

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		innerValue = e.currentTarget.value;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			value = innerValue;
		}, debounceMs);
	}

	function clear() {
		innerValue = '';
		value = '';
		if (timer) clearTimeout(timer);
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<div class={cn('relative w-full', className)}>
	<Search
		class="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
		aria-hidden="true"
	/>
	<Input
		type="text"
		value={innerValue}
		oninput={handleInput}
		{placeholder}
		aria-label={placeholder}
		class="ps-8 pe-8"
	/>
	{#if innerValue}
		<button
			type="button"
			onclick={clear}
			aria-label="Clear search"
			class="absolute end-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<X class="size-3.5" aria-hidden="true" />
		</button>
	{/if}
</div>
