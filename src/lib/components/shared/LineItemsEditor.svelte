<!-- Compatibility entry point. Invoice-specific behavior lives in features/sales. -->
<script lang="ts" module>
	export type { EditableLine, ServiceItem } from '#lib/features/sales/line-items.ts';
	export { nextLineItemId } from '#lib/features/sales/line-items.ts';
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import LineItemsEditor from '#lib/features/sales/LineItemsEditor.svelte';
	let { items = $bindable([]), ...props }: ComponentProps<typeof LineItemsEditor> = $props();
</script>

<LineItemsEditor bind:items {...props} />
