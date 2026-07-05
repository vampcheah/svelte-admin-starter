<!--
  Sales Orders — an orders list with a slide-out detail drawer. All mock data.

  Mirrors the Users page conventions: a row of KPI StatCards, the shared
  <DataTable> (search, custom cells, per-row actions) and a right-side <Sheet>
  drawer for the selected order (customer block, line items, totals summary,
  and a status timeline). No backend is involved — everything is client-side.
-->
<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Eye from '@lucide/svelte/icons/eye';
	import Package from '@lucide/svelte/icons/package';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';
	import Clock from '@lucide/svelte/icons/clock';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import Mail from '@lucide/svelte/icons/mail';
	import User from '@lucide/svelte/icons/user';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Truck from '@lucide/svelte/icons/truck';
	import type { Component } from 'svelte';

	import {
		PageContainer,
		PageHeader,
		DataTable,
		StatCard,
		StatusBadge,
		type Column,
		type BadgeTone
	} from '$lib/components/shared';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';

	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import { toast } from 'svelte-sonner';

	// --- Types --------------------------------------------------------------
	interface DemoOrder {
		id: string;
		number: string;
		customer: string;
		email: string;
		date: string;
		items: { name: string; qty: number; price: number }[];
		total: number;
		status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
	}

	type Status = DemoOrder['status'];

	// --- Mock data ----------------------------------------------------------
	const orders: DemoOrder[] = [
		{
			id: 'ord_1',
			number: 'ORD-2048',
			customer: 'Olivia Martin',
			email: 'olivia.martin@example.com',
			date: '2026-06-08',
			items: [
				{ name: 'Aurora Desk Lamp', qty: 1, price: 89 },
				{ name: 'Walnut Pen Holder', qty: 2, price: 24 }
			],
			total: 137,
			status: 'pending'
		},
		{
			id: 'ord_2',
			number: 'ORD-2047',
			customer: 'Liam Johnson',
			email: 'liam.johnson@example.com',
			date: '2026-06-07',
			items: [
				{ name: 'Mechanical Keyboard', qty: 1, price: 149 },
				{ name: 'Braided USB-C Cable', qty: 3, price: 14 }
			],
			total: 191,
			status: 'processing'
		},
		{
			id: 'ord_3',
			number: 'ORD-2046',
			customer: 'Sophia Miller',
			email: 'sophia.miller@example.com',
			date: '2026-06-07',
			items: [{ name: 'Linen Throw Blanket', qty: 2, price: 65 }],
			total: 130,
			status: 'shipped'
		},
		{
			id: 'ord_4',
			number: 'ORD-2045',
			customer: 'Noah Brown',
			email: 'noah.brown@example.com',
			date: '2026-06-06',
			items: [
				{ name: 'Ceramic Pour-Over Set', qty: 1, price: 78 },
				{ name: 'Single-Origin Beans', qty: 4, price: 19 }
			],
			total: 154,
			status: 'delivered'
		},
		{
			id: 'ord_5',
			number: 'ORD-2044',
			customer: 'Emma Williams',
			email: 'emma.williams@example.com',
			date: '2026-06-05',
			items: [{ name: 'Studio Monitor Stand', qty: 2, price: 112 }],
			total: 224,
			status: 'processing'
		},
		{
			id: 'ord_6',
			number: 'ORD-2043',
			customer: 'James Wilson',
			email: 'james.wilson@example.com',
			date: '2026-06-05',
			items: [
				{ name: 'Leather Cardholder', qty: 1, price: 45 },
				{ name: 'Travel Notebook', qty: 2, price: 18 }
			],
			total: 81,
			status: 'cancelled'
		},
		{
			id: 'ord_7',
			number: 'ORD-2042',
			customer: 'Charlotte Anderson',
			email: 'charlotte.anderson@example.com',
			date: '2026-06-04',
			items: [
				{ name: 'Aurora Desk Lamp', qty: 2, price: 89 },
				{ name: 'Smart Power Strip', qty: 1, price: 39 }
			],
			total: 217,
			status: 'delivered'
		},
		{
			id: 'ord_8',
			number: 'ORD-2041',
			customer: 'Benjamin Davis',
			email: 'benjamin.davis@example.com',
			date: '2026-06-03',
			items: [{ name: 'Wireless Earbuds Pro', qty: 1, price: 179 }],
			total: 179,
			status: 'shipped'
		},
		{
			id: 'ord_9',
			number: 'ORD-2040',
			customer: 'Amelia Garcia',
			email: 'amelia.garcia@example.com',
			date: '2026-06-02',
			items: [
				{ name: 'Bamboo Drawer Organizer', qty: 3, price: 22 },
				{ name: 'Matte Storage Bins', qty: 2, price: 16 }
			],
			total: 98,
			status: 'pending'
		},
		{
			id: 'ord_10',
			number: 'ORD-2039',
			customer: 'Lucas Rodriguez',
			email: 'lucas.rodriguez@example.com',
			date: '2026-06-01',
			items: [
				{ name: '4K Webcam', qty: 1, price: 129 },
				{ name: 'Adjustable Ring Light', qty: 1, price: 54 }
			],
			total: 183,
			status: 'delivered'
		},
		{
			id: 'ord_11',
			number: 'ORD-2038',
			customer: 'Mia Moore',
			email: 'mia.moore@example.com',
			date: '2026-05-31',
			items: [{ name: 'Insulated Water Bottle', qty: 4, price: 28 }],
			total: 112,
			status: 'processing'
		},
		{
			id: 'ord_12',
			number: 'ORD-2037',
			customer: 'Henry Taylor',
			email: 'henry.taylor@example.com',
			date: '2026-05-30',
			items: [
				{ name: 'Standing Desk Converter', qty: 1, price: 199 },
				{ name: 'Anti-Fatigue Mat', qty: 1, price: 49 }
			],
			total: 248,
			status: 'shipped'
		}
	];

	// --- KPI stat cards -----------------------------------------------------
	const statIcons: Component[] = [Package, DollarSign, Clock, CircleCheckBig];
	const stats = [
		{ title: 'Total orders', value: '1,290', change: 8.4, trend: 'up' as const },
		{ title: 'Revenue', value: formatCurrency(48920), change: 12.5, trend: 'up' as const },
		{ title: 'Pending', value: '38', change: -3.2, trend: 'down' as const },
		{ title: 'Delivered', value: '1,072', change: 5.1, trend: 'up' as const }
	];

	// --- Status presentation ------------------------------------------------
	const STATUSES: { value: Status; label: string; tone: BadgeTone }[] = [
		{ value: 'pending', label: 'Pending', tone: 'warning' },
		{ value: 'processing', label: 'Processing', tone: 'info' },
		{ value: 'shipped', label: 'Shipped', tone: 'brand' },
		{ value: 'delivered', label: 'Delivered', tone: 'success' },
		{ value: 'cancelled', label: 'Cancelled', tone: 'danger' }
	];

	function statusTone(status: Status): BadgeTone {
		return STATUSES.find((s) => s.value === status)?.tone ?? 'neutral';
	}
	function statusLabel(status: Status): string {
		return STATUSES.find((s) => s.value === status)?.label ?? status;
	}

	function itemCount(order: DemoOrder): number {
		return order.items.reduce((sum, item) => sum + item.qty, 0);
	}

	const columns: Column<DemoOrder>[] = [
		{ key: 'number', header: 'Order', sortable: true, searchable: true },
		{ key: 'customer', header: 'Customer', sortable: true, searchable: true },
		{ key: 'date', header: 'Date', sortable: true },
		{ key: 'items', header: 'Items', align: 'center' },
		{ key: 'total', header: 'Total', sortable: true, align: 'right' },
		{ key: 'status', header: 'Status' }
	];

	// --- Detail drawer state ------------------------------------------------
	let drawerOpen = $state(false);
	let selectedOrder = $state<DemoOrder | null>(null);

	function openDetail(order: DemoOrder) {
		selectedOrder = order;
		drawerOpen = true;
	}

	// --- Totals summary (mock breakdown derived from the order total) -------
	const summary = $derived.by(() => {
		if (!selectedOrder) return null;
		const subtotal = selectedOrder.items.reduce((sum, item) => sum + item.qty * item.price, 0);
		const shipping = selectedOrder.status === 'cancelled' ? 0 : 8;
		const tax = Math.round(subtotal * 0.08 * 100) / 100;
		return { subtotal, shipping, tax, total: subtotal + shipping + tax };
	});

	// --- Status timeline ----------------------------------------------------
	const TIMELINE: { key: Status; label: string; icon: Component }[] = [
		{ key: 'pending', label: 'Order placed', icon: Package },
		{ key: 'processing', label: 'Processing', icon: Clock },
		{ key: 'shipped', label: 'Shipped', icon: Truck },
		{ key: 'delivered', label: 'Delivered', icon: CircleCheckBig }
	];
	const TIMELINE_ORDER: Status[] = ['pending', 'processing', 'shipped', 'delivered'];

	// How far the selected order has progressed along the timeline.
	const reachedIndex = $derived(selectedOrder ? TIMELINE_ORDER.indexOf(selectedOrder.status) : -1);

	function exportOrders() {
		toast.success(`Exported ${orders.length} orders to CSV`);
	}

	function markAsShipped() {
		if (!selectedOrder) return;
		toast.success(`${selectedOrder.number} marked as shipped`);
		drawerOpen = false;
	}
