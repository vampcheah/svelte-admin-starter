// App defaults follow the active locale. The portable helpers keep native Intl
// behavior and their English defaults for consumers outside this application.
import * as formatters from '#lib/core/utils/formatters.ts';
import { i18n } from './index.svelte';

export { initials, toISODate } from '#lib/core/utils/formatters.ts';

export function formattingLocale(): string {
	return i18n.locale === 'en' ? 'en-US' : i18n.locale;
}

export function formatCurrency(
	amount: number,
	currency = 'USD',
	locale = formattingLocale()
): string {
	return formatters.formatCurrency(amount, currency, locale);
}

export function formatNumber(
	value: number,
	options?: Intl.NumberFormatOptions,
	locale = formattingLocale()
): string {
	return formatters.formatNumber(value, options, locale);
}

export function formatDate(
	date: Date | string | number | null | undefined,
	options?: Intl.DateTimeFormatOptions,
	locale = formattingLocale()
): string {
	return formatters.formatDate(date, options, locale);
}

export function formatDateTime(
	date: Date | string | number | null | undefined,
	locale = formattingLocale()
): string {
	return formatters.formatDateTime(date, locale);
}

export function formatRelativeTime(
	date: Date | string | number,
	locale = formattingLocale()
): string {
	return formatters.formatRelativeTime(date, locale);
}
