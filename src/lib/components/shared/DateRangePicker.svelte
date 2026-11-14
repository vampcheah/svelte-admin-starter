<script lang="ts">
	import CoreDateRangePicker from '$lib/core/components/shared/DateRangePicker.svelte';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof CoreDateRangePicker>;

	let { value = $bindable(undefined), open = $bindable(false), ...restProps }: Props = $props();
</script>

<CoreDateRangePicker bind:value bind:open {...restProps} />
