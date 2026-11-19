import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import en from './locales/en';
import zhCN from './locales/zh-CN';
import { i18n, initLocale, setLocale, t, translate } from './index.svelte';
import {
	formatCurrency,
	formatDate,
	formatDateTime,
	formatNumber,
	formatRelativeTime
} from './formatters';

vi.mock('$app/env', () => ({ browser: true }));

function leaves(dictionary: object, prefix = ''): Record<string, string> {
	return Object.fromEntries(
		Object.entries(dictionary).flatMap(([key, value]) => {
			const path = prefix ? `${prefix}.${key}` : key;
			return typeof value === 'string'
				? [[path, value]]
				: Object.entries(leaves(value as object, path));
		})
	);
}

beforeEach(() => {
	vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() });
	setLocale('en');
});

afterEach(() => {
	setLocale('en');
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('translation dictionaries', () => {
	it('provides the same keys and interpolation variables in both languages', () => {
		const english = leaves(en);
		const chinese = leaves(zhCN);
		expect(Object.keys(chinese).sort()).toEqual(Object.keys(english).sort());
		for (const [key, value] of Object.entries(english)) {
			const placeholders = (text: string) =>
				[...new Set([...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]))].sort();
			expect(chinese[key].trim(), key).not.toBe('');
			expect(placeholders(chinese[key]), key).toEqual(placeholders(value));
		}
	});

	it('switches labels and interpolates values in the live locale', () => {
		expect(t('nav.dashboard')).toBe('Dashboard');
		expect(t('table.goToPage', { n: 3 })).toBe('Go to page 3');
		setLocale('zh-CN');
		expect(t('nav.dashboard')).toBe('仪表盘');
		expect(t('tabs.tableTitle', { title: '订单' })).toBe('表格：订单');
		expect(t('auth.errors.passwordTooShort', { min: 12 })).toContain('12');
		expect(t('table.goToPage', { n: 3 })).toBe('前往第 3 页');
	});

	it('keeps the portable translator bridge safe for unknown or inherited keys', () => {
		expect(translate('missing.key')).toBe('missing.key');
		expect(translate('constructor.name')).toBe('constructor.name');
		expect(translate('common')).toBe('common');
	});

	it('restores a supported saved locale and ignores unsupported values', () => {
		vi.mocked(localStorage.getItem).mockReturnValue('fr');
		initLocale();
		expect(i18n.locale).toBe('en');
		vi.mocked(localStorage.getItem).mockReturnValue('zh-CN');
		initLocale();
		expect(i18n.locale).toBe('zh-CN');
	});
});

describe('app formatting defaults', () => {
	it('follows locale changes without changing the requested currency', () => {
		const date = new Date('2026-06-09T12:00:00Z');
		expect(formatDate(date, { timeZone: 'UTC', dateStyle: 'long' })).toBe('June 9, 2026');
		expect(formatCurrency(1234.5)).toBe('$1,234.50');
		setLocale('zh-CN');
		expect(formatDate(date, { timeZone: 'UTC', dateStyle: 'long' })).toBe('2026年6月9日');
		expect(formatCurrency(1234.5)).toBe('US$1,234.50');
		expect(formatNumber(1234.5, undefined, 'de-DE')).toBe('1.234,5');
		expect(formatDateTime('invalid')).toBe('');
	});

	it('formats relative time in the current locale', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-06-10T12:00:00Z'));
		expect(formatRelativeTime('2026-06-09T12:00:00Z')).toBe('yesterday');
		setLocale('zh-CN');
		expect(formatRelativeTime('2026-06-09T12:00:00Z')).toBe('昨天');
	});
});
