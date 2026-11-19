<!-- Compatibility entry point. Customer creation belongs to the clients feature. -->
<script lang="ts" module>
	export type { Client } from '#lib/features/clients/QuickCreateClient.svelte';
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import QuickCreateClient from '#lib/features/clients/QuickCreateClient.svelte';
	let props: ComponentProps<typeof QuickCreateClient> = $props();
</script>

<QuickCreateClient {...props} />
