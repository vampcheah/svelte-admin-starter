import { afterEach, describe, expect, it } from 'vitest';
import { fieldError } from '#lib/core/utils/validators.ts';
import { setLocale, t } from '#lib/i18n/index.ts';
import en from './locales/en';
import zhCN from './locales/zh-CN';
import { createProfileSchema } from './schema';

afterEach(() => setLocale('en'));

describe('profile form validation', () => {
	it('normalizes the local profile draft while allowing an empty bio', () => {
		expect(
			createProfileSchema(t).parse({ name: '  Person  ', email: ' person@example.com ', bio: '' })
		).toEqual({ name: 'Person', email: 'person@example.com', bio: '' });
	});

	it.each([
		['en', en],
		['zh-CN', zhCN]
	] as const)('localizes required and malformed account details in %s', (locale, dictionary) => {
		setLocale(locale);
		const empty = createProfileSchema(t).safeParse({ name: ' ', email: ' ', bio: '' });
		const invalid = createProfileSchema(t).safeParse({ name: 'Person', email: 'invalid', bio: '' });
		expect(empty.success).toBe(false);
		expect(invalid.success).toBe(false);
		if (empty.success || invalid.success) return;
		expect(fieldError(empty.error, 'name')).toBe(dictionary.validation.name);
		expect(fieldError(empty.error, 'email')).toBe(dictionary.validation.emailRequired);
		expect(fieldError(invalid.error, 'email')).toBe(dictionary.validation.emailInvalid);
	});
});
