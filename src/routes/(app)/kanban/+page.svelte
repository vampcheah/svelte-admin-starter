<!--
  Kanban board — a five-stage board (Backlog → Done) with native HTML5
  drag-and-drop between columns. All data is mock and lives in local $state;
  there is no backend. Cards carry a title, priority, label, assignee and a
  little meta (comments/attachments). Dragging a card appends it to the target
  column. No external drag-and-drop library is used.
-->
<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import SignalLow from '@lucide/svelte/icons/signal-low';
	import SignalMedium from '@lucide/svelte/icons/signal-medium';
	import SignalHigh from '@lucide/svelte/icons/signal-high';
	import type { Component } from 'svelte';

	import { toast } from 'svelte-sonner';

	import { PageContainer, PageHeader, StatusBadge, type BadgeTone } from '$lib/components/shared';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import { initials } from '$lib/utils/formatters';

	type Priority = 'low' | 'medium' | 'high';

	interface Task {
		id: string;
		title: string;
		description?: string;
		priority: Priority;
		label: string;
		assignee: string;
		comments: number;
		attachments: number;
	}

	interface Column {
		id: string;
		title: string;
		tasks: Task[];
	}

	// Map a task priority to a shared StatusBadge tone (see StatusBadge).
	const PRIORITY_TONE: Record<Priority, BadgeTone> = {
		low: 'info',
		medium: 'warning',
		high: 'danger'
	};
	const PRIORITY_ICON: Record<Priority, Component> = {
		low: SignalLow,
		medium: SignalMedium,
		high: SignalHigh
	};
	const PRIORITY_LABEL: Record<Priority, string> = {
		low: 'Low',
		medium: 'Medium',
		high: 'High'
	};

	// --- Mock board: five stages, ~12 cards distributed across them. ---
	let columns = $state<Column[]>([
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
	]);

	const totalTasks = $derived(columns.reduce((sum, col) => sum + col.tasks.length, 0));

	// --- Native HTML5 drag-and-drop state ---
	// The card currently being dragged and where it came from.
	let dragging = $state<{ taskId: string; fromColumn: string } | null>(null);
	// The column the pointer is hovering over (for the drop-zone ring).
	let dragOverColumn = $state<string | null>(null);

	function onDragStart(taskId: string, fromColumn: string): void {
		dragging = { taskId, fromColumn };
	}

	function onDragEnd(): void {
		dragging = null;
		dragOverColumn = null;
	}

	function onDragEnter(columnId: string): void {
		dragOverColumn = columnId;
	}

	function onDragLeave(columnId: string): void {
		// Only clear if we're leaving the column we last entered.
		if (dragOverColumn === columnId) dragOverColumn = null;
	}

	// Move the dragged card into `toColumn` (appended), updating state immutably.
	function onDrop(toColumn: string): void {
		dragOverColumn = null;
		if (!dragging) return;
		const { taskId, fromColumn } = dragging;

		if (fromColumn === toColumn) {
			dragging = null;
			return;
		}

		const source = columns.find((c) => c.id === fromColumn);
		const moved = source?.tasks.find((t) => t.id === taskId);
		if (!moved) {
			dragging = null;
			return;
		}

		columns = columns.map((col) => {
			if (col.id === fromColumn) {
				return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
			}
			if (col.id === toColumn) {
				return { ...col, tasks: [...col.tasks, moved] };
			}
			return col;
		});

		dragging = null;
	}

	// Append a fresh mock card to a specific column.
	let nextId = $state(13);
	function addTask(columnId: string): void {
		const id = `t-${nextId}`;
		nextId += 1;
		const task: Task = {
			id,
			title: 'New task',
			description: 'Add a description, assignee and priority.',
			priority: 'low',
			label: 'Untitled',
			assignee: 'Unassigned',
			comments: 0,
			attachments: 0
		};
		columns = columns.map((col) =>
			col.id === columnId ? { ...col, tasks: [...col.tasks, task] } : col
		);
		const column = columns.find((c) => c.id === columnId);
		toast.success('Task added', {
			description: `A new card was added to ${column?.title ?? 'the board'}.`
		});
	}

	// The "Add task" header action drops a card into the first column.
	function addToBoard(): void {
		addTask(columns[0].id);
	}
</script>

