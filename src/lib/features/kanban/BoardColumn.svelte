<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Badge } from '#lib/core/components/ui/badge/index.ts';
	import { cn } from '#lib/core/utils.ts';
	import { t } from '#lib/i18n/index.ts';
	import type { Column } from './board';
	import { insertionIndex, type DraggedTask, type DropTarget } from './state.svelte';
	import { columnTitle } from './presentation';
	import TaskCard from './TaskCard.svelte';

	interface Props {
		instanceId: string;
		column: Column;
		columns: Column[];
		active: boolean;
		dragging: DraggedTask | null;
		dropTarget: DropTarget | null;
		onSelect: () => void;
		onAdd: () => void;
		onDragStart: (taskId: string) => void;
		onDragEnd: () => void;
		onDragOver: (index: number) => void;
		onDrop: () => void;
		onMove: (taskId: string, columnId: string, index?: number) => void;
	}
	let {
		instanceId,
		column,
		columns,
		active,
		dragging,
		dropTarget,
		onSelect,
		onAdd,
		onDragStart,
		onDragEnd,
		onDragOver,
		onDrop,
		onMove
	}: Props = $props();
	const title = $derived(columnTitle(column));
	const dropTasks = $derived(column.tasks.filter((task) => task.id !== dragging?.taskId));
	const insertBeforeId = $derived(
		dropTarget?.columnId === column.id ? dropTasks[dropTarget.index]?.id : undefined
	);

	function dragOver(event: DragEvent): void {
		if (!dragging) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		const stack = event.currentTarget as HTMLElement;
		const midpoints = Array.from(stack.querySelectorAll<HTMLElement>('[data-task-card]'))
			.filter((card) => card.dataset.taskId !== dragging?.taskId)
			.map((card) => {
				const bounds = card.getBoundingClientRect();
				return bounds.top + bounds.height / 2;
			});
		onDragOver(insertionIndex(midpoints, event.clientY));
	}
</script>

{#snippet insertionMarker()}
	<div
		class="h-24 shrink-0 rounded-lg border-2 border-dashed border-primary/50 bg-primary/10 opacity-70"
		aria-hidden="true"
	></div>
{/snippet}

<section
	id={`${instanceId}-kanban-${column.id}`}
	class={cn(
		'flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/40 transition-all',
		active && 'border-primary/50 bg-primary/10 shadow-sm',
		dropTarget?.columnId === column.id && 'ring-2 ring-primary/40'
	)}
	aria-label={title}
>
	<header class="flex items-center justify-between gap-2 px-3 py-2.5">
		<button
			type="button"
			class="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			onclick={onSelect}
			aria-label={t('kanban.selectColumn', { column: title })}
		>
			<h2 class="text-sm font-semibold text-foreground">{title}</h2>
			<Badge variant="secondary" class="tabular-nums">{column.tasks.length}</Badge>
		</button>
		<Button
			variant="ghost"
			size="icon"
			class="size-7 text-muted-foreground"
			onclick={onAdd}
			aria-label={t('kanban.addTaskTo', { column: title })}
		>
			<Plus class="size-4" aria-hidden="true" />
		</Button>
	</header>

	<div
		class="flex min-h-20 flex-1 flex-col gap-2.5 px-2.5 pb-3"
		role="list"
		aria-label={title}
		ondragover={dragOver}
		ondrop={(event) => {
			event.preventDefault();
			onDrop();
		}}
	>
		{#each column.tasks as task, index (task.id)}
			{#if insertBeforeId === task.id}
				{@render insertionMarker()}
			{/if}
			<TaskCard
				id={`${instanceId}-kanban-task-${task.id}`}
				{task}
				{column}
				{columns}
				{index}
				dragging={dragging?.taskId === task.id}
				{onDragStart}
				{onDragEnd}
				onMove={(columnId, index) => onMove(task.id, columnId, index)}
			/>
		{/each}
		{#if dropTarget?.columnId === column.id && dropTarget.index === dropTasks.length}
			{@render insertionMarker()}
		{/if}
		{#if column.tasks.length === 0 && !dragging}
			<button
				type="button"
				onclick={onAdd}
				class="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-6 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<Plus class="size-3.5" aria-hidden="true" />
				{t('kanban.addTaskEmpty')}
			</button>
		{/if}
	</div>
</section>
