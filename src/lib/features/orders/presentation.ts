import type { BadgeTone } from '#lib/core/components/shared/StatusBadge.svelte';
import type { OrderStatus } from '#lib/data/orders.ts';
import { t, type TranslationKey } from '#lib/i18n/index.ts';

export const ORDER_STATUSES = {
	pending: { label: 'orders.statuses.pending', tone: 'warning' },
	processing: { label: 'orders.statuses.processing', tone: 'info' },
	shipped: { label: 'orders.statuses.shipped', tone: 'brand' },
	delivered: { label: 'orders.statuses.delivered', tone: 'success' },
	cancelled: { label: 'orders.statuses.cancelled', tone: 'danger' }
} as const satisfies Record<OrderStatus, { label: TranslationKey; tone: BadgeTone }>;

export function statusTone(status: OrderStatus): BadgeTone {
	return ORDER_STATUSES[status]?.tone ?? 'neutral';
}

export function statusLabel(status: OrderStatus): string {
	const presentation = ORDER_STATUSES[status];
	return presentation ? t(presentation.label) : status;
}
