<script lang="ts">
	import Mail from '@lucide/svelte/icons/mail';
	import User from '@lucide/svelte/icons/user';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Truck from '@lucide/svelte/icons/truck';
	import X from '@lucide/svelte/icons/x';
	import * as Sheet from '#lib/core/components/ui/sheet/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Separator } from '#lib/core/components/ui/separator/index.ts';
	import StatusBadge from '#lib/core/components/shared/StatusBadge.svelte';
	import type { DemoOrder } from '#lib/data/orders.ts';
	import { formatCurrency, formatDate } from '#lib/i18n/formatters.ts';
	import { t } from '#lib/i18n/index.ts';
	import { canShipOrder, itemCount, orderSummary } from './model';
	import { statusLabel, statusTone } from './presentation';
	import OrderStatusTimeline from './OrderStatusTimeline.svelte';

	interface Props {
		open?: boolean;
		order?: DemoOrder;
		onMarkShipped: () => void;
	}
	let { open = $bindable(false), order, onMarkShipped }: Props = $props();
	const summary = $derived(order ? orderSummary(order) : undefined);
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" showCloseButton={false} class="gap-0 sm:max-w-lg!">
		{#if order && summary}
			<Sheet.Header class="border-b pe-12">
				<div class="flex items-center justify-between gap-2">
					<Sheet.Title class="tabular-nums">{order.number}</Sheet.Title>
					<StatusBadge tone={statusTone(order.status)}>{statusLabel(order.status)}</StatusBadge>
				</div>
				<Sheet.Description>
					{t('orders.placedBy', { customer: order.customer, date: formatDate(order.date) })}
				</Sheet.Description>
			</Sheet.Header>
			<Sheet.Close
				class="absolute end-3 top-3 rounded-sm p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label={t('orders.close')}
			>
				<X class="size-4" aria-hidden="true" />
			</Sheet.Close>

			<div class="flex-1 space-y-6 overflow-y-auto p-4">
				<section class="space-y-3">
					<h3 class="text-sm font-semibold text-foreground">{t('orders.customer')}</h3>
					<dl class="divide-border bg-card divide-y rounded-lg border">
						<div class="flex items-center gap-3 px-4 py-3">
							<User class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							<dt class="sr-only">{t('common.name')}</dt>
							<dd class="text-sm font-medium">{order.customer}</dd>
						</div>
						<div class="flex items-center gap-3 px-4 py-3">
							<Mail class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							<dt class="sr-only">{t('auth.email')}</dt>
							<dd class="truncate text-sm text-muted-foreground">{order.email}</dd>
						</div>
						<div class="flex items-center gap-3 px-4 py-3">
							<Calendar class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							<dt class="sr-only">{t('orders.orderDate')}</dt>
							<dd class="text-sm text-muted-foreground">{formatDate(order.date)}</dd>
						</div>
					</dl>
				</section>

				<section class="space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="text-sm font-semibold text-foreground">{t('orders.items')}</h3>
						<span class="text-xs text-muted-foreground tabular-nums">
							{t('orders.itemsTotal', { count: itemCount(order) })}
						</span>
					</div>
					<ul class="divide-border bg-card divide-y rounded-lg border">
						{#each order.items as item (item.name)}
							<li class="flex items-center justify-between gap-4 px-4 py-3">
								<div class="min-w-0">
									<p class="truncate text-sm font-medium text-foreground">{item.name}</p>
									<p class="text-xs text-muted-foreground tabular-nums">
										{item.qty} × {formatCurrency(item.price)}
									</p>
								</div>
								<span class="shrink-0 text-sm font-medium text-foreground tabular-nums"
									>{formatCurrency(item.qty * item.price)}</span
								>
							</li>
						{/each}
					</ul>
				</section>

				<section class="space-y-3">
					<h3 class="text-sm font-semibold text-foreground">{t('orders.summary')}</h3>
					<div class="rounded-lg border bg-card p-4">
						<dl class="text-sm">
							<div class="flex items-center justify-between">
								<dt class="text-muted-foreground">{t('sales.subtotal')}</dt>
								<dd class="font-medium tabular-nums">{formatCurrency(summary.subtotal)}</dd>
							</div>
						</dl>
						<Separator class="my-3" />
						<div class="flex items-center justify-between text-base">
							<span class="font-semibold text-foreground">{t('sales.total')}</span>
							<span class="font-semibold text-foreground tabular-nums"
								>{formatCurrency(summary.total)}</span
							>
						</div>
					</div>
				</section>

				<OrderStatusTimeline status={order.status} />
			</div>

			<Sheet.Footer class="flex-row justify-end border-t">
				<Button variant="outline" onclick={() => (open = false)}>{t('orders.close')}</Button>
				{#if canShipOrder(order)}
					<Button onclick={onMarkShipped}>
						<Truck class="size-4" />
						{t('orders.markShipped')}
					</Button>
				{/if}
			</Sheet.Footer>
		{/if}
	</Sheet.Content>
</Sheet.Root>
