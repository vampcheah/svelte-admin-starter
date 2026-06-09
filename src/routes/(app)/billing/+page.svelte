<!--
  Billing / Subscription — current plan, metered usage, payment method, and an
  invoice history table. All data is MOCK and lives in local state; the action
  buttons (change plan, cancel, update card, download invoice) surface a toast.
-->
<script lang="ts">
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import Download from '@lucide/svelte/icons/download';
	import Check from '@lucide/svelte/icons/check';
	import Sparkles from '@lucide/svelte/icons/sparkles';

	import {
		PageContainer,
		PageHeader,
		DataTable,
		StatusBadge,
		type Column,
		type BadgeTone
	} from '$lib/components/shared';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';

	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	// --- Current plan (mock) ----------------------------------------------
	const plan = {
		name: 'Pro',
		price: 29,
		interval: 'mo',
		renewsAt: '2026-07-09',
		blurb: 'Everything your team needs to ship, with priority support and advanced analytics.'
	};

	const planHighlights = [
		'Unlimited projects',
		'Advanced analytics',
		'Priority support',
		'Custom roles & permissions'
	];

	// --- Metered usage (mock) ---------------------------------------------
	interface UsageMetric {
		id: string;
		label: string;
		used: number;
		limit: number;
		/** Optional unit suffix, e.g. "GB". */
		unit?: string;
		/** Format large counts compactly (e.g. API calls). */
		compact?: boolean;
	}

	const usage: UsageMetric[] = [
		{ id: 'seats', label: 'Seats', used: 7, limit: 10 },
		{ id: 'api', label: 'API calls', used: 82_000, limit: 100_000, compact: true },
		{ id: 'storage', label: 'Storage', used: 14, limit: 20, unit: 'GB' }
	];

	function usagePercent(metric: UsageMetric): number {
		return Math.min(100, Math.round((metric.used / metric.limit) * 100));
	}

	function formatUsage(value: number, metric: UsageMetric): string {
		const formatted = metric.compact
			? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
					value
				)
			: new Intl.NumberFormat('en-US').format(value);
		return metric.unit ? `${formatted} ${metric.unit}` : formatted;
	}

	// --- Payment method (mock) --------------------------------------------
	const paymentMethod = {
		brand: 'Visa',
		last4: '4242',
		expiry: '08/27',
		holder: 'Alex Morgan'
	};

	// --- Invoices (mock) --------------------------------------------------
	interface DemoInvoice {
		id: string;
		number: string;
		date: string;
		amount: number;
		status: 'paid' | 'pending' | 'failed';
	}

	const invoices: DemoInvoice[] = [
		{ id: 'inv_01', number: 'INV-2043', date: '2026-06-01', amount: 29.0, status: 'paid' },
		{ id: 'inv_02', number: 'INV-2042', date: '2026-05-01', amount: 29.0, status: 'paid' },
		{ id: 'inv_03', number: 'INV-2041', date: '2026-04-01', amount: 29.0, status: 'paid' },
		{ id: 'inv_04', number: 'INV-2040', date: '2026-03-01', amount: 49.0, status: 'pending' },
		{ id: 'inv_05', number: 'INV-2039', date: '2026-02-01', amount: 29.0, status: 'paid' },
		{ id: 'inv_06', number: 'INV-2038', date: '2026-01-01', amount: 29.0, status: 'failed' },
		{ id: 'inv_07', number: 'INV-2037', date: '2025-12-01', amount: 29.0, status: 'paid' },
		{ id: 'inv_08', number: 'INV-2036', date: '2025-11-01', amount: 29.0, status: 'paid' }
	];

	type InvoiceStatus = DemoInvoice['status'];

	function statusTone(status: InvoiceStatus): BadgeTone {
		return status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'danger';
	}
	function statusLabel(status: InvoiceStatus): string {
		switch (status) {
			case 'paid':
				return 'Paid';
			case 'pending':
				return 'Pending';
			case 'failed':
				return 'Failed';
		}
	}

	const columns: Column<DemoInvoice>[] = [
		{ key: 'number', header: 'Number', sortable: true, searchable: true },
		{ key: 'date', header: 'Date', sortable: true },
		{ key: 'amount', header: 'Amount', sortable: true, align: 'right' },
		{ key: 'status', header: 'Status', sortable: true }
	];

	// --- Mock actions ------------------------------------------------------
	function changePlan(): void {
		toast.info('Change plan', {
			description: 'Plan management is not available in this demo.'
		});
	}
	function cancelSubscription(): void {
		toast.warning('Subscription cancellation requested', {
			description: 'This is a demo — nothing was actually cancelled.'
		});
	}
	function updatePaymentMethod(): void {
		toast.info('Update payment method', {
			description: 'Payment editing is not available in this demo.'
		});
	}
	function downloadInvoice(invoice: DemoInvoice): void {
		toast.success(`Downloading ${invoice.number}`, {
			description: 'Your invoice PDF is being prepared.'
		});
	}
