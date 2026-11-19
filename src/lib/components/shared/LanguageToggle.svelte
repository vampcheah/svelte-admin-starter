<script lang="ts">
	import CoreLanguageToggle from '#lib/core/components/shared/LanguageToggle.svelte';
	import type { ComponentProps } from 'svelte';

	let props: ComponentProps<typeof CoreLanguageToggle> = $props();
</script>

<CoreLanguageToggle {...props} />
