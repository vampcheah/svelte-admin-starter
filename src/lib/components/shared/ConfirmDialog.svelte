<script lang="ts">
	import CoreConfirmDialog from '#lib/core/components/shared/ConfirmDialog.svelte';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof CoreConfirmDialog>;

	let { open = $bindable(false), ...restProps }: Props = $props();
</script>

<CoreConfirmDialog bind:open {...restProps} />
