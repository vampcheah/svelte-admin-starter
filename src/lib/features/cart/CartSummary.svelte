<script lang="ts">
	import { resolve } from '$app/paths';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Tag from '@lucide/svelte/icons/tag';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import { Separator } from '#lib/core/components/ui/separator/index.ts';
	import FormField from '#lib/core/components/shared/FormField.svelte';
	import { cn } from '#lib/core/utils.ts';
	import { t } from '#lib/i18n/index.ts';
	import { formatCurrency, formatNumber } from '#lib/i18n/formatters.ts';
	import { CART_PRICING } from './config';
	import type { CartTotals } from './totals';

	interface Props {
		totals: CartTotals;
		promoInput?: string;
		appliedPromo: string | null;
		onApplyPromo: () => void;
		onCheckout: () => void;
	}
	let {
		totals,
		promoInput = $bindable(''),
		appliedPromo,
		onApplyPromo,
		onCheckout
	}: Props = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{t('cart.summary')}</Card.Title>
		<Card.Description>{t('cart.summaryDescription')}</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-5">
		<form
			class="space-y-2"
			onsubmit={(event) => {
				event.preventDefault();
				onApplyPromo();
			}}
		>
			<FormField label={t('cart.promoCode')}>
				{#snippet children(control)}
					<div class="flex items-center gap-2">
						<Input
							{...control}
							bind:value={promoInput}
							placeholder={t('cart.promoPlaceholder', { code: CART_PRICING.promoCode })}
							class="h-9"
						/>
						<Button type="submit" variant="outline" class="h-9 shrink-0">{t('cart.apply')}</Button>
					</div>
				{/snippet}
			</FormField>
			{#if appliedPromo}
				<p role="status" class="text-primary flex items-center gap-1 text-xs font-medium">
					<Tag class="size-3" aria-hidden="true" />
					{t('cart.appliedPromo', {
						code: appliedPromo,
						percent: formatNumber(CART_PRICING.promoRate, { style: 'percent' })
					})}
				</p>
			{/if}
		</form>

		<Separator />

		<dl class="space-y-3 text-sm">
			<div class="flex items-center justify-between">
				<dt class="text-muted-foreground">{t('cart.subtotal')}</dt>
				<dd class="tabular-nums text-foreground">{formatCurrency(totals.subtotal)}</dd>
			</div>
			{#if totals.discount > 0}
				<div class="flex items-center justify-between">
					<dt class="text-muted-foreground">{t('cart.discount')}</dt>
					<dd class="text-primary tabular-nums">−{formatCurrency(totals.discount)}</dd>
				</div>
			{/if}
			<div class="flex items-center justify-between">
				<dt class="text-muted-foreground">{t('cart.shipping')}</dt>
				<dd class={cn('tabular-nums', totals.shipping === 0 ? 'text-primary' : 'text-foreground')}>
					{totals.shipping === 0 ? t('cart.free') : formatCurrency(totals.shipping)}
				</dd>
			</div>
			<div class="flex items-center justify-between">
				<dt class="text-muted-foreground">
					{t('cart.tax', { percent: formatNumber(CART_PRICING.taxRate, { style: 'percent' }) })}
				</dt>
				<dd class="tabular-nums text-foreground">{formatCurrency(totals.tax)}</dd>
			</div>
		</dl>

		<Separator />

		<div class="flex items-center justify-between">
			<span class="text-base font-semibold text-foreground">{t('cart.total')}</span>
			<span class="text-base font-semibold tabular-nums text-foreground">
				{formatCurrency(totals.total)}
			</span>
		</div>

		{#if totals.shipping > 0}
			<p class="text-muted-foreground text-xs">
				{t('cart.freeShippingHint', { amount: formatCurrency(totals.remainingForFreeShipping) })}
			</p>
		{/if}
	</Card.Content>
	<Card.Footer class="flex-col gap-3">
		<Button class="w-full" onclick={onCheckout}>
			<ShoppingCart class="size-4" aria-hidden="true" />
			{t('cart.checkout')}
		</Button>
		<Button
			href={resolve('tables')}
			variant="link"
			class="text-muted-foreground hover:text-foreground"
		>
			{t('cart.continueShopping')}
		</Button>
	</Card.Footer>
</Card.Root>
