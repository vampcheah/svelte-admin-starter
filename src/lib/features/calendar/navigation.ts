import { ymd } from '#lib/calendar.ts';

export function dateForKey(key: string): Date {
	const [year, month, day] = key.split('-').map(Number);
	const date = new Date(0);
	date.setHours(12, 0, 0, 0);
	date.setFullYear(year, month - 1, day);
	return date;
}

/** Arrow keys move by day/week; Home/End stay in the Sunday-first week. */
export function keyboardDay(key: string, action: string): string | undefined {
	const date = dateForKey(key);
	const offsets: Record<string, number> = {
		ArrowLeft: -1,
		ArrowRight: 1,
		ArrowUp: -7,
		ArrowDown: 7,
		Home: -date.getDay(),
		End: 6 - date.getDay()
	};
	if (action in offsets) date.setDate(date.getDate() + offsets[action]);
	else if (action === 'PageUp' || action === 'PageDown') {
		const day = date.getDate();
		date.setDate(1);
		date.setMonth(date.getMonth() + (action === 'PageUp' ? -1 : 1));
		const last = new Date(date);
		last.setMonth(last.getMonth() + 1, 0);
		date.setDate(Math.min(day, last.getDate()));
	} else return;
	return ymd(date);
}

export function millisecondsUntilTomorrow(now = new Date()): number {
	const next = new Date(now);
	next.setDate(next.getDate() + 1);
	next.setHours(0, 0, 0, 0);
	return next.getTime() - now.getTime();
}
