import { demoCartItems, type CartItem } from '#lib/data/cart.ts';
import { calculateCartTotals, parsePromoCode } from './totals';

/** One cart per mounted page; separate tabs never mutate each other's demo cart. */
export class CartState {
	items = $state<CartItem[]>([]);
	promoInput = $state('');
	appliedPromo = $state<string | null>(null);

	constructor(initial: readonly CartItem[] = demoCartItems) {
		this.items = initial.map((item) => ({ ...item }));
	}

	get totals() {
		return calculateCartTotals(this.items, this.appliedPromo);
	}

	increment(id: string): void {
		const item = this.items.find((item) => item.id === id);
		if (item) item.quantity += 1;
	}

	decrement(id: string): void {
		const item = this.items.find((item) => item.id === id);
		if (item && item.quantity > 1) item.quantity -= 1;
	}

	remove(id: string): CartItem | undefined {
		const removed = this.items.find((item) => item.id === id);
		this.items = this.items.filter((item) => item.id !== id);
		return removed;
	}

	applyPromo(): string | null {
		this.appliedPromo = parsePromoCode(this.promoInput);
		return this.appliedPromo;
	}
}
