<!--
  Appearance settings. A segmented theme-mode control (Light / Dark / System)
  backed by mode-watcher, a live preview swatch, a language switch, and an
  interface density toggle persisted via the reusable `persisted` store.
-->
<script lang="ts">
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Label } from '#lib/core/components/ui/label/index.ts';
	import { Switch } from '#lib/core/components/ui/switch/index.ts';
	import { setMode, mode, userPrefersMode } from 'mode-watcher';
	import { setLocale, LOCALES, i18n, t } from '#lib/i18n/index.ts';
	import { persisted } from '#lib/core/stores/persisted.svelte.ts';
	import { cn } from '#lib/core/utils.ts';
	import { toast } from 'svelte-sonner';
	import type { Component } from 'svelte';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Check from '@lucide/svelte/icons/check';

	type ThemeMode = 'light' | 'dark' | 'system';
	const densityId = $props.id();

	interface ModeOption {
		value: ThemeMode;
		label: string;
		icon: Component;
	}

	const modeOptions = $derived<ModeOption[]>([
		{ value: 'light', label: t('appearance.light'), icon: Sun },
		{ value: 'dark', label: t('appearance.dark'), icon: Moon },
		{ value: 'system', label: t('appearance.system'), icon: Monitor }
	]);

	function handleModeKeydown(event: KeyboardEvent, value: ThemeMode): void {
		const index = modeOptions.findIndex((option) => option.value === value);
		let nextIndex: number;
		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				nextIndex = (index + 1) % modeOptions.length;
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				nextIndex = (index + modeOptions.length - 1) % modeOptions.length;
				break;
			case 'Home':
				nextIndex = 0;
				break;
			case 'End':
				nextIndex = modeOptions.length - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		setMode(modeOptions[nextIndex].value);
		const button = event.currentTarget as HTMLButtonElement;
		button.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
	}

	// Resolved appearance used to drive the live preview swatch.
	const resolved = $derived(mode.current ?? 'light');

	// Interface density, persisted so it survives reloads in the demo.
	const compact = persisted<boolean>('admin-starter:density-compact', false);

	function onDensityChange(next: boolean): void {
		compact.current = next;
		toast.success(t('appearance.densitySaved'));
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{t('common.theme')}</Card.Title>
		<Card.Description>
			{t('appearance.themeDescription')}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Segmented mode control. -->
		<div
			role="radiogroup"
			aria-label={t('appearance.themeMode')}
			class="bg-muted grid grid-cols-3 gap-1 rounded-lg p-1"
		>
			{#each modeOptions as option (option.value)}
				{@const active = userPrefersMode.current === option.value}
				<button
					type="button"
					role="radio"
					aria-checked={active}
					tabindex={active ? 0 : -1}
					onclick={() => setMode(option.value)}
					onkeydown={(event) => handleModeKeydown(event, option.value)}
					class={cn(
						'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
						'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
						active
							? 'bg-primary text-primary-foreground shadow-sm dark:text-background'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					<option.icon class="size-4" />
					{option.label}
				</button>
			{/each}
		</div>

		<!-- Live preview swatch reflecting the currently resolved theme. -->
		<div class="grid gap-2">
			<Label class="text-muted-foreground text-xs font-normal">{t('appearance.preview')}</Label>
			<div class="overflow-hidden rounded-lg border">
				<div class="bg-background p-4">
					<div class="flex items-center gap-3">
						<div class="bg-primary size-9 shrink-0 rounded-md"></div>
						<div class="min-w-0 flex-1 space-y-1.5">
							<div class="bg-foreground/80 h-2.5 w-24 rounded-full"></div>
							<div class="bg-muted-foreground/40 h-2 w-36 rounded-full"></div>
						</div>
						<span
							class="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium"
						>
							{t(resolved === 'dark' ? 'appearance.dark' : 'appearance.light')}
						</span>
					</div>
					<div class="mt-4 flex flex-wrap gap-2">
						<span class="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs">
							{t('appearance.primary')}
						</span>
						<span class="border-border text-foreground rounded-md border px-3 py-1.5 text-xs">
							{t('appearance.outline')}
						</span>
						<span class="bg-muted text-muted-foreground rounded-md px-3 py-1.5 text-xs">
							{t('appearance.muted')}
						</span>
					</div>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>{t('common.language')}</Card.Title>
		<Card.Description>{t('appearance.languageDescription')}</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-2 sm:grid-cols-2">
			{#each LOCALES as locale (locale.value)}
				{@const active = i18n.locale === locale.value}
				<button
					type="button"
					onclick={() => setLocale(locale.value)}
					aria-pressed={active}
					class={cn(
						'flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors',
						active
							? 'border-primary bg-accent text-accent-foreground'
							: 'border-border hover:bg-accent/50'
					)}
				>
					<span class="font-medium">{locale.label}</span>
					{#if active}
						<Check class="text-primary size-4" />
					{/if}
				</button>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>{t('appearance.density')}</Card.Title>
		<Card.Description>{t('appearance.densityDescription')}</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex items-center justify-between gap-4">
			<div class="space-y-0.5">
				<Label for={densityId}>{t('appearance.compactMode')}</Label>
				<p id={`${densityId}-description`} class="text-muted-foreground text-sm">
					{t('appearance.compactDescription')}
				</p>
			</div>
			<Switch
				id={densityId}
				checked={compact.current}
				onCheckedChange={onDensityChange}
				aria-label={t('appearance.compactMode')}
			/>
		</div>
	</Card.Content>
</Card.Root>
