import type { DemoOrder } from '#lib/data/orders.ts';

export function itemCount(order: Pick<DemoOrder, 'items'>): number {
	return order.items.reduce((sum, item) => sum + item.qty, 0);
}

/** Use recorded order totals; demo records do not include shipping or tax charges. */
export function orderSummary(order: DemoOrder) {
	const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
	return { subtotal: Math.round(subtotal * 100) / 100, total: order.total };
}

export function canShipOrder(order: Pick<DemoOrder, 'status'>): boolean {
	return order.status === 'pending' || order.status === 'processing';
}

/** Preserve terminal statuses and return a new record for a valid local transition. */
export function shipOrder(order: DemoOrder): DemoOrder {
	return canShipOrder(order) ? { ...order, status: 'shipped' } : order;
}
