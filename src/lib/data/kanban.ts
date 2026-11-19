import type { Column } from '#lib/features/kanban/board.ts';

/** Seed data; each mounted board clones its own tasks. */
export const demoColumns: Column[] = [
	{
		id: 'backlog',
		title: 'Backlog',
		tasks: [
			{
				id: 't-1',
				title: 'Research competitor onboarding flows',
				description: 'Audit 5 SaaS dashboards and note patterns worth borrowing.',
				priority: 'low',
				label: 'Research',
				assignee: 'Mia Chen',
				comments: 2,
				attachments: 1
			},
			{
				id: 't-2',
				title: 'Draft Q3 roadmap proposal',
				priority: 'medium',
				label: 'Planning',
				assignee: 'Noah Patel',
				comments: 4,
				attachments: 0
			},
			{
				id: 't-3',
				title: 'Collect feedback on pricing page',
				description: 'Pull the latest support tickets mentioning plans.',
				priority: 'low',
				label: 'Growth',
				assignee: 'Ava Romero',
				comments: 1,
				attachments: 2
			}
		]
	},
	{
		id: 'todo',
		title: 'To do',
		tasks: [
			{
				id: 't-4',
				title: 'Design empty states for reports',
				priority: 'medium',
				label: 'Design',
				assignee: 'Liam Wright',
				comments: 3,
				attachments: 1
			},
			{
				id: 't-5',
				title: 'Set up CSV export for invoices',
				description: 'Reuse the shared export helper across billing.',
				priority: 'high',
				label: 'Billing',
				assignee: 'Sofia Müller',
				comments: 0,
				attachments: 0
			}
		]
	},
	{
		id: 'in-progress',
		title: 'In progress',
		tasks: [
			{
				id: 't-6',
				title: 'Build Kanban drag-and-drop',
				description: 'Native HTML5 DnD, no external libraries.',
				priority: 'high',
				label: 'Feature',
				assignee: 'Ethan Brooks',
				comments: 6,
				attachments: 3
			},
			{
				id: 't-7',
				title: 'Refine dark-mode token contrast',
				priority: 'medium',
				label: 'Design',
				assignee: 'Olivia Park',
				comments: 2,
				attachments: 0
			},
			{
				id: 't-8',
				title: 'Migrate settings form to runes',
				priority: 'low',
				label: 'Refactor',
				assignee: 'Noah Patel',
				comments: 1,
				attachments: 0
			}
		]
	},
	{
		id: 'review',
		title: 'Review',
		tasks: [
			{
				id: 't-9',
				title: 'Audit table accessibility',
				description: 'Keyboard focus order and ARIA roles for DataTable.',
				priority: 'high',
				label: 'A11y',
				assignee: 'Mia Chen',
				comments: 5,
				attachments: 1
			},
			{
				id: 't-10',
				title: 'Copy review for empty states',
				priority: 'low',
				label: 'Content',
				assignee: 'Ava Romero',
				comments: 2,
				attachments: 0
			}
		]
	},
	{
		id: 'done',
		title: 'Done',
		tasks: [
			{
				id: 't-11',
				title: 'Ship command menu',
				priority: 'medium',
				label: 'Feature',
				assignee: 'Ethan Brooks',
				comments: 8,
				attachments: 2
			},
			{
				id: 't-12',
				title: 'Localize navigation labels',
				priority: 'low',
				label: 'i18n',
				assignee: 'Sofia Müller',
				comments: 1,
				attachments: 0
			}
		]
	}
];
