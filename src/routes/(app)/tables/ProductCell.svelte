<script lang="ts">
	import StatusBadge from '#lib/core/components/shared/StatusBadge.svelte';
	import type { BadgeTone } from '#lib/core/components/shared/StatusBadge.svelte';
	import type { Column } from '#lib/core/components/shared/DataTable.svelte';
	import type { DemoProduct } from '#lib/data/products.ts';
	import { formatCurrency, formatNumber } from '#lib/i18n/formatters.ts';

	let { row, column }: { row: DemoProduct; column: Column<DemoProduct> } = $props();

	const tone: Record<DemoProduct['status'], BadgeTone> = {
		in_stock: 'success',
		low: 'warning',
		out: 'danger'
	};
	const label = { in_stock: 'In stock', low: 'Low', out: 'Out' } as const;
</script>

{#if column.key === 'name'}
	<span class="font-medium text-foreground">{row.name}</span>
{:else if column.key === 'category'}
	<span class="text-muted-foreground">{row.category}</span>
{:else if column.key === 'price'}
	<span class="tabular-nums">{formatCurrency(row.price)}</span>
{:else if column.key === 'stock'}
	<span class="tabular-nums">{formatNumber(row.stock)}</span>
{:else if column.key === 'status'}
	<StatusBadge tone={tone[row.status]}>{label[row.status]}</StatusBadge>
{/if}
