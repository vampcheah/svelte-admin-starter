import { afterEach, describe, expect, it, vi } from 'vitest';
import { demoOrders } from '#lib/data/orders.ts';
import { setLocale } from '#lib/i18n/index.ts';
import { exportOrdersToCsv } from './export';
import { shipOrder } from './model';

afterEach(() => {
	setLocale('en');
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('order CSV download', () => {
	it('downloads flattened quantities, recorded totals and the current order status', async () => {
		vi.useFakeTimers();
		setLocale('en');
		const anchor = { click: vi.fn(), download: '', href: '', style: { display: '' } };
		vi.stubGlobal('document', {
			createElement: () => anchor,
			body: { appendChild: vi.fn(), removeChild: vi.fn() }
		});
		const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:orders');
		vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

		exportOrdersToCsv([shipOrder(demoOrders[0]!)]);

		const blob = create.mock.calls[0]![0] as Blob;
		expect(blob.type).toBe('text/csv;charset=utf-8;');
		expect(await blob.text()).toBe(
			'Order,Customer,Email,Date,Items,Total,Status\r\nORD-2048,Olivia Martin,olivia.martin@example.com,2026-06-08,3,137,Shipped'
		);
		expect(anchor.download).toBe('orders.csv');
		expect(anchor.click).toHaveBeenCalledOnce();
		expect(demoOrders[0]!.status).toBe('pending');
	});
});
