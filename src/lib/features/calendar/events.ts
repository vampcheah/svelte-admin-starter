import { demoCalendarEvents } from '#lib/data/calendar.ts';
import { ymd } from '#lib/calendar.ts';
import type { CalendarEvent, EventSeed } from './types';

/** Keep each seed day where possible, clamping only to the actual month's last day. */
export function createEvents(
	year: number,
	month: number,
	seeds: readonly EventSeed[] = demoCalendarEvents
): CalendarEvent[] {
	const lastDay = new Date(year, month + 1, 0).getDate();
	return seeds.map((seed, index) => {
		const date = new Date(year, month, Math.max(1, Math.min(seed.day, lastDay)));
		return {
			id: `evt-${index}`,
			title: seed.title,
			category: seed.category,
			time: seed.time,
			date,
			dateKey: ymd(date)
		};
	});
}

function compareEvents(a: CalendarEvent, b: CalendarEvent): number {
	return a.dateKey.localeCompare(b.dateKey) || (a.time ?? '99:99').localeCompare(b.time ?? '99:99');
}

export function groupEventsByDay(events: readonly CalendarEvent[]): Map<string, CalendarEvent[]> {
	const groups = new Map<string, CalendarEvent[]>();
	for (const event of events) {
		const bucket = groups.get(event.dateKey);
		if (bucket) bucket.push(event);
		else groups.set(event.dateKey, [event]);
	}
	for (const bucket of groups.values()) bucket.sort(compareEvents);
	return groups;
}

export function countEventsInMonth(
	events: readonly CalendarEvent[],
	year: number,
	month: number
): number {
	return events.filter(
		(event) => event.date.getFullYear() === year && event.date.getMonth() === month
	).length;
}

export function upcomingEvents(
	events: readonly CalendarEvent[],
	todayKey: string,
	limit = 5
): CalendarEvent[] {
	return events
		.filter((event) => event.dateKey >= todayKey)
		.sort(compareEvents)
		.slice(0, limit);
}
