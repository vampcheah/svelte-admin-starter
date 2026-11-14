export interface LocaleOption<L extends string = string> {
	value: L;
	label: string;
}

export type TranslationValues = Record<string, string | number>;

export interface CoreI18nAdapter {
	readonly locale: string;
	readonly locales?: readonly LocaleOption[];
	t(key: string, values?: TranslationValues): string;
	setLocale?(locale: string): void;
}

export const CORE_DEFAULT_MESSAGES = {
	common: {
		cancel: 'Cancel',
		confirm: 'Confirm',
		changeLanguage: 'Change language',
		search: 'Search...',
		openInNewTab: 'Open in new tab',
		guest: 'Guest',
		account: 'Account',
		profile: 'Profile',
		settings: 'Settings',
		logout: 'Log out',
		switchToLightTheme: 'Switch to light theme',
		switchToDarkTheme: 'Switch to dark theme'
	},
	command: {
		title: 'Command Palette',
		description: 'Search for a page to jump to...',
		placeholder: 'Type a command or search...',
		noResults: 'No results found.'
	},
	dateTimePicker: {
		pickDate: 'Pick a date',
		selectDate: 'Select date',
		selectDateRange: 'Select date range',
		pickTime: 'Pick a time',
		selectTime: 'Select time',
		pickDateTime: 'Pick date and time',
		date: 'Date',
		time: 'Time',
		hour: 'Hour',
		minute: 'Minute',
		selectHour: 'Select hour',
		selectMinute: 'Select minute',
		am: 'AM',
		pm: 'PM',
		now: 'Now',
		clear: 'Clear',
		apply: 'Apply',
		close: 'Close'
	},
	nav: {
		home: 'Home',
		untitled: 'Untitled'
	}
} as const;

/** Walk a nested dictionary by a dot-path; return the string leaf or undefined. */
export function resolveMessage(dict: Record<string, unknown>, key: string): string | undefined {
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
export function interpolate(template: string, vars?: TranslationValues): string {
	if (!vars) return template;
	return template.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in vars ? String(vars[name]) : match
	);
}

let activeAdapter = $state<CoreI18nAdapter | null>(null);

export const coreI18n = {
	get locale(): string {
		return activeAdapter?.locale ?? 'en';
	},
	get locales(): readonly LocaleOption[] {
		return activeAdapter?.locales ?? [{ value: 'en', label: 'English' }];
	},
	t(key: string, values?: TranslationValues): string {
		if (activeAdapter) {
			const res = activeAdapter.t(key, values);
			if (res !== key) return res;
		}
		const fallback = resolveMessage(
			CORE_DEFAULT_MESSAGES as unknown as Record<string, unknown>,
			key
		);
		if (fallback !== undefined) {
			return interpolate(fallback, values);
		}
		return key;
	},
	setLocale(locale: string): void {
		activeAdapter?.setLocale?.(locale);
	}
};

export function configureCoreI18n(adapter: CoreI18nAdapter | null): void {
	activeAdapter = adapter;
}

export function createI18n<TDict extends Record<string, unknown>>(
	dictionaries: Record<string, TDict>,
	defaultLocale: string,
	storageKey: string
) {
	let current = $state<string>(defaultLocale);

	function isKnownLocale(val: string | null): val is string {
		return val !== null && Object.hasOwn(dictionaries, val);
	}

	function t(key: string, vars?: TranslationValues): string {
		const dict = dictionaries[current] ?? dictionaries[defaultLocale];
		const template =
			(dict ? resolveMessage(dict, key) : undefined) ??
			(dictionaries[defaultLocale]
				? resolveMessage(dictionaries[defaultLocale], key)
				: undefined) ??
			resolveMessage(CORE_DEFAULT_MESSAGES as unknown as Record<string, unknown>, key) ??
			key;
		return interpolate(template, vars);
	}

	function setLocale(l: string): void {
		current = l;
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem(storageKey, l);
			} catch {
				// Ignore storage errors.
			}
		}
	}

	function init(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const stored = localStorage.getItem(storageKey);
			if (isKnownLocale(stored)) {
				current = stored;
			}
		} catch {
			// Keep default locale
		}
	}

	return {
		state: {
			get locale(): string {
				return current;
			}
		},
		t,
		setLocale,
		init
	};
}
