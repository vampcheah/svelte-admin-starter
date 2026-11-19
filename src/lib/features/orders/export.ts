import { exportToCsv } from '#lib/core/utils/csv.ts';
import type { DemoOrder } from '#lib/data/orders.ts';
import { t } from '#lib/i18n/index.ts';
import { itemCount } from './model';
import { statusLabel } from './presentation';

export function exportOrdersToCsv(orders: readonly DemoOrder[]): void {
	const rows = orders.map((order) => ({
		number: order.number,
		customer: order.customer,
		email: order.email,
		date: order.date,
		items: itemCount(order),
		total: order.total,
		status: statusLabel(order.status)
	}));

	exportToCsv(rows, 'orders.csv', [
		{ key: 'number', header: t('orders.order') },
		{ key: 'customer', header: t('orders.customer') },
		{ key: 'email', header: t('auth.email') },
		{ key: 'date', header: t('orders.date') },
		{ key: 'items', header: t('orders.items') },
		{ key: 'total', header: t('sales.total') },
		{ key: 'status', header: t('orders.status') }
	]);
}
