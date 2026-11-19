// Lightweight i18n. Reactive `locale`, dot-path `t()` lookups with {var}
// interpolation, and persistence to localStorage 'admin-starter:locale'.
// No external i18n library — just plain dictionaries.

import { browser } from '$app/env';
import { config } from '#lib/config/index.ts';
import { configureCoreI18n } from '#lib/core/i18n.svelte.ts';
import en from './locales/en';
import zhCN from './locales/zh-CN';
import type { Dictionary, Locale, TranslationKey, TranslationValues } from './types';

export type { Dictionary, Locale, TranslationKey, TranslationValues } from './types';

export const LOCALES: { value: Locale; label: string }[] = [
	{ value: 'en', label: 'English' },
	{ value: 'zh-CN', label: '简体中文' }
];

const LOCALE_KEY = 'admin-starter:locale';

const dictionaries: Record<Locale, Dictionary> = {
	en,
	'zh-CN': zhCN
};

function isLocale(value: string | null): value is Locale {
	return value === 'en' || value === 'zh-CN';
}

/** Walk a nested dictionary by a dot-path; return the string leaf or undefined. */
function resolve(dict: Dictionary, key: string): string | undefined {
	let node: unknown = dict;
	for (const segment of key.split('.')) {
		if (node && typeof node === 'object' && Object.hasOwn(node, segment)) {
			node = (node as Record<string, unknown>)[segment];
		} else {
			return undefined;
		}
	}
	return typeof node === 'string' ? node : undefined;
}

/** Replace {var} placeholders with provided values. */
function interpolate(template: string, vars?: TranslationValues): string {
	if (!vars) return template;
	return template.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in vars ? String(vars[name]) : match
	);
}

let current = $state<Locale>(config.i18n.defaultLocale);

/**
 * Translate a dot-path key for the active locale. Falls back to the `en`
 * dictionary, then to the key itself when no entry exists.
 */
export function translate(key: string, vars?: TranslationValues): string {
	const template = resolve(dictionaries[current], key) ?? resolve(dictionaries.en, key) ?? key;
	return interpolate(template, vars);
}

/** Typed app lookups; `translate` also accepts dynamic and portable-core keys. */
export function t(key: TranslationKey, vars?: TranslationValues): string {
	return translate(key, vars);
}

export const i18n: { readonly locale: Locale } = {
	get locale(): Locale {
		return current;
	}
};

/** Set the active locale and persist the choice. */
export function setLocale(l: Locale): void {
	current = l;
	if (browser) {
		try {
			localStorage.setItem(LOCALE_KEY, l);
		} catch {
			// Ignore storage errors.
		}
	}
}

/** Restore the persisted locale. Call from the root layout's onMount. */
export function initLocale(): void {
	if (!browser) return;
	try {
		const stored = localStorage.getItem(LOCALE_KEY);
		if (isLocale(stored)) current = stored;
	} catch {
		// Keep the default locale.
	}
}

configureCoreI18n({
	get locale() {
		return current;
	},
	locales: LOCALES,
	t: translate,
	setLocale: (l: string) => {
		if (isLocale(l)) setLocale(l);
	}
});
