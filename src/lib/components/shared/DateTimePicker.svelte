<script lang="ts">
	import CoreDateTimePicker from '#lib/core/components/shared/DateTimePicker.svelte';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof CoreDateTimePicker>;

	let { value = $bindable(''), open = $bindable(false), ...restProps }: Props = $props();
</script>

<CoreDateTimePicker bind:value bind:open {...restProps} />
