import type { DateValue } from '@internationalized/date';
import { CalendarDate } from '@internationalized/date';
import { render } from 'svelte/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DatePicker from './DatePicker.svelte';

const calendar = vi.hoisted(() => ({
	change: undefined as ((value: DateValue | undefined) => void) | undefined
}));

vi.mock('../ui/calendar', () => ({
	Calendar: (
		_renderer: unknown,
		props: { onValueChange?: (value: DateValue | undefined) => void }
	) => {
		calendar.change = props.onValueChange;
	}
}));

// Render the normally client-only popover content so tests can exercise calendar callbacks.
vi.mock('../ui/popover', async (importOriginal) => {
	const original = await importOriginal<typeof import('../ui/popover')>();
	const { default: Content } = await import('./PickerContent.test.svelte');
	return { ...original, Content };
});

beforeEach(() => {
	calendar.change = undefined;
});

describe('DatePicker selection mode', () => {
	it('keeps calendar changes as drafts in the default confirmation mode', () => {
		const onValueChange = vi.fn();
		const body = render(DatePicker, { props: { open: true, onValueChange } }).body;
		expect(body).toContain('Apply');
		expect(calendar.change).toBeTypeOf('function');
		calendar.change?.(new CalendarDate(2026, 7, 15));
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('commits immediate selections while enforcing inclusive date bounds', () => {
		const onValueChange = vi.fn();
		const body = render(DatePicker, {
			props: {
				open: true,
				commitOnSelect: true,
				minValue: new CalendarDate(2026, 7, 10),
				maxValue: new CalendarDate(2026, 7, 20),
				onValueChange
			}
		}).body;
		expect(body).not.toContain('>Apply</button>');
		expect(calendar.change).toBeTypeOf('function');
		calendar.change?.(new CalendarDate(2026, 7, 9));
		calendar.change?.(new CalendarDate(2026, 7, 21));
		expect(onValueChange).not.toHaveBeenCalled();
		calendar.change?.(new CalendarDate(2026, 7, 10));
		calendar.change?.(new CalendarDate(2026, 7, 20));
		calendar.change?.(undefined);
		expect(onValueChange.mock.calls).toEqual([['2026-07-10'], ['2026-07-20'], ['']]);
	});
});
