<script lang="ts">
	import CorePickerTrigger from '$lib/core/components/shared/PickerTrigger.svelte';
	import type { ComponentProps } from 'svelte';

	let props: ComponentProps<typeof CorePickerTrigger> = $props();
</script>

<CorePickerTrigger {...props} />
