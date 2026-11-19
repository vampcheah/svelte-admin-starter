<!-- A local demo cart: each cached page instance owns its items and promo state. -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Package from '@lucide/svelte/icons/package';
	import { toast } from 'svelte-sonner';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import EmptyState from '#lib/core/components/shared/EmptyState.svelte';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import CartItemRow from '#lib/features/cart/CartItemRow.svelte';
	import CartSummary from '#lib/features/cart/CartSummary.svelte';
	import { CartState } from '#lib/features/cart/state.svelte.ts';
	import { CART_PRICING } from '#lib/features/cart/config.ts';
	import { t } from '#lib/i18n/index.ts';
	import { formatCurrency, formatNumber } from '#lib/i18n/formatters.ts';

	const cart = new CartState();
	const totals = $derived(cart.totals);

	function removeItem(id: string): void {
		const removed = cart.remove(id);
		if (removed) toast.success(t('cart.removed'), { description: removed.name });
	}

	function applyPromo(): void {
		const percent = formatNumber(CART_PRICING.promoRate, { style: 'percent' });
		if (cart.applyPromo()) {
			toast.success(t('cart.promoApplied'), {
				description: t('cart.promoDiscount', { percent })
			});
		} else {
			toast.error(t('cart.invalidPromo'), {
				description: t('cart.promoHint', { code: CART_PRICING.promoCode, percent })
			});
		}
	}

	function checkout(): void {
		toast.success(t('cart.orderPlaced'), {
			description: t(totals.itemCount === 1 ? 'cart.checkoutOneItem' : 'cart.checkoutManyItems', {
				count: totals.itemCount,
				total: formatCurrency(totals.total)
			})
		});
	}
</script>

<PageContainer>
	<PageHeader title={t('cart.title')} description={t('cart.description')} />

	{#if cart.items.length === 0}
		<EmptyState
			icon={ShoppingCart}
			title={t('cart.emptyTitle')}
			description={t('cart.emptyDescription')}
		>
			{#snippet action()}
				<Button href={resolve('tables')}>
					<Package class="size-4" aria-hidden="true" />
					{t('cart.browseProducts')}
				</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
			<div class="space-y-4 lg:col-span-2">
				<Card.Root>
					<Card.Header class="flex-row items-center justify-between">
						<div class="space-y-1">
							<Card.Title>{t('cart.items')}</Card.Title>
							<Card.Description>
								{t(totals.itemCount === 1 ? 'cart.oneItemInCart' : 'cart.manyItemsInCart', {
									count: totals.itemCount
								})}
							</Card.Description>
						</div>
						<span
							class="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg"
							aria-hidden="true"
						>
							<ShoppingCart class="size-4.5" />
						</span>
					</Card.Header>
					<Card.Content class="p-0">
						<ul class="divide-border divide-y">
							{#each cart.items as item (item.id)}
								<CartItemRow
									{item}
									onIncrement={() => cart.increment(item.id)}
									onDecrement={() => cart.decrement(item.id)}
									onRemove={() => removeItem(item.id)}
								/>
							{/each}
						</ul>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="lg:sticky lg:top-6">
				<CartSummary
					{totals}
					bind:promoInput={cart.promoInput}
					appliedPromo={cart.appliedPromo}
					onApplyPromo={applyPromo}
					onCheckout={checkout}
				/>
			</div>
		</div>
	{/if}
</PageContainer>
