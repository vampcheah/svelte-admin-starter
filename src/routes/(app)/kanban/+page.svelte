<!-- Kanban board with native drag insertion and keyboard task movement. -->
<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Badge } from '#lib/core/components/ui/badge/index.ts';
	import { t } from '#lib/i18n/index.ts';
	import BoardColumn from '#lib/features/kanban/BoardColumn.svelte';
	import { KanbanState } from '#lib/features/kanban/state.svelte.ts';
	import { columnTitle } from '#lib/features/kanban/presentation.ts';

	const instanceId = $props.id();
	const board = new KanbanState();
	let announcement = $state('');

	function jumpToColumn(columnId: string): void {
		board.activeColumnId = columnId;
		document
			.getElementById(`${instanceId}-kanban-${columnId}`)
			?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
	}

	function addTask(columnId: string | undefined): void {
		if (!columnId) return;
		const task = board.addTask(columnId, {
			title: t('kanban.newTask'),
			description: t('kanban.newTaskDescription'),
			priority: 'low',
			label: t('kanban.untitled'),
			assignee: t('kanban.unassigned'),
			comments: 0,
			attachments: 0
		});
		const column = board.columns.find((column) => column.id === columnId);
		if (!task || !column) return;
		toast.success(t('kanban.taskAdded'), {
			description: t('kanban.taskAddedDescription', { column: columnTitle(column) })
		});
	}

	async function moveTask(
		taskId: string,
		fromColumn: string,
		toColumn: string,
		index?: number
	): Promise<void> {
		if (!board.move(taskId, fromColumn, toColumn, index)) return;
		const column = board.columns.find((column) => column.id === toColumn)!;
		const task = column.tasks.find((task) => task.id === taskId)!;
		announcement = t('kanban.taskMoved', {
			task: task.title,
			column: columnTitle(column),
			position: column.tasks.indexOf(task) + 1
		});
		await tick();
		jumpToColumn(toColumn);
		document.getElementById(`${instanceId}-kanban-task-${taskId}-move`)?.focus();
	}
</script>

<PageContainer>
	<PageHeader title={t('kanban.title')} description={t('kanban.description')}>
		{#snippet actions()}
			<Button onclick={() => addTask(board.columns[0]?.id)}>
				<Plus class="size-4" aria-hidden="true" />
				{t('kanban.addTask')}
			</Button>
		{/snippet}
	</PageHeader>

	<div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
		<span>{t('kanban.summary', { tasks: board.totalTasks, stages: board.columns.length })}</span>
		<span aria-hidden="true">·</span>
		<span>{t('kanban.moveHint')}</span>
	</div>

	<div
		role="group"
		aria-label={t('kanban.columnNavigation')}
		class="no-scrollbar flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1"
	>
		{#each board.columns as column (column.id)}
			<Button
				variant={board.activeColumnId === column.id ? 'secondary' : 'ghost'}
				size="sm"
				aria-pressed={board.activeColumnId === column.id}
				onclick={() => jumpToColumn(column.id)}
			>
				{columnTitle(column)}
				<Badge variant="secondary" class="tabular-nums">{column.tasks.length}</Badge>
			</Button>
		{/each}
	</div>

	<div class="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
		{#each board.columns as column (column.id)}
			<BoardColumn
				{instanceId}
				{column}
				columns={board.columns}
				active={board.activeColumnId === column.id}
				dragging={board.dragging}
				dropTarget={board.dropTarget}
				onSelect={() => jumpToColumn(column.id)}
				onAdd={() => addTask(column.id)}
				onDragStart={(taskId) => board.startDrag(taskId, column.id)}
				onDragEnd={() => board.endDrag()}
				onDragOver={(index) => board.targetDrop(column.id, index)}
				onDrop={() => board.drop()}
				onMove={(taskId, target, index) => moveTask(taskId, column.id, target, index)}
			/>
		{/each}
	</div>
	<p role="status" class="sr-only">{announcement}</p>
</PageContainer>
