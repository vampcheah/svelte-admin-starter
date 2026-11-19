import { describe, expect, it } from 'vitest';
import { demoColumns } from '#lib/data/kanban.ts';
import { moveTask, type Column, type Task } from './board';
import { insertionIndex, KanbanState } from './state.svelte';

const details: Omit<Task, 'id'> = {
	title: 'New task',
	priority: 'low',
	label: '',
	assignee: '',
	comments: 0,
	attachments: 0
};

const initial: Column[] = [
	{
		id: 'a',
		title: 'A',
		tasks: [
			{ ...details, id: 't-1' },
			{ ...details, id: 't-2' }
		]
	},
	{ id: 'b', title: 'B', tasks: [{ ...details, id: 't-3' }] }
];

const ids = (board: KanbanState) =>
	board.columns.map((column) => column.tasks.map((task) => task.id));

describe('kanban state', () => {
	it('isolates tasks, additions, drag state and selection between mounted boards', () => {
		const fixture = structuredClone(demoColumns);
		const first = new KanbanState();
		const second = new KanbanState();
		first.columns[0]!.tasks[0]!.title = 'Local title';
		first.addTask('backlog', details);
		first.startDrag('t-1', 'backlog');
		first.targetDrop('done', 0);
		expect(second.columns).toEqual(fixture);
		expect(second.dragging).toBeNull();
		expect(second.dropTarget).toBeNull();
		expect(second.activeColumnId).toBe('backlog');
		expect(demoColumns).toEqual(fixture);
	});

	it('uses insertion-after-removal semantics for drag moves and keyboard reordering', () => {
		const dragged = new KanbanState(initial);
		const keyboard = new KanbanState(initial);
		dragged.startDrag('t-2', 'a');
		dragged.targetDrop('b', 0);
		dragged.drop();
		expect(keyboard.move('t-2', 'a', 'b', 0)).toBe(true);
		expect(ids(dragged)).toEqual([['t-1'], ['t-2', 't-3']]);
		expect(keyboard.columns).toEqual(dragged.columns);
		expect(dragged.dragging).toBeNull();
		expect(dragged.dropTarget).toBeNull();
		expect(keyboard.activeColumnId).toBe('b');

		keyboard.move('t-2', 'b', 'b', 1);
		expect(ids(keyboard)).toEqual([['t-1'], ['t-3', 't-2']]);
		keyboard.move('t-2', 'b', 'b', 0);
		expect(ids(keyboard)).toEqual([['t-1'], ['t-2', 't-3']]);
	});

	it('appends menu moves using the same helper without changing totals or fixtures', () => {
		const board = new KanbanState(initial);
		const expected = moveTask(board.columns, 't-1', 'a', 'b', 1);
		expect(board.move('t-1', 'a', 'b')).toBe(true);
		expect(board.columns).toEqual(expected);
		expect(board.totalTasks).toBe(3);
		expect(initial[0]!.tasks.map((task) => task.id)).toEqual(['t-1', 't-2']);
		expect(board.move('missing', 'a', 'b')).toBe(false);
		expect(board.move('t-1', 'b', 'missing')).toBe(false);
		expect(board.totalTasks).toBe(3);
	});

	it('allocates unique task ids after seeded and previously added tasks', () => {
		const board = new KanbanState([{ id: 'a', title: 'A', tasks: [{ ...details, id: 't-40' }] }]);
		expect(board.addTask('missing', details)).toBeUndefined();
		expect(board.addTask('a', details)?.id).toBe('t-41');
		board.move('t-41', 'a', 'a', 0);
		expect(board.addTask('a', details)?.id).toBe('t-42');
		expect(new Set(board.columns[0]!.tasks.map((task) => task.id)).size).toBe(3);
		expect(board.totalTasks).toBe(3);
	});

	it('ignores external drags and clears abandoned local drag targets', () => {
		const board = new KanbanState(initial);
		board.targetDrop('b', 0);
		expect(board.dropTarget).toBeNull();
		board.drop();
		expect(ids(board)).toEqual([['t-1', 't-2'], ['t-3']]);
		board.startDrag('t-1', 'a');
		board.targetDrop('b', 0);
		board.endDrag();
		board.drop();
		expect(ids(board)).toEqual([['t-1', 't-2'], ['t-3']]);
	});

	it('supports an empty board', () => {
		const board = new KanbanState([]);
		expect(board.totalTasks).toBe(0);
		expect(board.activeColumnId).toBe('');
		expect(board.addTask('missing', details)).toBeUndefined();
	});
});

describe('drag insertion index', () => {
	it('inserts before a midpoint, between cards, or at the end after the last midpoint', () => {
		expect(insertionIndex([], 100)).toBe(0);
		expect(insertionIndex([30, 80, 130], 10)).toBe(0);
		expect(insertionIndex([30, 80, 130], 30)).toBe(1);
		expect(insertionIndex([30, 80, 130], 100)).toBe(2);
		expect(insertionIndex([30, 80, 130], 150)).toBe(3);
	});
});
