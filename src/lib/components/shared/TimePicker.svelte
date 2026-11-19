<script lang="ts">
	import CoreTimePicker from '#lib/core/components/shared/TimePicker.svelte';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof CoreTimePicker>;

	let { value = $bindable(''), open = $bindable(false), ...restProps }: Props = $props();
</script>

<CoreTimePicker bind:value bind:open {...restProps} />
