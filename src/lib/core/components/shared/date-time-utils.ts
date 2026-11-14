import {
	CalendarDate,
	Time,
	toCalendarDate,
	toCalendarDateTime,
	type DateValue
} from '@internationalized/date';
import type { DateRange } from 'bits-ui';

export type { DateRange } from 'bits-ui';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;
const DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::([0-5]\d))?$/;

export function parseDateValue(value: string): CalendarDate | undefined {
	const match = DATE_PATTERN.exec(value);
	if (!match) return undefined;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);

	try {
		const date = new CalendarDate(year, month, day);
		return date.toString() === value ? date : undefined;
	} catch {
		return undefined;
	}
}

export function parseTimeValue(value: string): { hour: number; minute: number } | undefined {
	const match = TIME_PATTERN.exec(value);
	if (!match) return undefined;

	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (hour > 23 || minute > 59) return undefined;

	return { hour, minute };
}

/** Accept valid optional seconds and normalize to the pickers' minute precision. */
export function parseDateTimeValue(
	value: string
): { date: CalendarDate; time: string } | undefined {
	const match = DATE_TIME_PATTERN.exec(value);
	if (!match) return undefined;

	const date = parseDateValue(match[1]);
	const time = parseTimeValue(match[2]);
	if (!date || !time) return undefined;

	return { date, time: formatTimeValue(time.hour, time.minute) };
}

/** Calendar bounds are inclusive dates, regardless of the value's calendar or time. */
export function isDateWithinBounds(
	value: DateValue | undefined,
	minValue?: DateValue,
	maxValue?: DateValue
): boolean {
	if (!value) return false;
	const date = toCalendarDate(value);
	return (
		(!minValue || date.compare(toCalendarDate(minValue)) >= 0) &&
		(!maxValue || date.compare(toCalendarDate(maxValue)) <= 0)
	);
}

export function formatTimeValue(hour: number, minute: number): string {
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatDateForDisplay(value: string, locale: string): string {
	const date = parseDateValue(value);
	if (!date) return value;

	return new Intl.DateTimeFormat(locale, {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date.toDate('UTC'));
}

export function formatTimeForDisplay(value: string, locale: string, hour12?: boolean): string {
	const time = parseTimeValue(value);
	if (!time) return value;

	return new Intl.DateTimeFormat(locale, {
		hour: 'numeric',
		minute: '2-digit',
		hour12
	}).format(new Date(2000, 0, 1, time.hour, time.minute));
}

export function formatDateTimeForDisplay(value: string, locale: string, hour12?: boolean): string {
	const parsed = parseDateTimeValue(value);
	if (!parsed) return value;

	const time = parseTimeValue(parsed.time)!;
	return new Intl.DateTimeFormat(locale, {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12
	}).format(toCalendarDateTime(parsed.date, new Time(time.hour, time.minute)).toDate('UTC'));
}

export function dateValueToString(value: DateValue | undefined): string {
	return value?.toString() ?? '';
}

export function currentTimeValue(): string {
	const now = new Date();
	return formatTimeValue(now.getHours(), now.getMinutes());
}

export function formatDateValueForDisplay(date: DateValue | undefined, locale: string): string {
	if (!date) return '';
	return new Intl.DateTimeFormat(locale, {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(toCalendarDate(date).toDate('UTC'));
}

export function formatDateRangeForDisplay(
	range: DateRange | undefined,
	locale: string,
	separator = ' – '
): string {
	if (!range?.start) return '';
	const startStr = formatDateValueForDisplay(range.start, locale);
	if (!range.end) return startStr;
	const endStr = formatDateValueForDisplay(range.end, locale);
	return `${startStr}${separator}${endStr}`;
}

export function parseDateRange(startStr?: string, endStr?: string): DateRange | undefined {
	const start = startStr ? parseDateValue(startStr) : undefined;
	const end = endStr ? parseDateValue(endStr) : undefined;
	if (!start && !end) return undefined;
	return { start, end };
}

export function dateRangeToString(range: DateRange | undefined): { start: string; end: string } {
	return {
		start: range?.start ? dateValueToString(range.start) : '',
		end: range?.end ? dateValueToString(range.end) : ''
	};
}
