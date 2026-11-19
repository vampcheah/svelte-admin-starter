import { describe, expect, it } from 'vitest';
import { demoOrders, type DemoOrder, type OrderStatus } from '#lib/data/orders.ts';
import { canShipOrder, itemCount, orderSummary, shipOrder } from './model';

describe('order summary', () => {
	it('keeps the detail total identical to the recorded list total for every demo order', () => {
		for (const order of demoOrders) {
			const summary = orderSummary(order);
			expect(summary.total, order.number).toBe(order.total);
			expect(summary.subtotal, order.number).toBe(order.total);
		}
	});

	it('counts quantities and rounds the item subtotal without inventing charges', () => {
		const order: DemoOrder = {
			...demoOrders[0]!,
			items: [
				{ name: 'Small item', qty: 3, price: 0.1 },
				{ name: 'Larger item', qty: 2, price: 4.25 }
			],
			total: 8.8
		};
		expect(itemCount(order)).toBe(5);
		expect(orderSummary(order)).toEqual({ subtotal: 8.8, total: 8.8 });
	});
});

describe('shipping orders', () => {
	it.each<OrderStatus>(['pending', 'processing'])(
		'ships a %s order without changing the source record or its total',
		(status) => {
			const order: DemoOrder = { ...demoOrders[0]!, status };
			const shipped = shipOrder(order);
			expect(canShipOrder(order)).toBe(true);
			expect(shipped).toEqual({ ...order, status: 'shipped' });
			expect(shipped).not.toBe(order);
			expect(order.status).toBe(status);
		}
	);

	it.each<OrderStatus>(['shipped', 'delivered', 'cancelled'])(
		'does not overwrite the %s status',
		(status) => {
			const order: DemoOrder = { ...demoOrders[0]!, status };
			expect(canShipOrder(order)).toBe(false);
			expect(shipOrder(order)).toBe(order);
		}
	);
});
