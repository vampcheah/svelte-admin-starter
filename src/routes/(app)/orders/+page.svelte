<!-- Orders and drawer selection are local to this cached page instance. -->
<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Eye from '@lucide/svelte/icons/eye';
	import Package from '@lucide/svelte/icons/package';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';
	import Clock from '@lucide/svelte/icons/clock';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import DataTable, { type Column } from '#lib/core/components/shared/DataTable.svelte';
	import StatCard from '#lib/core/components/shared/StatCard.svelte';
	import StatusBadge from '#lib/core/components/shared/StatusBadge.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import OrderDetailsDrawer from '#lib/features/orders/OrderDetailsDrawer.svelte';
	import { itemCount, shipOrder } from '#lib/features/orders/model.ts';
	import { exportOrdersToCsv } from '#lib/features/orders/export.ts';
	import { statusLabel, statusTone } from '#lib/features/orders/presentation.ts';
	import { demoOrders, type DemoOrder } from '#lib/data/orders.ts';
	import { formatCurrency, formatDate, formatNumber } from '#lib/i18n/formatters.ts';
	import { t, translate } from '#lib/i18n/index.ts';
	import { toast } from 'svelte-sonner';

	let orders = $state(demoOrders.map((order) => ({ ...order })));

	const stats = $derived([
		{
			title: t('orders.totalOrders'),
			value: formatNumber(1290),
			change: 8.4,
			trend: 'up' as const,
			icon: Package
		},
		{
			title: t('orders.revenue'),
			value: formatCurrency(48920),
			change: 12.5,
			trend: 'up' as const,
			icon: DollarSign
		},
		{
			title: statusLabel('pending'),
			value: formatNumber(38),
			change: -3.2,
			trend: 'down' as const,
			icon: Clock
		},
		{
			title: statusLabel('delivered'),
			value: formatNumber(1072),
			change: 5.1,
			trend: 'up' as const,
			icon: CircleCheckBig
		}
	]);

	const columns = $derived<Column<DemoOrder>[]>([
		{ key: 'number', header: t('orders.order'), sortable: true, searchable: true },
		{ key: 'customer', header: t('orders.customer'), sortable: true, searchable: true },
		{ key: 'date', header: t('orders.date'), sortable: true },
		{ key: 'items', header: t('orders.items'), align: 'center' },
		{ key: 'total', header: t('sales.total'), sortable: true, align: 'right' },
		{ key: 'status', header: t('orders.status') }
	]);

	let drawerOpen = $state(false);
	let selectedOrderId = $state<string>();
	const selectedOrder = $derived(orders.find((order) => order.id === selectedOrderId));

	function openDetail(order: DemoOrder) {
		selectedOrderId = order.id;
		drawerOpen = true;
	}

	function exportOrders() {
		exportOrdersToCsv(orders);
		toast.success(t('orders.exported', { count: orders.length }));
	}

	function markAsShipped() {
		if (!selectedOrder) return;
		const updated = shipOrder(selectedOrder);
		if (updated === selectedOrder) return;
		orders = orders.map((order) => (order.id === updated.id ? updated : order));
		toast.success(t('orders.shipped', { number: updated.number }));
		drawerOpen = false;
	}
</script>

<PageContainer>
	<PageHeader title={t('orders.title')} description={t('orders.description')}>
		{#snippet actions()}
			<Button onclick={exportOrders}>
				<Download class="size-4" />
				{t('orders.export')}
			</Button>
		{/snippet}
	</PageHeader>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat (stat.title)}
			<StatCard {...stat} hint={t('orders.vsLastMonth')} />
		{/each}
	</div>

	<DataTable
		data={orders}
		text={translate}
		{columns}
		searchable
		emptyTitle={t('orders.emptyTitle')}
		emptyDescription={t('orders.emptyDescription')}
	>
		{#snippet cell(row, column)}
			{#if column.key === 'number'}
				<span class="font-medium text-foreground tabular-nums">{row.number}</span>
			{:else if column.key === 'customer'}
				<div class="flex flex-col">
					<span class="font-medium text-foreground">{row.customer}</span>
					<span class="text-xs text-muted-foreground">{row.email}</span>
				</div>
			{:else if column.key === 'date'}
				<span class="text-muted-foreground">{formatDate(row.date)}</span>
			{:else if column.key === 'items'}
				<span class="tabular-nums text-muted-foreground">{itemCount(row)}</span>
			{:else if column.key === 'total'}
				<span class="font-medium text-foreground tabular-nums">{formatCurrency(row.total)}</span>
			{:else if column.key === 'status'}
				<StatusBadge tone={statusTone(row.status)}>{statusLabel(row.status)}</StatusBadge>
			{/if}
		{/snippet}

		{#snippet actions(row)}
			<div class="flex items-center justify-end gap-0.5">
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:text-foreground size-8"
					title={t('orders.view')}
					aria-label={t('orders.viewNamed', { number: row.number })}
					onclick={() => openDetail(row)}
				>
					<Eye class="size-4" />
				</Button>
			</div>
		{/snippet}
	</DataTable>
</PageContainer>

<OrderDetailsDrawer bind:open={drawerOpen} order={selectedOrder} onMarkShipped={markAsShipped} />
