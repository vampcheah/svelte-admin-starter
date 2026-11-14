<script lang="ts">
	import CoreDatePicker from '$lib/core/components/shared/DatePicker.svelte';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof CoreDatePicker>;

	let { value = $bindable(''), open = $bindable(false), ...restProps }: Props = $props();
</script>

<CoreDatePicker bind:value bind:open {...restProps} />
