import { CalendarDate } from '@internationalized/date';
import { render } from 'svelte/server';
import { afterEach, describe, expect, it } from 'vitest';
import { setLocale } from '#lib/i18n/index.ts';
import DatePicker from './DatePicker.svelte';
import DateRangePicker from './DateRangePicker.svelte';
import DateTimePicker from './DateTimePicker.svelte';
import TimePicker from './TimePicker.svelte';

afterEach(() => setLocale('en'));

const pickers = [
	{ name: 'DatePicker', component: DatePicker, placeholder: '选择日期' },
	{ name: 'DateRangePicker', component: DateRangePicker, placeholder: '选择日期范围' },
	{ name: 'DateTimePicker', component: DateTimePicker, placeholder: '选择日期和时间' },
	{ name: 'TimePicker', component: TimePicker, placeholder: '选择时间' }
];

describe.each(pickers)('$name trigger', ({ component, placeholder }) => {
	it('keeps the form label, validation state, and popover state on the same button', () => {
		const body = render(component, {
			props: {
				id: 'appointment',
				open: true,
				required: true,
				'aria-label': 'Choose appointment',
				'aria-invalid': true,
				'aria-describedby': 'appointment-help appointment-error'
			}
		}).body;
		const trigger = body.match(/<button\b[^>]*>/)?.[0];

		expect(trigger).toContain('id="appointment"');
		expect(trigger).toContain('aria-label="Choose appointment"');
		expect(trigger).toContain('aria-required="true"');
		expect(trigger).toContain('aria-invalid="true"');
		expect(trigger).toContain('aria-describedby="appointment-help appointment-error"');
		expect(trigger).toContain('aria-haspopup="dialog"');
		expect(trigger).toContain('aria-expanded="true"');
	});

	it('uses localized button text without overriding an associated form label', () => {
		setLocale('zh-CN');
		const body = render(component).body;

		expect(body.match(/<button\b[^>]*>/)?.[0]).not.toContain('aria-label');
		expect(body).toContain(`>${placeholder}</span>`);
		expect(body).toContain('aria-expanded="false"');
		expect(body).not.toContain('type="hidden"');
		expect(body.match(/<button\b[^>]*>/)?.[0]).not.toContain('aria-describedby');
	});

	it('preserves custom placeholder and disabled form controls', () => {
		const body = render(component, {
			props: { placeholder: 'Choose a value', name: 'appointment', disabled: true }
		}).body;
		const trigger = body.match(/<button\b[^>]*>/)?.[0];
		const hiddenInputs = body.match(/<input\b[^>]*>/g) ?? [];

		expect(trigger).toContain('disabled');
		expect(body).toContain('>Choose a value</span>');
		expect(hiddenInputs.length).toBeGreaterThan(0);
		for (const input of hiddenInputs) {
			expect(input).toContain('type="hidden"');
			expect(input).toContain('disabled');
		}
	});
});

describe('picker display and form values', () => {
	it('formats date and time labels without changing their submitted values', () => {
		const date = render(DatePicker, {
			props: { value: '2026-07-15', locale: 'en-US', name: 'date' }
		}).body;
		const time = render(TimePicker, {
			props: { value: '13:30', locale: 'en-US', hour12: false, name: 'time' }
		}).body;
		const dateTime = render(DateTimePicker, {
			props: {
				value: '2026-07-15T13:30',
				locale: 'en-US',
				hour12: false,
				name: 'dateTime'
			}
		}).body;

		expect(date).toContain('>Jul 15, 2026</span>');
		expect(time).toContain('>13:30</span>');
		expect(dateTime).toContain('>Jul 15, 2026, 13:30</span>');
		expect(date).toMatch(/<input[^>]*name="date"[^>]*value="2026-07-15"/);
		expect(time).toMatch(/<input[^>]*name="time"[^>]*value="13:30"/);
		expect(dateTime).toMatch(/<input[^>]*name="dateTime"[^>]*value="2026-07-15T13:30"/);
	});

	it('keeps partial and complete ranges in separate start/end form fields', () => {
		const start = new CalendarDate(2026, 7, 1);
		const partial = render(DateRangePicker, {
			props: { value: { start, end: undefined }, locale: 'en-US', name: 'range' }
		}).body;
		const complete = render(DateRangePicker, {
			props: {
				value: { start, end: new CalendarDate(2026, 7, 15) },
				locale: 'en-US',
				name: 'range'
			}
		}).body;

		expect(partial).toContain('>Jul 1, 2026</span>');
		expect(partial).toMatch(/<input[^>]*name="range_start"[^>]*value="2026-07-01"/);
		expect(partial).toMatch(/<input[^>]*name="range_end"[^>]*value=""/);
		expect(complete).toContain('>Jul 1, 2026 – Jul 15, 2026</span>');
		expect(complete).toMatch(/<input[^>]*name="range_start"[^>]*value="2026-07-01"/);
		expect(complete).toMatch(/<input[^>]*name="range_end"[^>]*value="2026-07-15"/);
	});
});
