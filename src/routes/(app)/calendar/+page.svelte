<!--
  Calendar — a month-view schedule page. Month grid (6 weeks) computed via
  $lib/calendar.ts helpers to stay clean and reactivity-warning free. Includes
  month jump selector, today highlight, selected cell focus, chip overflows,
  and upcoming event stream.
-->
<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Plus from '@lucide/svelte/icons/plus';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Clock from '@lucide/svelte/icons/clock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	import { PageContainer, PageHeader } from '$lib/components/shared';
	import * as Card from '$lib/core/components/ui/card';
	import { Button } from '$lib/core/components/ui/button';
	import { Badge } from '$lib/core/components/ui/badge';
	import { Input } from '$lib/core/components/ui/input';
	import { Label } from '$lib/core/components/ui/label';
	import { cn } from '$lib/core/utils';
	import { i18n, t } from '$lib/i18n';
	import { buildGrid, monthLabel, shiftMonth, today, weekdayLabels, ymd } from '$lib/calendar';

	type Category = 'meeting' | 'review' | 'deadline' | 'personal';

	interface CalendarEvent {
		id: string;
		title: string;
		date: Date;
		dateKey: string;
		category: Category;
		time?: string;
	}

	const CATEGORIES: Record<Category, { labelKey: string; chip: string; dot: string }> = {
		meeting: {
			labelKey: 'calendar.categoryMeeting',
			chip: 'bg-primary/10 text-primary',
			dot: 'bg-primary'
		},
		review: {
			labelKey: 'calendar.categoryReview',
			chip: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
			dot: 'bg-blue-500'
		},
		deadline: {
			labelKey: 'calendar.categoryDeadline',
			chip: 'bg-red-500/10 text-red-600 dark:text-red-400',
			dot: 'bg-red-500'
		},
		personal: {
			labelKey: 'calendar.categoryPersonal',
			chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
			dot: 'bg-emerald-500'
		}
	};

	const CATEGORY_ORDER: Category[] = ['meeting', 'review', 'deadline', 'personal'];
	const MAX_CHIPS = 3;

	const t0 = today();
	const todayKey = t0.key;

	let viewYear = $state(t0.year);
	let viewMonth = $state(t0.month); // 0-indexed
	let selectedKey = $state<string | null>(null);

	const SEED: { day: number; title: string; category: Category; time?: string }[] = [
		{ day: 2, title: 'Sprint planning', category: 'meeting', time: '09:30' },
		{ day: 5, title: 'Design review', category: 'review', time: '14:00' },
		{ day: 9, title: 'Q3 roadmap sync', category: 'meeting', time: '11:00' },
		{ day: 9, title: 'Invoice deadline', category: 'deadline' },
		{ day: 9, title: 'Dentist', category: 'personal', time: '16:30' },
		{ day: 9, title: '1:1 with Alex', category: 'meeting', time: '17:30' },
		{ day: 14, title: 'Code freeze', category: 'deadline' },
		{ day: 17, title: 'Marketing review', category: 'review', time: '10:00' },
		{ day: 21, title: 'Team offsite', category: 'personal', time: '08:00' },
		{ day: 24, title: 'Release v2.4', category: 'deadline', time: '12:00' },
		{ day: 27, title: 'Budget review', category: 'review', time: '15:00' },
		{ day: 30, title: 'Retro', category: 'meeting', time: '13:00' }
	];

	const events: CalendarEvent[] = SEED.map((e, i) => {
		const d = new Date(t0.year, t0.month, Math.min(e.day, 28));
		return {
			id: `evt-${i}`,
			title: e.title,
			category: e.category,
			time: e.time,
			date: d,
			dateKey: ymd(d)
		};
	});

	const grid = $derived(buildGrid(viewYear, viewMonth, todayKey));
	const weekdays = $derived(weekdayLabels(i18n.locale));
	const heading = $derived(monthLabel(viewYear, viewMonth, i18n.locale));
	const monthInput = $derived(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`);

	const eventsByDay = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const map = new Map<string, CalendarEvent[]>();
		for (const ev of events) {
			const bucket = map.get(ev.dateKey);
			if (bucket) bucket.push(ev);
			else map.set(ev.dateKey, [ev]);
		}
		for (const bucket of map.values()) {
			bucket.sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'));
		}
		return map;
	});

	const monthEventCount = $derived(
		events.filter((e) => e.date.getFullYear() === viewYear && e.date.getMonth() === viewMonth)
			.length
	);

	const upcoming = $derived(
		[...events]
			.filter((e) => e.dateKey >= todayKey)
			.sort((a, b) => {
				const byDate = a.dateKey.localeCompare(b.dateKey);
				if (byDate !== 0) return byDate;
				return (a.time ?? '99:99').localeCompare(b.time ?? '99:99');
			})
			.slice(0, 5)
	);

	function move(delta: number): void {
		selectedKey = null;
		({ year: viewYear, month: viewMonth } = shiftMonth(viewYear, viewMonth, delta));
	}

	function goToday(): void {
		selectedKey = null;
		viewYear = t0.year;
		viewMonth = t0.month;
	}

	function jumpToMonth(event: Event): void {
		const [year, month] = (event.currentTarget as HTMLInputElement).value.split('-').map(Number);
		if (!year || month < 1 || month > 12) return;
		selectedKey = null;
		viewYear = year;
		viewMonth = month - 1;
	}

	const isViewingCurrentMonth = $derived(viewYear === t0.year && viewMonth === t0.month);

	function formatUpcomingDate(d: Date): string {
		return d.toLocaleString(i18n.locale, { month: 'short', day: 'numeric' });
	}
	function weekdayShort(d: Date): string {
		return d.toLocaleString(i18n.locale, { weekday: 'short' });
	}
</script>

<svelte:head>
	<title>Calendar · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader title="Calendar" description="Plan your month and keep track of upcoming events.">
		{#snippet actions()}
			<div class="flex flex-wrap items-center gap-1.5">
				<Label for="calendar-month-jump" class="sr-only">Jump to month</Label>
				<Input
					id="calendar-month-jump"
					type="month"
					value={monthInput}
					onchange={jumpToMonth}
					class="h-8 w-36"
				/>
				<Button variant="outline" size="icon" onclick={() => move(-1)} aria-label="Previous month">
					<ChevronLeft class="size-4" aria-hidden="true" />
				</Button>
				<Button variant="outline" size="sm" onclick={goToday} disabled={isViewingCurrentMonth}>
					Today
				</Button>
				<Button variant="outline" size="icon" onclick={() => move(1)} aria-label="Next month">
					<ChevronRight class="size-4" aria-hidden="true" />
				</Button>
				<Button class="ml-1">
					<Plus class="size-4" aria-hidden="true" />
					New event
				</Button>
			</div>
		{/snippet}
	</PageHeader>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
		<!-- Calendar (wide) -->
		<Card.Root class="lg:col-span-2">
			<Card.Header
				class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
			>
				<div class="space-y-1">
					<Card.Title class="flex items-center gap-2 text-lg capitalize">
						<CalendarDays class="text-muted-foreground size-5" aria-hidden="true" />
						<span class="tabular-nums">{heading}</span>
					</Card.Title>
					<Card.Description>
						{monthEventCount}
						{monthEventCount === 1 ? 'event' : 'events'} this month
					</Card.Description>
				</div>
			</Card.Header>

			<Card.Content>
				<!-- Weekday header row -->
				<div
					class="text-muted-foreground mb-2 grid grid-cols-7 gap-px text-center text-xs font-medium"
				>
					{#each weekdays as day (day)}
						<div class="py-1">{day}</div>
					{/each}
				</div>

				<!-- Month grid: 6 weeks × 7 days -->
				<div
					class="border-slate-300 bg-slate-300 grid grid-cols-7 gap-px overflow-hidden rounded-lg border dark:border-white/20 dark:bg-white/20"
				>
					{#each grid as cell (cell.key)}
						{@const dayEvents = eventsByDay.get(cell.key) ?? []}
						{@const overflow = dayEvents.length - MAX_CHIPS}
						<button
							type="button"
							onclick={() => (selectedKey = selectedKey === cell.key ? null : cell.key)}
							aria-label={cell.key}
							aria-pressed={selectedKey === cell.key}
							class={cn(
								'bg-card relative flex min-h-20 cursor-pointer flex-col gap-1 p-1.5 text-left transition-colors hover:bg-amber-100/70 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset focus-visible:outline-none sm:min-h-28 sm:p-2 dark:hover:bg-amber-300/15',
								!cell.inMonth && 'bg-muted/40 text-muted-foreground hover:bg-muted/60',
								cell.isToday &&
									'bg-sky-200/80 hover:bg-sky-300/80 dark:bg-sky-950/45 dark:hover:bg-sky-950/65',
								selectedKey === cell.key &&
									'bg-blue-300/75 ring-2 ring-blue-500/60 ring-inset hover:bg-blue-300/90 dark:bg-blue-900/60 dark:ring-blue-400/60 dark:hover:bg-blue-900/75'
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
											<span class="shrink-0 tabular-nums opacity-80">{ev.time}</span>
										{/if}
										<span class="truncate">{ev.title}</span>
									</div>
								{/each}
								{#if overflow > 0}
									<span class="text-muted-foreground px-1.5 text-[11px] font-medium">
										+{overflow} more
									</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>

				<!-- Legend -->
				<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
					{#each CATEGORY_ORDER as category (category)}
						<div class="flex items-center gap-1.5">
							<span class={cn('size-2.5 rounded-full', CATEGORIES[category].dot)} aria-hidden="true"
							></span>
							<span class="text-muted-foreground text-xs"
								>{CATEGORIES[category].labelKey ? t(CATEGORIES[category].labelKey) : category}</span
							>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Upcoming (narrow) -->
		<Card.Root class="lg:col-span-1">
			<Card.Header>
				<Card.Title class="text-lg">Upcoming</Card.Title>
				<Card.Description>Your next {upcoming.length} events</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if upcoming.length === 0}
					<div class="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center">
						<CalendarDays class="size-6" aria-hidden="true" />
						<p class="text-sm">No upcoming events.</p>
					</div>
				{:else}
					<ul class="space-y-3">
						{#each upcoming as ev (ev.id)}
							<li
								class="border-border hover:bg-accent flex items-center gap-3 rounded-lg border p-2.5 transition-colors"
							>
								<!-- Date tile -->
								<div
									class="bg-muted text-foreground flex size-11 shrink-0 flex-col items-center justify-center rounded-md"
								>
									<span class="text-muted-foreground text-[10px] font-medium uppercase">
										{weekdayShort(ev.date)}
									</span>
									<span class="text-sm leading-none font-semibold tabular-nums">
										{ev.date.getDate()}
									</span>
								</div>
								<!-- Details -->
								<div class="min-w-0 flex-1">
									<p class="text-foreground truncate text-sm font-medium">{ev.title}</p>
									<div class="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
										<span class="tabular-nums">{formatUpcomingDate(ev.date)}</span>
										{#if ev.time}
											<span class="flex items-center gap-1">
												<Clock class="size-3" aria-hidden="true" />
												<span class="tabular-nums">{ev.time}</span>
											</span>
										{/if}
									</div>
								</div>
								<!-- Category pill -->
								<Badge
									variant="outline"
									class={cn('shrink-0 border-transparent', CATEGORIES[ev.category].chip)}
								>
									{CATEGORIES[ev.category].labelKey
										? t(CATEGORIES[ev.category].labelKey)
										: ev.category}
								</Badge>
							</li>
						{/each}
					</ul>

					<Button
						variant="ghost"
						size="sm"
						class="text-muted-foreground mt-3 w-full justify-center"
					>
						View all events
						<ArrowRight class="size-4" aria-hidden="true" />
					</Button>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</PageContainer>
