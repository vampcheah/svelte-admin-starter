<!--
  PasswordInput — a text/password input with a trailing toggle button
  that switches visibility between password dots and cleartext using Eye/EyeOff icons.
-->
<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import { Input } from '../ui/input';
	import { cn } from '../../utils.js';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = Omit<HTMLInputAttributes, 'type' | 'files'> & {
		ref?: HTMLInputElement | null;
		value?: string;
		showToggle?: boolean;
		showLabel?: string;
		hideLabel?: string;
	};

	let {
		ref = $bindable(null),
		value = $bindable(''),
		showToggle = true,
		showLabel = 'Show password',
		hideLabel = 'Hide password',
		class: className,
		disabled,
		...restProps
	}: Props = $props();

	let showPassword = $state(false);

	function toggleShowPassword() {
		showPassword = !showPassword;
	}
</script>

<div class={cn('relative w-full', className)}>
	<Input
		bind:ref
		type={showPassword ? 'text' : 'password'}
		bind:value
		{disabled}
		class="pe-10"
		{...restProps}
	/>
	{#if showToggle}
		<button
			type="button"
			onclick={toggleShowPassword}
			{disabled}
			aria-label={showPassword ? hideLabel : showLabel}
			aria-pressed={showPassword}
			class="absolute end-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-sm disabled:pointer-events-none disabled:opacity-50"
		>
			{#if showPassword}
				<EyeOff class="size-4" aria-hidden="true" />
			{:else}
				<Eye class="size-4" aria-hidden="true" />
			{/if}
		</button>
	{/if}
</div>