<svelte:head>
	<title>Board · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader title="Board" description="Plan and track work across stages.">
		{#snippet actions()}
			<Button onclick={addToBoard}>
				<Plus class="size-4" aria-hidden="true" />
				Add task
			</Button>
		{/snippet}
	</PageHeader>

	<div class="flex items-center gap-2 text-sm text-muted-foreground">
		<span>{totalTasks} tasks across {columns.length} stages</span>
		<span aria-hidden="true">·</span>
		<span>Drag a card to move it between columns</span>
	</div>

	<!-- Horizontally scrollable row of fixed-width columns. -->
	<div class="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
		{#each columns as column (column.id)}
			<section
				class={cn(
					'flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/40 transition-colors',
					dragOverColumn === column.id && 'ring-2 ring-primary/40'
				)}
				role="list"
				aria-label={column.title}
				ondragover={(e) => e.preventDefault()}
				ondragenter={() => onDragEnter(column.id)}
				ondragleave={() => onDragLeave(column.id)}
				ondrop={() => onDrop(column.id)}
			>
				<!-- Column header: title + count badge + add button -->
				<header class="flex items-center justify-between gap-2 px-3 py-2.5">
					<div class="flex items-center gap-2">
						<h2 class="text-sm font-semibold text-foreground">{column.title}</h2>
						<Badge variant="secondary" class="tabular-nums">{column.tasks.length}</Badge>
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="size-7 text-muted-foreground"
						onclick={() => addTask(column.id)}
						aria-label="Add task to {column.title}"
					>
						<Plus class="size-4" aria-hidden="true" />
					</Button>
				</header>

				<!-- Task stack -->
				<div class="flex flex-1 flex-col gap-2.5 px-2.5 pb-3">
					{#each column.tasks as task (task.id)}
						{@const PriorityIcon = PRIORITY_ICON[task.priority]}
						<Card.Root
							role="listitem"
							draggable="true"
							ondragstart={() => onDragStart(task.id, column.id)}
							ondragend={onDragEnd}
							class={cn(
								'cursor-grab gap-0 rounded-lg border-border py-0 shadow-sm transition active:cursor-grabbing hover:border-primary/40 hover:shadow-md',
								dragging?.taskId === task.id && 'opacity-50 ring-2 ring-primary/40'
							)}
						>
							<div class="flex flex-col gap-2.5 p-3">
								<!-- Tags row -->
								<div class="flex flex-wrap items-center gap-1.5">
									<StatusBadge tone={PRIORITY_TONE[task.priority]} class="gap-1">
										<PriorityIcon class="size-3" aria-hidden="true" />
										{PRIORITY_LABEL[task.priority]}
									</StatusBadge>
									<Badge variant="outline" class="text-muted-foreground font-normal">
										{task.label}
									</Badge>
								</div>

								<!-- Title + description -->
								<div class="space-y-1">
									<p class="text-sm font-medium leading-snug text-foreground">{task.title}</p>
									{#if task.description}
										<p class="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
									{/if}
								</div>

								<!-- Footer: assignee + meta -->
								<div class="flex items-center justify-between gap-2 pt-0.5">
									<div class="flex items-center gap-2 min-w-0">
										<Avatar.Root class="size-6">
											<Avatar.Fallback class="text-[10px]">{initials(task.assignee)}</Avatar.Fallback>
										</Avatar.Root>
										<span class="truncate text-xs text-muted-foreground">{task.assignee}</span>
									</div>
									<div class="flex shrink-0 items-center gap-2.5 text-xs text-muted-foreground">
										{#if task.comments > 0}
											<span class="flex items-center gap-1 tabular-nums">
												<MessageSquare class="size-3.5" aria-hidden="true" />
												{task.comments}
											</span>
										{/if}
										{#if task.attachments > 0}
											<span class="flex items-center gap-1 tabular-nums">
												<Paperclip class="size-3.5" aria-hidden="true" />
												{task.attachments}
											</span>
										{/if}
									</div>
								</div>
							</div>
						</Card.Root>
					{/each}

					{#if column.tasks.length === 0}
						<button
							type="button"
							onclick={() => addTask(column.id)}
							class="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-6 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
						>
							<Plus class="size-3.5" aria-hidden="true" />
							Add a task
						</button>
					{/if}
				</div>
			</section>
		{/each}
	</div>
</PageContainer>
