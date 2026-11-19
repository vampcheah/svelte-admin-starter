import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { setLocale } from '#lib/i18n/index.ts';
import OrderStatusTimeline from './OrderStatusTimeline.svelte';

afterEach(() => setLocale('en'));

describe('order status timeline', () => {
	it('announces the current fulfillment stage', () => {
		const body = render(OrderStatusTimeline, { props: { status: 'shipped' } }).body;
		expect(body.match(/aria-current="step"/g)).toHaveLength(1);
		expect(body).toMatch(/aria-current="step"[\s\S]*?Shipped/);
	});

	it('shows cancellation instead of fulfillment progress in the selected locale', () => {
		setLocale('zh-CN');
		const body = render(OrderStatusTimeline, { props: { status: 'cancelled' } }).body;
		expect(body).toContain('此订单已取消。');
		expect(body).not.toContain('aria-current');
		expect(body).not.toContain('<ol');
	});
});
