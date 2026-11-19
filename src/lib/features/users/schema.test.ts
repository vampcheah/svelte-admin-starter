import { afterEach, describe, expect, it, vi } from 'vitest';
import { fieldError } from '#lib/core/utils/validators.ts';
import { setLocale, t } from '#lib/i18n/index.ts';
import en from '#lib/i18n/locales/en.ts';
import zhCN from '#lib/i18n/locales/zh-CN.ts';
import { createUserSchema } from './schema';

vi.mock('$app/env', () => ({ browser: false }));

afterEach(() => setLocale('en'));

const valid = { name: 'Example', email: 'example@example.com', role: 'viewer', status: 'active' };

describe('user editor schema', () => {
	it('normalizes user details and preserves each supported role and status', () => {
		for (const role of ['admin', 'editor', 'viewer']) {
			for (const status of ['active', 'invited', 'suspended']) {
				expect(
					createUserSchema(t).parse({
						name: '  Example User  ',
						email: '  example@example.com  ',
						role,
						status
					})
				).toEqual({ name: 'Example User', email: 'example@example.com', role, status });
			}
		}
	});

	it.each([
		['en', en],
		['zh-CN', zhCN]
	] as const)('validates required fields and enum values in %s', (locale, dictionary) => {
		setLocale(locale);
		const result = createUserSchema(t).safeParse({
			name: '   ',
			email: '  ',
			role: 'owner',
			status: 'deleted'
		});
		expect(result.success).toBe(false);
		if (result.success) return;
		expect(fieldError(result.error, 'name')).toBe(dictionary.validation.nameRequired);
		expect(fieldError(result.error, 'email')).toBe(dictionary.validation.emailRequired);
		expect(fieldError(result.error, 'role')).toBe(dictionary.validation.roleInvalid);
		expect(fieldError(result.error, 'status')).toBe(dictionary.validation.statusInvalid);
	});

	it('uses the current translator on revalidation and requires a status', () => {
		const invalid = { ...valid, email: 'not-an-email', status: undefined };
		setLocale('en');
		const english = createUserSchema(t).safeParse(invalid);
		setLocale('zh-CN');
		const chinese = createUserSchema(t).safeParse(invalid);
		expect(english.success).toBe(false);
		expect(chinese.success).toBe(false);
		if (english.success || chinese.success) return;
		expect(fieldError(english.error, 'email')).toBe(en.validation.emailInvalid);
		expect(fieldError(chinese.error, 'email')).toBe(zhCN.validation.emailInvalid);
		expect(fieldError(chinese.error, 'status')).toBe(zhCN.validation.statusInvalid);
	});
});
