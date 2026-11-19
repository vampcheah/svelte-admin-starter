import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { LOCALES, setLocale } from '#lib/i18n/index.ts';
import LanguageSelect from './LanguageSelect.svelte';

afterEach(() => setLocale('en'));

describe('settings language control', () => {
	it.each(LOCALES)(
		'renders the active global locale $value with paired field references',
		({ value, label }) => {
			setLocale(value);
			const html = render(LanguageSelect).body;
			const trigger = /<button\b[^>]*data-slot="select-trigger"[^>]*>/.exec(html)?.[0];
			expect(trigger).toBeDefined();
			const id = /\sid="([^"]+)"/.exec(trigger!)![1];
			expect(html).toContain(`for="${id}"`);
			expect(html).toContain(label);
			expect(trigger).toContain('aria-describedby=');
		}
	);
});
