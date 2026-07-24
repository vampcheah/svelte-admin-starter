// Pure month-calendar helpers. Kept out of the .svelte file so the
// svelte/prefer-svelte-reactivity rule (which bans bare Date/Map there) doesn't
// fire — these are throwaway, non-reactive computations.

export interface DayCell {
	day: number;
	key: string; // YYYY-MM-DD
	inMonth: boolean;
	isToday: boolean;
}

export function ymd(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function today(): { year: number; month: number; key: string } {
	const d = new Date();
	return { year: d.getFullYear(), month: d.getMonth(), key: ymd(d) };
}

/** 6×7 grid starting from the Sunday on/before the 1st of the month. */
export function buildGrid(year: number, month: number, todayKey: string): DayCell[] {
	const first = new Date(year, month, 1);
	const start = new Date(first);
	start.setDate(1 - first.getDay());
	return Array.from({ length: 42 }, (_, i) => {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		return {
			day: d.getDate(),
			key: ymd(d),
			inMonth: d.getMonth() === month,
			isToday: ymd(d) === todayKey
		};
	});
}

/** The visible 42-day window as ISO from/to. */
export function visibleRange(year: number, month: number): { from: string; to: string } {
	const first = new Date(year, month, 1);
	const start = new Date(first);
	start.setDate(1 - first.getDay());
	const end = new Date(start);
	end.setDate(start.getDate() + 41);
	return { from: ymd(start), to: ymd(end) };
}

export function shiftMonth(
	year: number,
	month: number,
	delta: number
): { year: number; month: number } {
	const d = new Date(year, month + delta, 1);
	return { year: d.getFullYear(), month: d.getMonth() };
}

export function monthLabel(year: number, month: number, locale: string): string {
	return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
		new Date(year, month, 1)
	);
}

/** Localized short weekday names, Sunday first. */
export function weekdayLabels(locale: string): string[] {
	return Array.from({ length: 7 }, (_, i) =>
		new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 11, 1 + i))
	);
}
