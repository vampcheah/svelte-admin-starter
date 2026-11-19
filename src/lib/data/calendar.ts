import type { EventSeed } from '#lib/features/calendar/types.ts';

export const demoCalendarEvents: readonly EventSeed[] = [
	{ day: 2, title: 'Sprint planning', category: 'meeting', time: '09:30' },
	{ day: 5, title: 'Design review', category: 'review', time: '14:00' },
	{ day: 9, title: 'Q3 roadmap sync', category: 'meeting', time: '11:00' },
	{ day: 9, title: 'Invoice deadline', category: 'deadline' },
	{ day: 9, title: 'Dentist', category: 'personal', time: '16:30' },
	{ day: 9, title: '1:1 with Alex', category: 'meeting', time: '17:30' },
	{ day: 14, title: 'Code freeze', category: 'deadline' },
	{ day: 17, title: 'Marketing review', category: 'review', time: '10:00' },
	{ day: 21, title: 'Team offsite', category: 'personal', time: '08:00' },
	{ day: 24, title: 'Release v2.4', category: 'deadline', time: '12:00' },
	{ day: 27, title: 'Budget review', category: 'review', time: '15:00' },
	{ day: 30, title: 'Retro', category: 'meeting', time: '13:00' }
];
