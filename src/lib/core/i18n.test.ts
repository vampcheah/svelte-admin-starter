import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	configureCoreI18n,
	CORE_DEFAULT_MESSAGES,
	coreI18n,
	createI18n,
	interpolate,
	resolveMessage
} from './i18n.svelte';

describe('core i18n helpers', () => {
	it('resolves nested messages and returns undefined for missing keys', () => {
		expect(resolveMessage(CORE_DEFAULT_MESSAGES as Record<string, unknown>, 'common.cancel')).toBe(
			'Cancel'
		);
		expect(
			resolveMessage(CORE_DEFAULT_MESSAGES as Record<string, unknown>, 'dateTimePicker.selectDate')
		).toBe('Select date');
		expect(
			resolveMessage(CORE_DEFAULT_MESSAGES as Record<string, unknown>, 'nonexistent.key')
		).toBeUndefined();
	});

	it('interpolates template variables', () => {
		expect(interpolate('Hello, {name}!', { name: 'World' })).toBe('Hello, World!');
		expect(interpolate('Page {page} of {total}', { page: 1, total: 10 })).toBe('Page 1 of 10');
		expect(interpolate('No placeholders')).toBe('No placeholders');
		expect(interpolate('Missing {var}', {})).toBe('Missing {var}');
	});
});

describe('coreI18n bridge', () => {
	afterEach(() => {
		configureCoreI18n(null);
	});

	it('provides default fallback messages and English locale when unconfigured', () => {
		expect(coreI18n.locale).toBe('en');
		expect(coreI18n.locales).toEqual([{ value: 'en', label: 'English' }]);
		expect(coreI18n.t('common.cancel')).toBe('Cancel');
		expect(coreI18n.t('common.confirm')).toBe('Confirm');
		expect(coreI18n.t('command.title')).toBe('Command Palette');
		expect(coreI18n.t('unknown.key')).toBe('unknown.key');
	});

	it('delegates to configured adapter and falls back when adapter returns key', () => {
		let currentLocale = 'zh-CN';
		const customLocales = [
			{ value: 'en', label: 'English' },
			{ value: 'zh-CN', label: '简体中文' }
		];
		const adapter = {
			get locale() {
				return currentLocale;
			},
			locales: customLocales,
			t(key: string, values?: Record<string, string | number>) {
				if (key === 'common.cancel') return currentLocale === 'zh-CN' ? '取消' : 'Cancel';
				if (key === 'custom.greeting') return `你好, ${values?.name ?? ''}`;
				return key;
			},
			setLocale(loc: string) {
				currentLocale = loc;
			}
		};

		configureCoreI18n(adapter);

		expect(coreI18n.locale).toBe('zh-CN');
		expect(coreI18n.locales).toEqual(customLocales);
		expect(coreI18n.t('common.cancel')).toBe('取消');
		expect(coreI18n.t('custom.greeting', { name: 'Alice' })).toBe('你好, Alice');

		// Falls back to CORE_DEFAULT_MESSAGES when adapter returns key
		expect(coreI18n.t('common.confirm')).toBe('Confirm');

		coreI18n.setLocale('en');
		expect(coreI18n.locale).toBe('en');
		expect(coreI18n.t('common.cancel')).toBe('Cancel');

		// Reset adapter
		configureCoreI18n(null);
		expect(coreI18n.locale).toBe('en');
		expect(coreI18n.t('common.cancel')).toBe('Cancel');
	});
});

describe('createI18n', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn(() => null),
			setItem: vi.fn()
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('creates an independent i18n instance with storage persistence', () => {
		const dicts = {
			en: { hello: 'Hello', greet: 'Hello {name}' },
			fr: { hello: 'Bonjour', greet: 'Bonjour {name}' }
		};

		const instance = createI18n(dicts, 'en', 'test:locale');

		expect(instance.state.locale).toBe('en');
		expect(instance.t('hello')).toBe('Hello');
		expect(instance.t('greet', { name: 'Jean' })).toBe('Hello Jean');

		instance.setLocale('fr');
		expect(instance.state.locale).toBe('fr');
		expect(instance.t('hello')).toBe('Bonjour');
		expect(localStorage.setItem).toHaveBeenCalledWith('test:locale', 'fr');

		vi.mocked(localStorage.getItem).mockReturnValue('fr');
		instance.init();
		expect(instance.state.locale).toBe('fr');
	});
});
