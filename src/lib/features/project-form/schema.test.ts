import { CalendarDate } from '@internationalized/date';
import { afterEach, describe, expect, it } from 'vitest';
import { fieldError } from '#lib/core/utils/validators.ts';
import { setLocale, t } from '#lib/i18n/index.ts';
import en from './locales/en';
import zhCN from './locales/zh-CN';
import { createProjectSchema } from './schema';

afterEach(() => setLocale('en'));

const minDate = new CalendarDate(2026, 7, 15);
const valid = {
	name: '  New project  ',
	description: '  Useful work  ',
	category: 'web',
	stack: ['svelte'],
	visibility: 'team',
	dueDate: '2026-07-15',
	priority: 50
};

describe('project form validation', () => {
	it('trims project text and accepts the earliest available due date', () => {
		expect(createProjectSchema(t, minDate).parse(valid)).toEqual({
			...valid,
			name: 'New project',
			description: 'Useful work'
		});
	});

	it.each([
		['en', en],
		['zh-CN', zhCN]
	] as const)('uses current %s messages for all invalid project fields', (locale, dictionary) => {
		setLocale(locale);
		const result = createProjectSchema(t, minDate).safeParse({
			name: '  ',
			description: 'x'.repeat(281),
			category: '',
			stack: [],
			visibility: 'unknown',
			dueDate: '',
			priority: 101
		});
		expect(result.success).toBe(false);
		if (result.success) return;
		for (const key of [
			'name',
			'description',
			'category',
			'stack',
			'visibility',
			'dueDate',
			'priority'
		] as const) {
			expect(fieldError(result.error, key)).toBe(dictionary.validation[key]);
		}
	});

	it.each(['2026-07-14', '2026-02-30', 'invalid'])('rejects unavailable date %s', (dueDate) => {
		const result = createProjectSchema(t, minDate).safeParse({ ...valid, dueDate });
		expect(result.success).toBe(false);
		if (result.success) return;
		expect(fieldError(result.error, 'dueDate')).toBe(en.validation.dueDateInvalid);
	});
});
