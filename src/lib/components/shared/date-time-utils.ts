import { CalendarDate, type DateValue } from '@internationalized/date';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;
const DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2})?$/;

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

export function formatTimeValue(hour: number, minute: number): string {
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatDateForDisplay(value: string, locale: string): string {
	const date = parseDateValue(value);
	if (!date) return value;

	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(new Date(date.year, date.month - 1, date.day));
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
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12
	}).format(
		new Date(parsed.date.year, parsed.date.month - 1, parsed.date.day, time.hour, time.minute)
	);
}

export function dateValueToString(value: DateValue | undefined): string {
	return value?.toString() ?? '';
}

export function currentTimeValue(): string {
	const now = new Date();
	return formatTimeValue(now.getHours(), now.getMinutes());
}
