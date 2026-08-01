<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import PasswordInput from '../../shared/PasswordInput.svelte';

	type Props = ComponentProps<typeof PasswordInput>;
	let { ref = $bindable(null), value = $bindable(''), ...props }: Props = $props();
</script>

<PasswordInput bind:ref bind:value {...props} />
