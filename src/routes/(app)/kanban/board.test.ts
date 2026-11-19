import { describe, expect, it } from 'vitest';
import { moveTask, type Column, type Task } from './board';
import { moveTask as featureMoveTask } from '#lib/features/kanban/board.ts';

const task = (id: string): Task => ({
	id,
	title: id,
	priority: 'low',
	label: '',
	assignee: '',
	comments: 0,
	attachments: 0
});

describe('moveTask', () => {
	it('preserves the route-level compatibility import', () => {
		expect(moveTask).toBe(featureMoveTask);
	});

	it('inserts tasks between cards and reorders within a column', () => {
		const columns: Column[] = [
			{ id: 'a', title: 'A', tasks: [task('1'), task('2')] },
			{ id: 'b', title: 'B', tasks: [task('3'), task('4')] }
		];

		const moved = moveTask(columns, '2', 'a', 'b', 1);
		expect(moved.map((column) => column.tasks.map(({ id }) => id))).toEqual([
			['1'],
			['3', '2', '4']
		]);
		expect(moveTask(moved, '4', 'b', 'b', 0)[1]?.tasks.map(({ id }) => id)).toEqual([
			'4',
			'3',
			'2'
		]);
	});

	it('clamps insertion positions without mutating source arrays or duplicating tasks', () => {
		const columns: Column[] = [
			{ id: 'a', title: 'A', tasks: [task('1'), task('2')] },
			{ id: 'b', title: 'B', tasks: [task('3')] }
		];
		const before = structuredClone(columns);
		const first = moveTask(columns, '2', 'a', 'b', -1);
		expect(first[1]!.tasks.map(({ id }) => id)).toEqual(['2', '3']);
		const last = moveTask(first, '2', 'b', 'b', 99);
		expect(last[1]!.tasks.map(({ id }) => id)).toEqual(['3', '2']);
		expect(last.flatMap((column) => column.tasks)).toHaveLength(3);
		expect(columns).toEqual(before);
	});

	it('leaves the board unchanged for an unknown task, source, or destination', () => {
		const columns: Column[] = [{ id: 'a', title: 'A', tasks: [task('1')] }];
		expect(moveTask(columns, 'missing', 'a', 'a', 0)).toBe(columns);
		expect(moveTask(columns, '1', 'missing', 'a', 0)).toBe(columns);
		expect(moveTask(columns, '1', 'a', 'missing', 0)).toBe(columns);
	});
});