</script>

<svelte:head>
	<title>Billing · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader
		title="Billing"
		description="Manage your plan, usage, payment method, and invoices."
	/>

	<!-- Plan + payment method row -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Current plan -->
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div class="space-y-1">
						<Card.Title class="flex items-center gap-2">
							{plan.name} plan
							<StatusBadge tone="brand">Current</StatusBadge>
						</Card.Title>
						<Card.Description>{plan.blurb}</Card.Description>
					</div>
					<div class="shrink-0 text-right">
						<p class="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
							{formatCurrency(plan.price)}<span class="text-base font-normal text-muted-foreground"
								>/{plan.interval}</span
							>
						</p>
						<p class="text-xs text-muted-foreground">
							Renews {formatDate(plan.renewsAt)}
						</p>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="rounded-lg border border-border bg-muted/40 p-4">
					<p class="flex items-center gap-1.5 text-sm font-medium text-foreground">
						<Sparkles class="size-4 text-primary" aria-hidden="true" />
						Most features included
					</p>
					<ul class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
						{#each planHighlights as feature (feature)}
							<li class="flex items-center gap-2 text-sm text-muted-foreground">
								<span
									class="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
								>
									<Check class="size-3" aria-hidden="true" />
								</span>
								{feature}
							</li>
						{/each}
					</ul>
				</div>
			</Card.Content>
			<Card.Footer class="flex flex-col gap-2 border-t sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					class="text-destructive hover:text-destructive"
					onclick={cancelSubscription}
				>
					Cancel subscription
				</Button>
				<Button type="button" onclick={changePlan}>Change plan</Button>
			</Card.Footer>
		</Card.Root>

		<!-- Payment method -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Payment method</Card.Title>
				<Card.Description>Charged automatically each billing period.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<!-- Faux card -->
				<div
					class="relative aspect-[16/10] overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-card p-4 text-foreground"
				>
					<div
						class="pointer-events-none absolute -top-10 -right-8 size-32 rounded-full bg-primary/10 blur-2xl"
						aria-hidden="true"
					></div>
					<div class="relative flex h-full flex-col justify-between">
						<div class="flex items-center justify-between">
							<CreditCard class="size-6 text-primary" aria-hidden="true" />
							<span class="text-sm font-semibold tracking-wide text-foreground"
								>{paymentMethod.brand}</span
							>
						</div>
						<div>
							<p class="font-medium tracking-[0.2em] tabular-nums text-foreground">
								•••• •••• •••• {paymentMethod.last4}
							</p>
							<div class="mt-2 flex items-center justify-between text-xs text-muted-foreground">
								<span class="truncate">{paymentMethod.holder}</span>
								<span class="tabular-nums">Exp {paymentMethod.expiry}</span>
							</div>
						</div>
					</div>
				</div>
				<Button type="button" variant="outline" class="w-full" onclick={updatePaymentMethod}>
					<CreditCard class="size-4" aria-hidden="true" />
					Update
				</Button>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Usage -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Usage</Card.Title>
			<Card.Description>Your consumption against this period's limits.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				{#each usage as metric (metric.id)}
					{@const percent = usagePercent(metric)}
					<div class="space-y-2">
						<div class="flex items-baseline justify-between gap-2">
							<span class="text-sm font-medium text-foreground">{metric.label}</span>
							<span class="text-xs tabular-nums text-muted-foreground">{percent}%</span>
						</div>
						<Progress
							value={percent}
							class={cn(percent >= 90 && '[&_[data-slot=progress-indicator]]:bg-amber-500')}
						/>
						<p class="text-sm tabular-nums text-muted-foreground">
							{formatUsage(metric.used, metric)} of {formatUsage(metric.limit, metric)}
						</p>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Invoices -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Invoices</Card.Title>
			<Card.Description>Your recent billing history.</Card.Description>
		</Card.Header>
		<Card.Content>
			<DataTable
				data={invoices}
				{columns}
				searchable
				pageSize={8}
				emptyTitle="No invoices"
				emptyDescription="Invoices will appear here once you are billed."
			>
				{#snippet cell(row, column)}
					{#if column.key === 'number'}
						<span class="font-medium tabular-nums text-foreground">{row.number}</span>
					{:else if column.key === 'date'}
						<span class="text-muted-foreground">{formatDate(row.date)}</span>
					{:else if column.key === 'amount'}
						<span class="tabular-nums">{formatCurrency(row.amount)}</span>
					{:else if column.key === 'status'}
						<StatusBadge tone={statusTone(row.status)}>{statusLabel(row.status)}</StatusBadge>
					{/if}
				{/snippet}

				{#snippet actions(row)}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="text-muted-foreground hover:text-foreground"
						aria-label={`Download ${row.number}`}
						onclick={() => downloadInvoice(row)}
					>
						<Download class="size-4" aria-hidden="true" />
					</Button>
				{/snippet}
			</DataTable>
		</Card.Content>
	</Card.Root>
</PageContainer>
