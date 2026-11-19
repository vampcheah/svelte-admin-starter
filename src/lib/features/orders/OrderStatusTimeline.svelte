<script lang="ts">
	import Package from '@lucide/svelte/icons/package';
	import Clock from '@lucide/svelte/icons/clock';
	import Truck from '@lucide/svelte/icons/truck';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import { cn } from '#lib/core/utils.ts';
	import type { OrderStatus } from '#lib/data/orders.ts';
	import { t } from '#lib/i18n/index.ts';
	import { statusLabel } from './presentation';

	let { status }: { status: OrderStatus } = $props();

	const steps = [
		{ key: 'pending', icon: Package },
		{ key: 'processing', icon: Clock },
		{ key: 'shipped', icon: Truck },
		{ key: 'delivered', icon: CircleCheckBig }
	] as const;
	const reachedIndex = $derived(steps.findIndex((step) => step.key === status));
</script>

<section class="space-y-3">
	<h3 class="text-sm font-semibold text-foreground">{t('orders.statusTimeline')}</h3>
	{#if status === 'cancelled'}
		<div
			class="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
		>
			{t('orders.cancelled')}
		</div>
	{:else}
		<ol class="relative space-y-5 pl-2">
			{#each steps as step, i (step.key)}
				{@const reached = i <= reachedIndex}
				{@const StepIcon = step.icon}
				<li
					class="relative flex items-center gap-3"
					aria-current={i === reachedIndex ? 'step' : undefined}
				>
					{#if i < steps.length - 1}
						<span
							class={cn(
								'absolute top-7 left-[0.6875rem] h-5 w-px',
								i < reachedIndex ? 'bg-primary' : 'bg-border'
							)}
							aria-hidden="true"
						></span>
					{/if}
					<span
						class={cn(
							'flex size-6 shrink-0 items-center justify-center rounded-full border',
							reached
								? 'border-primary bg-primary text-primary-foreground'
								: 'border-border bg-card text-muted-foreground'
						)}
					>
						<StepIcon class="size-3.5" aria-hidden="true" />
					</span>
					<span
						class={cn('text-sm', reached ? 'font-medium text-foreground' : 'text-muted-foreground')}
					>
						{step.key === 'pending' ? t('orders.orderPlaced') : statusLabel(step.key)}
					</span>
				</li>
			{/each}
		</ol>
	{/if}
</section>
