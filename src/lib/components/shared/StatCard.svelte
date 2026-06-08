<!--
  StatCard — a KPI tile built on the Card primitive. Shows a title, a large
  value, an optional leading icon, and an optional trend (colored arrow + %).
  `change` is a signed number (e.g. 12.5 → "+12.5%"); `trend` colors it.
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import Minus from '@lucide/svelte/icons/minus';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils';

	interface Props {
		title: string;
		value: string | number;
		icon?: Component;
		change?: number;
		trend?: 'up' | 'down' | 'neutral';
		hint?: string;
		class?: string;
	}

	let { title, value, icon: Icon, change, trend, hint, class: className }: Props = $props();

	// Derive the effective trend: explicit `trend` wins, otherwise infer from `change`.
	const effectiveTrend = $derived<'up' | 'down' | 'neutral'>(
		trend ?? (change === undefined ? 'neutral' : change > 0 ? 'up' : change < 0 ? 'down' : 'neutral')
	);

	const showTrend = $derived(change !== undefined || trend !== undefined);

	const TrendIcon = $derived(
		effectiveTrend === 'up' ? ArrowUp : effectiveTrend === 'down' ? ArrowDown : Minus
	);

	const trendColor = $derived(
		effectiveTrend === 'up'
			? 'text-emerald-500'
			: effectiveTrend === 'down'
				? 'text-red-500'
				: 'text-muted-foreground'
	);

	const changeLabel = $derived(
		change === undefined ? '' : `${change > 0 ? '+' : ''}${change}%`
	);
</script>

<Card.Root class={cn('overflow-hidden', className)}>
	<Card.Header class="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
		<Card.Description class="text-sm font-medium text-muted-foreground">
			{title}
		</Card.Description>
		{#if Icon}
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
			>
				<Icon class="size-4" aria-hidden="true" />
			</div>
		{/if}
	</Card.Header>
	<Card.Content class="space-y-1">
		<div class="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
		<div class="flex items-center gap-1.5 text-xs">
			{#if showTrend}
				<span class={cn('inline-flex items-center gap-0.5 font-medium', trendColor)}>
					<TrendIcon class="size-3.5" aria-hidden="true" />
					{#if changeLabel}{changeLabel}{/if}
				</span>
			{/if}
			{#if hint}
				<span class="text-muted-foreground">{hint}</span>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
