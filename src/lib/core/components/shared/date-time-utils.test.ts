import { describe, expect, it } from 'vitest';
import {
	CalendarDate,
	CalendarDateTime,
	HebrewCalendar,
	toCalendar
} from '@internationalized/date';
import {
	dateRangeToString,
	dateValueToString,
	formatDateForDisplay,
	formatDateRangeForDisplay,
	formatDateTimeForDisplay,
	formatDateValueForDisplay,
	formatTimeForDisplay,
	formatTimeValue,
	isDateWithinBounds,
	parseDateRange,
	parseDateTimeValue,
	parseDateValue,
	parseTimeValue
} from './date-time-utils';

describe('date-time-utils', () => {
	it('parses and formats dates', () => {
		const parsed = parseDateValue('2026-07-15');
		expect(parsed).toEqual(new CalendarDate(2026, 7, 15));
		expect(dateValueToString(parsed)).toBe('2026-07-15');
		expect(parseDateValue('invalid')).toBeUndefined();

		const formatted = formatDateForDisplay('2026-07-15', 'en-US');
		expect(formatted).toContain('Jul');
		expect(formatted).toContain('15');
		expect(formatted).toContain('2026');
	});

	it('parses and formats time', () => {
		expect(parseTimeValue('13:30')).toEqual({ hour: 13, minute: 30 });
		expect(parseTimeValue('25:00')).toBeUndefined();
		expect(formatTimeValue(9, 5)).toBe('09:05');
		expect(formatTimeForDisplay('13:30', 'en-US', false)).toContain('13:30');
	});

	it('parses and formats date-time values', () => {
		const parsed = parseDateTimeValue('2026-07-15T13:30');
		expect(parsed?.date).toEqual(new CalendarDate(2026, 7, 15));
		expect(parsed?.time).toBe('13:30');
		expect(parseDateTimeValue('invalid')).toBeUndefined();

		const formatted = formatDateTimeForDisplay('2026-07-15T13:30', 'en-US');
		expect(formatted).toContain('Jul');
		expect(formatted).toContain('2026');
	});

	it('validates optional seconds before normalizing to minute precision', () => {
		expect(parseDateTimeValue('2026-07-15T13:30:59')?.time).toBe('13:30');
		expect(parseDateTimeValue('2026-07-15 13:30:00')?.time).toBe('13:30');
		expect(parseDateTimeValue('2026-07-15T13:30:60')).toBeUndefined();
		expect(parseDateTimeValue('2026-07-15T13:30:99')).toBeUndefined();
		expect(parseDateTimeValue('2026-07-15T13:60:00')).toBeUndefined();
	});

	it('enforces inclusive calendar bounds for manual, current, and existing dates', () => {
		const min = new CalendarDate(2026, 7, 10);
		const max = new CalendarDate(2026, 7, 20);
		expect(isDateWithinBounds(undefined, min, max)).toBe(false);
		expect(isDateWithinBounds(new CalendarDate(2026, 7, 9), min, max)).toBe(false);
		expect(isDateWithinBounds(min, min, max)).toBe(true);
		expect(isDateWithinBounds(max, min, max)).toBe(true);
		expect(isDateWithinBounds(new CalendarDate(2026, 7, 21), min, max)).toBe(false);
		expect(isDateWithinBounds(new CalendarDate(2026, 7, 15))).toBe(true);
		expect(isDateWithinBounds(new CalendarDateTime(2026, 7, 20, 23, 59), min, max)).toBe(true);
		expect(isDateWithinBounds(toCalendar(min, new HebrewCalendar()), min, max)).toBe(true);
	});

	it('formats early years and other calendars without JavaScript year offsets', () => {
		expect(formatDateForDisplay('0099-07-15', 'en-US')).toBe('Jul 15, 99');
		expect(formatDateValueForDisplay(new CalendarDate(1, 7, 15), 'en-US')).toBe('Jul 15, 1');
		expect(formatDateTimeForDisplay('0099-07-15T13:30', 'en-US', false)).toBe('Jul 15, 99, 13:30');
		const hebrewDate = toCalendar(new CalendarDate(2026, 7, 15), new HebrewCalendar());
		expect(formatDateValueForDisplay(hebrewDate, 'en-US')).toBe('Jul 15, 2026');
	});

	it('handles DateRange parsing, display formatting and stringifying', () => {
		const start = new CalendarDate(2026, 7, 1);
		const end = new CalendarDate(2026, 7, 15);

		expect(formatDateValueForDisplay(start, 'en-US')).toContain('Jul');
		expect(formatDateValueForDisplay(undefined, 'en-US')).toBe('');

		const range = { start, end };
		const rangeDisplay = formatDateRangeForDisplay(range, 'en-US');
		expect(rangeDisplay).toContain('Jul 1');
		expect(rangeDisplay).toContain('Jul 15');

		const singleDateRange = { start, end: undefined };
		expect(formatDateRangeForDisplay(singleDateRange, 'en-US')).toContain('Jul 1');
		expect(formatDateRangeForDisplay(undefined, 'en-US')).toBe('');

		const stringRange = dateRangeToString(range);
		expect(stringRange).toEqual({ start: '2026-07-01', end: '2026-07-15' });

		const parsedRange = parseDateRange('2026-07-01', '2026-07-15');
		expect(parsedRange?.start).toEqual(start);
		expect(parsedRange?.end).toEqual(end);
		expect(parseDateRange()).toBeUndefined();
	});
});
