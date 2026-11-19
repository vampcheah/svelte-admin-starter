import type { CartItem } from '#lib/data/cart.ts';
import { CART_PRICING } from './config';

export interface CartTotals {
	subtotal: number;
	discount: number;
	discountedSubtotal: number;
	shipping: number;
	tax: number;
	total: number;
	itemCount: number;
	remainingForFreeShipping: number;
}

export function parsePromoCode(input: string): typeof CART_PRICING.promoCode | null {
	return input.trim().toUpperCase() === CART_PRICING.promoCode ? CART_PRICING.promoCode : null;
}

/** Cart pricing applies the discount before shipping eligibility and tax. */
export function calculateCartTotals(
	items: readonly Pick<CartItem, 'price' | 'quantity'>[],
	appliedPromo: string | null = null
): CartTotals {
	const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const discount = appliedPromo === CART_PRICING.promoCode ? subtotal * CART_PRICING.promoRate : 0;
	const discountedSubtotal = subtotal - discount;
	const shipping =
		items.length === 0 || discountedSubtotal >= CART_PRICING.freeShippingThreshold
			? 0
			: CART_PRICING.shippingFlat;
	const tax = discountedSubtotal * CART_PRICING.taxRate;

	return {
		subtotal,
		discount,
		discountedSubtotal,
		shipping,
		tax,
		total: discountedSubtotal + shipping + tax,
		itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
		remainingForFreeShipping:
			shipping > 0 ? CART_PRICING.freeShippingThreshold - discountedSubtotal : 0
	};
}
