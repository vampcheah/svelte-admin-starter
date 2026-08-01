<!--
  LineItemsEditor — shared full-page line-items grid for quotes & invoices.
  Editable rows (item + description, qty, unit price, taxable) with live row totals
  and a subtotal/tax/total summary. Tax is a CLIENT-SIDE PREVIEW from the company
  rate; the backend recomputes authoritatively on save. `items` is bindable.
-->
<script lang="ts" module>
	export interface EditableLine {
		id: number;
		description: string;
		qty: string;
		unit_price: string;
		discount_percent: string;
		taxable: boolean;
		myinvois_classification: string;
		myinvois_tax_type: string;
		myinvois_exemption_reason: string;
		myinvois_unit_code: string;
	}
</script>

<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import * as Table from '$lib/core/components/ui/table';
	import * as Select from '$lib/core/components/ui/select';
	import { Input } from '$lib/core/components/ui/input';
	import { Textarea } from '$lib/core/components/ui/textarea';
	import { Button } from '$lib/core/components/ui/button';
	import { Checkbox } from '$lib/core/components/ui/checkbox';
	import { t } from '$lib/i18n';

	export interface ServiceItem {
		id: number;
		name: string;
		description?: string | null;
		default_unit_price: number;
		is_taxable: boolean;
		allow_multiple?: boolean;
		myinvois_classification?: string | null;
		myinvois_tax_type?: string | null;
		myinvois_exemption_reason?: string | null;
		myinvois_unit_code?: string | null;
	}

	interface Props {
		items: EditableLine[];
		catalog?: ServiceItem[];
		currency?: string;
		/** Preview tax rate (0..1). Backend stays authoritative. */
		taxRate?: number;
		/** Allow recurring descriptions to insert the template-level counter token. */
		showCounterInsertion?: boolean;
		/** Use a multiline description field for invoice line items. */
		multilineDescription?: boolean;
	}
	let {
		items = $bindable([]),
		catalog = [],
		currency = 'MYR',
		taxRate = 0,
		showCounterInsertion = false,
		multilineDescription = false
	}: Props = $props();

	let uid = $state(0);
	const COUNTER_TOKEN = '{counter}';
	function blankRow(): EditableLine {
		return {
			id: ++uid,
			description: '',
			qty: '1',
			unit_price: '0',
			discount_percent: '0',
			taxable: taxRate > 0,
			myinvois_classification: '',
			myinvois_tax_type: '',
			myinvois_exemption_reason: '',
			myinvois_unit_code: ''
		};
	}
	function addBlank() {
		items = [...items, blankRow()];
	}
	function removeRow(id: number) {
		items = items.filter((r) => r.id !== id);
	}
	function insertCounter(row: EditableLine) {
		if (!row.description.includes(COUNTER_TOKEN)) {
			row.description = `${row.description.trimEnd()}${row.description.trim() ? ' ' : ''}${COUNTER_TOKEN}`;
		}
	}
	// Catalog → line text uses the item's Description (falling back to its name
	// only when no description is set).
	const catalogDesc = (s: ServiceItem) => s.description?.trim() || s.name;

	// Hide catalog entries already added as a line (so each adds once, and the
	// picker resets instead of keeping a lingering checkmark on the last pick).
	let pick = $state('');
	const availableCatalog = $derived.by(() => {
		const used = new Set(items.map((r) => r.description));
		// Keep items flagged allow_multiple visible even once added.
		return catalog.filter((c) => c.allow_multiple || !used.has(catalogDesc(c)));
	});

	function addFromCatalog(idStr: string) {
		const s = catalog.find((c) => String(c.id) === idStr);
		pick = '';
		if (!s) return;
		items = [
			...items,
			{
				id: ++uid,
				description: catalogDesc(s),
				qty: '1',
				unit_price: String(s.default_unit_price),
				discount_percent: '0',
				taxable: s.is_taxable,
				myinvois_classification: s.myinvois_classification ?? '',
				myinvois_tax_type: s.myinvois_tax_type ?? '',
				myinvois_exemption_reason: s.myinvois_exemption_reason ?? '',
				myinvois_unit_code: s.myinvois_unit_code ?? ''
			}
		];
	}

	const lineTotal = (r: EditableLine) =>
		(Number(r.qty) || 0) *
		(Number(r.unit_price) || 0) *
		(1 - (Number(r.discount_percent) || 0) / 100);
	const subtotal = $derived(items.reduce((s, r) => s + lineTotal(r), 0));
	const tax = $derived(items.reduce((s, r) => s + (r.taxable ? lineTotal(r) * taxRate : 0), 0));
	const total = $derived(subtotal + tax);
	const fmt = (n: number) =>
		`${currency} ${n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
</script>

<div class="space-y-3">
	<div class="overflow-hidden rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row class="bg-muted/50">
					<Table.Head>{t('sales.item')}</Table.Head>
					<Table.Head class="w-20 text-right">{t('sales.qty')}</Table.Head>
					<Table.Head class="w-32 text-right">{t('sales.unitPrice')}</Table.Head>
					<Table.Head class="w-20 text-right">{t('sales.discount')}</Table.Head>
					<Table.Head class="w-16 text-center">{t('sales.taxable')}</Table.Head>
					<Table.Head class="w-32 text-right">{t('sales.lineTotal')}</Table.Head>
					<Table.Head class="w-10"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each items as row (row.id)}
					<Table.Row>
						<Table.Cell>
							{#if multilineDescription}
								<div class="space-y-1.5">
									<Textarea
										bind:value={row.description}
										placeholder={t('common.description')}
										rows={2}
										class="min-h-16 resize-y"
									/>
									{#if showCounterInsertion}
										<Button
											type="button"
											variant="outline"
											size="xs"
											disabled={row.description.includes(COUNTER_TOKEN)}
											onclick={() => insertCounter(row)}
										>
											{t('recurring.insertCounter')}
										</Button>
									{/if}
								</div>
							{:else}
								<Input bind:value={row.description} placeholder={t('common.description')} />
							{/if}
						</Table.Cell>
						<Table.Cell>
							<Input type="number" min="0" step="any" class="text-right" bind:value={row.qty} />
						</Table.Cell>
						<Table.Cell>
							<Input
								type="number"
								min="0"
								step="any"
								class="text-right"
								bind:value={row.unit_price}
							/>
						</Table.Cell>
						<Table.Cell>
							<Input
								type="number"
								min="0"
								max="100"
								step="any"
								class="text-right"
								bind:value={row.discount_percent}
							/>
						</Table.Cell>
						<Table.Cell class="text-center">
							<Checkbox
								checked={row.taxable}
								onCheckedChange={(v) => (row.taxable = v === true)}
								aria-label={t('sales.taxable')}
							/>
						</Table.Cell>
						<Table.Cell class="text-right tabular-nums">{fmt(lineTotal(row))}</Table.Cell>
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								class="text-destructive size-8"
								onclick={() => removeRow(row.id)}
								aria-label={t('sales.removeItem')}><Trash2 class="size-4" /></Button
							>
						</Table.Cell>
					</Table.Row>
				{/each}
				{#if items.length === 0}
					<Table.Row class="hover:bg-transparent">
						<Table.Cell colspan={7} class="text-muted-foreground py-6 text-center text-sm">
							{t('sales.noItems')}
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<Button variant="outline" size="sm" onclick={addBlank}>
			<Plus class="size-4" />
			{t('sales.addItem')}
		</Button>
		{#if availableCatalog.length > 0}
			<Select.Root type="single" bind:value={pick} onValueChange={(v) => v && addFromCatalog(v)}>
				<Select.Trigger class="h-8 w-56">{t('sales.addFromCatalog')}</Select.Trigger>
				<Select.Content>
					{#each availableCatalog as c (c.id)}
						<Select.Item value={String(c.id)} label={c.name}>{c.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/if}
	</div>

	<div class="flex justify-end">
		<div class="w-64 space-y-1.5 text-sm">
			<div class="flex justify-between">
				<span class="text-muted-foreground">{t('sales.subtotal')}</span>
				<span class="tabular-nums">{fmt(subtotal)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">{t('sales.tax')}</span>
				<span class="tabular-nums">{fmt(tax)}</span>
			</div>
			<div class="flex justify-between border-t pt-1.5 text-base font-semibold">
				<span>{t('sales.total')}</span>
				<span class="tabular-nums">{fmt(total)}</span>
			</div>
		</div>
	</div>
</div>
