<script lang="ts">
	import { cn } from '#lib/core/utils.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import { tick } from 'svelte';
	import { dateForKey, keyboardDay } from './navigation';
	import type { DayCell } from '#lib/calendar.ts';
	import type { CalendarEvent } from './types';
	import { CATEGORIES, CATEGORY_ORDER } from './presentation';
	let {
		grid,
		label,
		onNavigate,
		weekdays,
		eventsByDay,
		selectedKey = $bindable(null)
	}: {
		grid: DayCell[];
		label: string;
		onNavigate: (key: string) => void;
		weekdays: string[];
		eventsByDay: ReadonlyMap<string, CalendarEvent[]>;
		selectedKey?: string | null;
	} = $props();
	const MAX_CHIPS = 3;
	const instanceId = $props.id();
	let element: HTMLDivElement;
	let focusedKey = $state<string | null>(null);
	const tabStopKey = $derived(
		grid.find((cell) => cell.key === focusedKey)?.key ??
			grid.find((cell) => cell.key === selectedKey)?.key ??
			grid.find((cell) => cell.isToday && cell.inMonth)?.key ??
			grid.find((cell) => cell.inMonth)?.key
	);
	const weeks = $derived(
		Array.from({ length: 6 }, (_, week) => grid.slice(week * 7, week * 7 + 7))
	);
	const dateFormat = $derived(new Intl.DateTimeFormat(i18n.locale, { dateStyle: 'full' }));
	async function navigate(event: KeyboardEvent, key: string) {
		if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		const next = keyboardDay(key, event.key);
		if (!next) return;
		event.preventDefault();
		focusedKey = next;
		if (
			event.key === 'PageUp' ||
			event.key === 'PageDown' ||
			!grid.some((cell) => cell.key === next && cell.inMonth)
		)
			onNavigate(next);
		await tick();
		element.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus();
	}
</script>

<p id={`${instanceId}-help`} class="sr-only">{t('calendar.keyboardHelp')}</p>
<div bind:this={element} role="grid" aria-label={label} aria-describedby={`${instanceId}-help`}>
	<div
		role="row"
		class="text-muted-foreground mb-2 grid grid-cols-7 gap-px text-center text-xs font-medium"
	>
		{#each weekdays as day (day)}
			<div role="columnheader" class="py-1">{day}</div>
		{/each}
	</div>
	<div role="rowgroup" class="border-border bg-border overflow-hidden rounded-lg border">
		{#each weeks as week, index (index)}
			<div role="row" class="grid grid-cols-7 gap-px not-first:mt-px">
				{#each week as cell (cell.key)}
					{@const dayEvents = eventsByDay.get(cell.key) ?? []}
					{@const overflow = dayEvents.length - MAX_CHIPS}
					<div role="gridcell" aria-selected={selectedKey === cell.key} class="min-w-0">
						<button
							type="button"
							onclick={() => (selectedKey = selectedKey === cell.key ? null : cell.key)}
							data-date={cell.key}
							tabindex={tabStopKey === cell.key ? 0 : -1}
							onfocus={() => (focusedKey = cell.key)}
							onkeydown={(event) => navigate(event, cell.key)}
							aria-label={dateFormat.format(dateForKey(cell.key))}
							aria-current={cell.isToday ? 'date' : undefined}
							aria-describedby={`${instanceId}-${cell.key}-events`}
							aria-pressed={selectedKey === cell.key}
							class={cn(
								'bg-card relative flex h-full w-full min-h-20 cursor-pointer flex-col gap-1 p-1.5 text-left transition-colors hover:bg-accent focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none sm:min-h-28 sm:p-2',
								!cell.inMonth && 'bg-muted/40 text-muted-foreground hover:bg-muted/60',
								cell.isToday && 'bg-primary/10 hover:bg-primary/15',
								selectedKey === cell.key &&
									'bg-primary/20 ring-2 ring-ring ring-inset hover:bg-primary/25'
							)}
						>
							<!-- Day number -->
							<div class="flex items-center justify-between">
								<span
									class={cn(
										'inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums',
										cell.isToday
											? 'bg-primary text-primary-foreground font-semibold'
											: cell.inMonth
												? 'text-foreground'
												: 'text-muted-foreground/60'
									)}
								>
									{cell.day}
								</span>
							</div>

							<!-- Event chips (up to MAX_CHIPS) + overflow indicator -->
							<div class="flex flex-col gap-1">
								{#each dayEvents.slice(0, MAX_CHIPS) as ev (ev.id)}
									<div
										class={cn(
											'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-left text-[11px] leading-tight font-medium',
											CATEGORIES[ev.category].chip,
											!cell.inMonth && 'opacity-60'
										)}
										title={ev.time ? `${ev.time} · ${ev.title}` : ev.title}
									>
										{#if ev.time}
											<span class="hidden shrink-0 tabular-nums opacity-80 sm:inline"
												>{ev.time}</span
											>
										{/if}
										<span class="truncate">{ev.title}</span>
									</div>
								{/each}
								{#if overflow > 0}
									<span class="text-muted-foreground px-1.5 text-[11px] font-medium">
										{t('calendar.more', { count: overflow })}
									</span>
								{/if}
							</div>
						</button>
						<p id={`${instanceId}-${cell.key}-events`} class="sr-only">
							{t('calendar.dayEvents', { count: dayEvents.length })}
							{dayEvents
								.map((event) => `${event.time ?? t('calendar.allDay')} ${event.title}`)
								.join('; ')}
						</p>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<!-- Legend -->
<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
	{#each CATEGORY_ORDER as category (category)}
		<div class="flex items-center gap-1.5">
			<span class={cn('size-2.5 rounded-full', CATEGORIES[category].dot)} aria-hidden="true"></span>
			<span class="text-muted-foreground text-xs"
				>{CATEGORIES[category].labelKey ? t(CATEGORIES[category].labelKey) : category}</span
			>
		</div>
	{/each}
</div>