</script>

<svelte:head>
	<title>Sales Orders · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader title="Sales Orders" description="Track and manage customer orders.">
		{#snippet actions()}
			<Button onclick={exportOrders}>
				<Download class="size-4" />
				Export
			</Button>
		{/snippet}
	</PageHeader>

	<!-- KPI stat cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat, i (stat.title)}
			<StatCard
				title={stat.title}
				value={stat.value}
				change={stat.change}
				trend={stat.trend}
				icon={statIcons[i]}
				hint="vs last month"
			/>
		{/each}
	</div>

	<DataTable
		data={orders}
		{columns}
		searchable
		emptyTitle="No orders"
		emptyDescription="Orders from your store will appear here."
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
					title="View"
					aria-label={`View ${row.number}`}
					onclick={() => openDetail(row)}
				>
					<Eye class="size-4" />
				</Button>
			</div>
		{/snippet}
	</DataTable>
</PageContainer>

<!-- Order detail drawer -->
<Sheet.Root bind:open={drawerOpen}>
	<Sheet.Content side="right" class="gap-0 sm:max-w-lg!">
		{#if selectedOrder && summary}
			<Sheet.Header class="border-b">
				<div class="flex items-center justify-between gap-2">
					<Sheet.Title class="tabular-nums">{selectedOrder.number}</Sheet.Title>
					<StatusBadge tone={statusTone(selectedOrder.status)}>
						{statusLabel(selectedOrder.status)}
					</StatusBadge>
				</div>
				<Sheet.Description>
					Placed by {selectedOrder.customer} on {formatDate(selectedOrder.date)}.
				</Sheet.Description>
			</Sheet.Header>

			<div class="flex-1 space-y-6 overflow-y-auto p-4">
				<!-- Customer / contact -->
				<section class="space-y-3">
					<h3 class="text-sm font-semibold text-foreground">Customer</h3>
					<dl class="divide-border bg-card divide-y rounded-lg border">
						<div class="flex items-center gap-3 px-4 py-3">
							<User class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							<dt class="sr-only">Name</dt>
							<dd class="text-sm font-medium">{selectedOrder.customer}</dd>
						</div>
						<div class="flex items-center gap-3 px-4 py-3">
							<Mail class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							<dt class="sr-only">Email</dt>
							<dd class="truncate text-sm text-muted-foreground">{selectedOrder.email}</dd>
						</div>
						<div class="flex items-center gap-3 px-4 py-3">
							<Calendar class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							<dt class="sr-only">Order date</dt>
							<dd class="text-sm text-muted-foreground">{formatDate(selectedOrder.date)}</dd>
						</div>
					</dl>
				</section>

				<!-- Line items -->
				<section class="space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="text-sm font-semibold text-foreground">Items</h3>
						<span class="text-xs text-muted-foreground tabular-nums">
							{itemCount(selectedOrder)} total
						</span>
					</div>
					<ul class="divide-border bg-card divide-y rounded-lg border">
						{#each selectedOrder.items as item (item.name)}
							<li class="flex items-center justify-between gap-4 px-4 py-3">
								<div class="min-w-0">
									<p class="truncate text-sm font-medium text-foreground">{item.name}</p>
									<p class="text-xs text-muted-foreground tabular-nums">
										{item.qty} × {formatCurrency(item.price)}
									</p>
								</div>
								<span class="shrink-0 text-sm font-medium text-foreground tabular-nums">
									{formatCurrency(item.qty * item.price)}
								</span>
							</li>
						{/each}
					</ul>
				</section>

				<!-- Totals summary -->
				<section class="space-y-3">
					<h3 class="text-sm font-semibold text-foreground">Summary</h3>
					<div class="rounded-lg border bg-card p-4">
						<dl class="space-y-2 text-sm">
							<div class="flex items-center justify-between">
								<dt class="text-muted-foreground">Subtotal</dt>
								<dd class="font-medium tabular-nums">{formatCurrency(summary.subtotal)}</dd>
							</div>
							<div class="flex items-center justify-between">
								<dt class="text-muted-foreground">Shipping</dt>
								<dd class="font-medium tabular-nums">{formatCurrency(summary.shipping)}</dd>
							</div>
							<div class="flex items-center justify-between">
								<dt class="text-muted-foreground">Tax</dt>
								<dd class="font-medium tabular-nums">{formatCurrency(summary.tax)}</dd>
							</div>
						</dl>
						<Separator class="my-3" />
						<div class="flex items-center justify-between text-base">
							<span class="font-semibold text-foreground">Total</span>
							<span class="font-semibold text-foreground tabular-nums">
								{formatCurrency(summary.total)}
							</span>
						</div>
					</div>
				</section>

				<!-- Status timeline -->
				<section class="space-y-3">
					<h3 class="text-sm font-semibold text-foreground">Status timeline</h3>
					{#if selectedOrder.status === 'cancelled'}
						<div
							class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
						>
							This order was cancelled.
						</div>
					{:else}
						<ol class="relative space-y-5 pl-2">
							{#each TIMELINE as step, i (step.key)}
								{@const reached = i <= reachedIndex}
								{@const StepIcon = step.icon}
								<li class="relative flex items-center gap-3">
									{#if i < TIMELINE.length - 1}
										<span
											class={cn(
												'absolute top-7 left-[0.6875rem] h-5 w-px',
												i < reachedIndex ? 'bg-indigo-500' : 'bg-border'
											)}
											aria-hidden="true"
										></span>
									{/if}
									<span
										class={cn(
											'flex size-6 shrink-0 items-center justify-center rounded-full border',
											reached
												? 'border-indigo-500 bg-indigo-500 text-white'
												: 'border-border bg-card text-muted-foreground'
										)}
									>
										<StepIcon class="size-3.5" aria-hidden="true" />
									</span>
									<span
										class={cn(
											'text-sm',
											reached ? 'font-medium text-foreground' : 'text-muted-foreground'
										)}
									>
										{step.label}
									</span>
								</li>
							{/each}
						</ol>
					{/if}
				</section>
			</div>

			<Sheet.Footer class="flex-row justify-end border-t">
				<Button variant="outline" onclick={() => (drawerOpen = false)}>Close</Button>
				<Button onclick={markAsShipped}>
					<Truck class="size-4" />
					Mark as shipped
				</Button>
			</Sheet.Footer>
		{/if}
	</Sheet.Content>
</Sheet.Root>
