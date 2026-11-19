import { demoColumns } from '#lib/data/kanban.ts';
import { moveTask, type Column, type Task } from './board';

export interface DraggedTask {
	taskId: string;
	fromColumn: string;
}

export interface DropTarget {
	columnId: string;
	index: number;
}

/** The insertion index is measured after excluding the dragged task. */
export function insertionIndex(midpoints: readonly number[], pointerY: number): number {
	const index = midpoints.findIndex((midpoint) => pointerY < midpoint);
	return index === -1 ? midpoints.length : index;
}

/** Isolated local state for one mounted board. */
export class KanbanState {
	columns = $state<Column[]>([]);
	dragging = $state<DraggedTask | null>(null);
	dropTarget = $state<DropTarget | null>(null);
	activeColumnId = $state('');
	#nextId = 1;

	constructor(initial: readonly Column[] = demoColumns) {
		this.columns = initial.map((column) => ({
			...column,
			tasks: column.tasks.map((task) => ({ ...task }))
		}));
		this.activeColumnId = this.columns[0]?.id ?? '';
		this.#nextId = this.columns.reduce(
			(highest, column) =>
				column.tasks.reduce((next, task) => {
					const match = /^t-(\d+)$/.exec(task.id);
					return match ? Math.max(next, Number(match[1]) + 1) : next;
				}, highest),
			1
		);
	}

	get totalTasks(): number {
		return this.columns.reduce((sum, column) => sum + column.tasks.length, 0);
	}

	addTask(columnId: string, details: Omit<Task, 'id'>): Task | undefined {
		if (!this.columns.some((column) => column.id === columnId)) return;
		const task = { ...details, id: `t-${this.#nextId++}` };
		this.columns = this.columns.map((column) =>
			column.id === columnId ? { ...column, tasks: [...column.tasks, task] } : column
		);
		return task;
	}

	move(taskId: string, fromColumn: string, toColumn: string, index?: number): boolean {
		const target = this.columns.find((column) => column.id === toColumn);
		if (!target) return false;
		const next = moveTask(this.columns, taskId, fromColumn, toColumn, index ?? target.tasks.length);
		if (next === this.columns) return false;
		this.columns = next;
		this.activeColumnId = toColumn;
		return true;
	}

	startDrag(taskId: string, fromColumn: string): void {
		this.dragging = { taskId, fromColumn };
		this.dropTarget = null;
	}

	targetDrop(columnId: string, index: number): void {
		if (!this.dragging) return;
		this.dropTarget = { columnId, index };
		this.activeColumnId = columnId;
	}

	endDrag(): void {
		this.dragging = null;
		this.dropTarget = null;
	}

	drop(): void {
		if (this.dragging && this.dropTarget) {
			this.move(
				this.dragging.taskId,
				this.dragging.fromColumn,
				this.dropTarget.columnId,
				this.dropTarget.index
			);
		}
		this.endDrag();
	}
}
