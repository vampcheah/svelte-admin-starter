import { describe, expect, it } from 'vitest';
import { demoCartItems } from '#lib/data/cart.ts';
import { CartState } from './state.svelte';

describe('local cart state', () => {
	it('updates quantities and totals while keeping the lower bound at one', () => {
		const cart = new CartState([demoCartItems[0]!]);
		const item = cart.items[0]!;
		cart.decrement(item.id);
		expect(item.quantity).toBe(1);
		cart.increment(item.id);
		expect(item.quantity).toBe(2);
		expect(cart.totals.itemCount).toBe(2);
		expect(cart.totals.subtotal).toBe(item.price * 2);
		cart.decrement(item.id);
		cart.decrement(item.id);
		expect(item.quantity).toBe(1);
		expect(cart.totals.itemCount).toBe(1);
	});

	it('ignores unknown IDs and removes known items without leaving shipping charges', () => {
		const cart = new CartState([demoCartItems[0]!]);
		const before = cart.totals;
		cart.increment('missing');
		cart.decrement('missing');
		expect(cart.remove('missing')).toBeUndefined();
		expect(cart.totals).toEqual(before);
		const item = cart.items[0]!;
		expect(cart.remove(item.id)?.name).toBe(item.name);
		expect(cart.items).toEqual([]);
		expect(cart.totals.total).toBe(0);
		expect(cart.totals.shipping).toBe(0);
	});

	it('replaces an accepted promo with no discount after an invalid attempt', () => {
		const cart = new CartState();
		cart.promoInput = '  save10  ';
		expect(cart.applyPromo()).toBe('SAVE10');
		expect(cart.appliedPromo).toBe('SAVE10');
		expect(cart.totals.discount).toBeCloseTo(cart.totals.subtotal * 0.1);
		cart.promoInput = 'INVALID';
		expect(cart.applyPromo()).toBeNull();
		expect(cart.appliedPromo).toBeNull();
		expect(cart.totals.discount).toBe(0);
	});

	it('keeps page instances and seed fixtures independent', () => {
		const before = structuredClone(demoCartItems);
		const first = new CartState();
		const second = new CartState();
		first.increment(first.items[0]!.id);
		first.remove(first.items[1]!.id);
		first.promoInput = 'SAVE10';
		first.applyPromo();
		expect(second.items).toEqual(before);
		expect(second.promoInput).toBe('');
		expect(second.appliedPromo).toBeNull();
		expect(demoCartItems).toEqual(before);
	});
});
