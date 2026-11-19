<script lang="ts">
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import SignalLow from '@lucide/svelte/icons/signal-low';
	import SignalMedium from '@lucide/svelte/icons/signal-medium';
	import SignalHigh from '@lucide/svelte/icons/signal-high';
	import StatusBadge from '#lib/core/components/shared/StatusBadge.svelte';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import * as Avatar from '#lib/core/components/ui/avatar/index.ts';
	import * as DropdownMenu from '#lib/core/components/ui/dropdown-menu/index.ts';
	import { Badge } from '#lib/core/components/ui/badge/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { cn } from '#lib/core/utils.ts';
	import { t } from '#lib/i18n/index.ts';
	import { initials } from '#lib/i18n/formatters.ts';
	import type { Column, Task } from './board';
	import { columnTitle, PRIORITY_TONE } from './presentation';

	interface Props {
		id: string;
		task: Task;
		column: Column;
		columns: Column[];
		index: number;
		dragging: boolean;
		onDragStart: (taskId: string) => void;
		onDragEnd: () => void;
		onMove: (columnId: string, index?: number) => void;
	}
	let { id, task, column, columns, index, dragging, onDragStart, onDragEnd, onMove }: Props =
		$props();
	let menu = $state<HTMLDivElement | null>(null);
	const priorityIcons = { low: SignalLow, medium: SignalMedium, high: SignalHigh };
	const PriorityIcon = $derived(priorityIcons[task.priority]);

	function startDrag(event: DragEvent): void {
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', task.id);
		}
		onDragStart(task.id);
	}
</script>

<Card.Root
	{id}
	data-task-card
	data-task-id={task.id}
	role="listitem"
	aria-labelledby={`${id}-title`}
	draggable="true"
	ondragstart={startDrag}
	ondragend={onDragEnd}
	class={cn(
		'cursor-grab gap-0 rounded-lg border-border py-0 shadow-sm transition active:cursor-grabbing hover:border-primary/40 hover:shadow-md',
		dragging && 'opacity-50 ring-2 ring-primary/40'
	)}
>
	<div class="flex flex-col gap-2.5 p-3">
		<div class="flex items-start justify-between gap-1">
			<div class="flex flex-wrap items-center gap-1.5">
				<StatusBadge tone={PRIORITY_TONE[task.priority]} class="gap-1">
					<PriorityIcon class="size-3" aria-hidden="true" />
					{t(`kanban.priority.${task.priority}`)}
				</StatusBadge>
				<Badge variant="outline" class="text-muted-foreground font-normal">{task.label}</Badge>
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							id={`${id}-move`}
							variant="ghost"
							size="icon"
							class="-me-1 -mt-1 size-7 text-muted-foreground"
							aria-label={t('kanban.moveTask', { task: task.title })}
						>
							<ArrowRightLeft class="size-3.5" aria-hidden="true" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					bind:ref={menu}
					align="end"
					onOpenAutoFocus={(event) => {
						event.preventDefault();
						menu?.querySelector<HTMLElement>('[role="menuitem"]:not([data-disabled])')?.focus();
					}}
				>
					<DropdownMenu.Group>
						<DropdownMenu.Label>{t('kanban.moveTo')}</DropdownMenu.Label>
						{#each columns.filter((target) => target.id !== column.id) as target (target.id)}
							<DropdownMenu.Item onSelect={() => onMove(target.id)}>
								{t('kanban.moveToColumn', { column: columnTitle(target) })}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Group>
					<DropdownMenu.Separator />
					<DropdownMenu.Item disabled={index === 0} onSelect={() => onMove(column.id, index - 1)}>
						{t('kanban.moveUp')}
					</DropdownMenu.Item>
					<DropdownMenu.Item
						disabled={index === column.tasks.length - 1}
						onSelect={() => onMove(column.id, index + 1)}
					>
						{t('kanban.moveDown')}
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<div class="space-y-1">
			<p id={`${id}-title`} class="text-sm font-medium leading-snug text-foreground">
				{task.title}
			</p>
			{#if task.description}
				<p class="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
			{/if}
		</div>

		<div class="flex items-center justify-between gap-2 pt-0.5">
			<div class="flex min-w-0 items-center gap-2">
				<Avatar.Root class="size-6">
					<Avatar.Fallback class="text-[10px]">{initials(task.assignee)}</Avatar.Fallback>
				</Avatar.Root>
				<span class="truncate text-xs text-muted-foreground">{task.assignee}</span>
			</div>
			<div class="flex shrink-0 items-center gap-2.5 text-xs text-muted-foreground">
				{#if task.comments > 0}
					<span class="flex items-center gap-1 tabular-nums">
						<MessageSquare class="size-3.5" aria-hidden="true" />
						<span aria-hidden="true">{task.comments}</span>
						<span class="sr-only">{t('kanban.comments', { count: task.comments })}</span>
					</span>
				{/if}
				{#if task.attachments > 0}
					<span class="flex items-center gap-1 tabular-nums">
						<Paperclip class="size-3.5" aria-hidden="true" />
						<span aria-hidden="true">{task.attachments}</span>
						<span class="sr-only">{t('kanban.attachments', { count: task.attachments })}</span>
					</span>
				{/if}
			</div>
		</div>
	</div>
</Card.Root>
