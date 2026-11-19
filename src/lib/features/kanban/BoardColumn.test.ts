import { render } from 'svelte/server';
import { afterEach, describe, expect, it } from 'vitest';
import { setLocale } from '#lib/i18n/index.ts';
import { demoColumns } from '#lib/data/kanban.ts';
import BoardColumn from './BoardColumn.svelte';

afterEach(() => setLocale('en'));

function renderColumn(instanceId: string) {
	return render(BoardColumn, {
		props: {
			instanceId,
			column: demoColumns[0]!,
			columns: demoColumns,
			active: true,
			dragging: null,
			dropTarget: null,
			onSelect: () => {},
			onAdd: () => {},
			onDragStart: () => {},
			onDragEnd: () => {},
			onDragOver: () => {},
			onDrop: () => {},
			onMove: () => {}
		}
	}).body;
}

describe('kanban card controls', () => {
	it('keeps draggable task cards and exposes a named native movement menu button', () => {
		const html = renderColumn('first');
		expect(html).toContain('data-task-id="t-1"');
		expect(html).toContain('draggable="true"');
		expect(html).toContain('role="listitem"');
		const trigger = html.match(/<button[^>]*id="first-kanban-task-t-1-move"[^>]*>/)?.[0];
		expect(trigger).toContain('aria-haspopup="menu"');
		expect(trigger).toContain('aria-label="Move Research competitor onboarding flows to column"');
	});

	it('namespaces column, task and menu ids per mounted board', () => {
		const first = renderColumn('first');
		const second = renderColumn('second');
		for (const suffix of ['kanban-backlog', 'kanban-task-t-1', 'kanban-task-t-1-move']) {
			expect(first).toContain(`id="first-${suffix}"`);
			expect(second).toContain(`id="second-${suffix}"`);
			expect(second).not.toContain(`id="first-${suffix}"`);
		}
	});

	it('localizes column navigation, movement labels and task priority', () => {
		setLocale('zh-CN');
		const html = renderColumn('translated');
		expect(html).toContain('aria-label="待规划"');
		expect(html).toContain('aria-label="向待规划添加任务"');
		expect(html).toContain('aria-label="将Research competitor onboarding flows移动到列"');
		expect(html).toMatch(/>\s*低<!/);
	});
});
