<!--
  Calendar — a month-view schedule page. A real month grid (6 weeks, leading and
  trailing days from adjacent months) computed from `new Date()`, with ◀ / ▶ /
  Today navigation, day cells showing up to three event chips (colored by
  category) with a "+N more" overflow, a category legend, and an "Upcoming" list.
  All events are mock data — there is no backend.
-->
<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Plus from '@lucide/svelte/icons/plus';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Clock from '@lucide/svelte/icons/clock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	import { PageContainer, PageHeader } from '$lib/components/shared';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';

	type Category = 'meeting' | 'review' | 'deadline' | 'personal';

	interface CalendarEvent {
		id: string;
		title: string;
		date: Date;
		category: Category;
		time?: string;
	}

	// Category metadata: label + soft tint (token-safe status tints), all
	// resolved from a single source so chips, dots and the legend stay in sync.
	const CATEGORIES: Record<Category, { label: string; chip: string; dot: string }> = {
		meeting: {
			label: 'Meeting',
			chip: 'bg-primary/10 text-primary',
			dot: 'bg-primary'
		},
		review: {
			label: 'Review',
			chip: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
			dot: 'bg-blue-500'
		},
		deadline: {
			label: 'Deadline',
			chip: 'bg-red-500/10 text-red-600 dark:text-red-400',
			dot: 'bg-red-500'
		},
		personal: {
			label: 'Personal',
			chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
			dot: 'bg-emerald-500'
		}
	};

	const CATEGORY_ORDER: Category[] = ['meeting', 'review', 'deadline', 'personal'];
	const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const MAX_CHIPS = 3;

	// "Now" is captured once so "today" highlighting and the initial view are stable.
	const now = new Date();
	const todayKey = dateKey(now);

	// The currently viewed month is driven by $state — navigation mutates it.
	let viewYear = $state(now.getFullYear());
	let viewMonth = $state(now.getMonth()); // 0-indexed

	// Build mock events anchored to the *current* real month so the grid always
	// has content on first load. Each entry is { day, title, category, time? }.
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

	const events: CalendarEvent[] = SEED.map((e, i) => ({
		id: `evt-${i}`,
		title: e.title,
		category: e.category,
		time: e.time,
		// Clamp the day to the real month length so seeds never overflow.
		date: new Date(
			now.getFullYear(),
			now.getMonth(),
			Math.min(e.day, daysInMonth(now.getFullYear(), now.getMonth()))
		)
	}));

	// --- Date helpers ---------------------------------------------------------
	function dateKey(d: Date): string {
		return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
	}
	function daysInMonth(year: number, month: number): number {
		return new Date(year, month + 1, 0).getDate();
	}

	// Index events by their date key for O(1) lookups while building the grid.
	const eventsByDay = $derived.by(() => {
		const map = new Map<string, CalendarEvent[]>();
		for (const ev of events) {
			const key = dateKey(ev.date);
			const bucket = map.get(key);
			if (bucket) bucket.push(ev);
			else map.set(key, [ev]);
		}
		// Keep each day's events ordered by time (timed first, then all-day).
		for (const bucket of map.values()) {
			bucket.sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'));
		}
		return map;
	});

	interface DayCell {
		date: Date;
		key: string;
		inMonth: boolean;
		isToday: boolean;
		dayEvents: CalendarEvent[];
	}

	// The full 6×7 grid for the viewed month, including dimmed adjacent-month days.
	const grid = $derived.by<DayCell[]>(() => {
		const firstOfMonth = new Date(viewYear, viewMonth, 1);
		// Sunday-based offset: how many leading days to borrow from the prev month.
		const start = new Date(firstOfMonth);
		start.setDate(start.getDate() - firstOfMonth.getDay());

		const cells: DayCell[] = [];
		for (let i = 0; i < 42; i++) {
			const date = new Date(start);
			date.setDate(start.getDate() + i);
			const key = dateKey(date);
			cells.push({
				date,
				key,
				inMonth: date.getMonth() === viewMonth,
				isToday: key === todayKey,
				dayEvents: eventsByDay.get(key) ?? []
			});
		}
		return cells;
	});

	const monthLabel = $derived(
		new Date(viewYear, viewMonth, 1).toLocaleString('en-US', {
			month: 'long',
			year: 'numeric'
		})
	);

	// Count of events that actually fall in the viewed month, for the subheading.
	const monthEventCount = $derived(
		events.filter((e) => e.date.getFullYear() === viewYear && e.date.getMonth() === viewMonth)
			.length
	);

	// The next handful of upcoming events relative to "now" (chronological).
	const upcoming = $derived(
		[...events]
			.filter((e) => e.date.getTime() >= new Date(todayKey).getTime())
			.sort((a, b) => {
				const byDate = a.date.getTime() - b.date.getTime();
				if (byDate !== 0) return byDate;
				return (a.time ?? '99:99').localeCompare(b.time ?? '99:99');
			})
			.slice(0, 5)
	);

	// --- Navigation -----------------------------------------------------------
	function shiftMonth(delta: number): void {
		const next = new Date(viewYear, viewMonth + delta, 1);
		viewYear = next.getFullYear();
		viewMonth = next.getMonth();
	}
	function goToday(): void {
		viewYear = now.getFullYear();
		viewMonth = now.getMonth();
	}

	const isViewingCurrentMonth = $derived(
		viewYear === now.getFullYear() && viewMonth === now.getMonth()
	);

	function formatUpcomingDate(d: Date): string {
		return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
	}
	function weekdayShort(d: Date): string {
		return d.toLocaleString('en-US', { weekday: 'short' });
	}
</script>

<svelte:head>
	<title>Calendar · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader title="Calendar" description="Plan your month and keep track of upcoming events.">
		{#snippet actions()}
			<Button>
				<Plus class="size-4" aria-hidden="true" />
				New event
			</Button>
		{/snippet}
	</PageHeader>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
		<!-- Calendar (wide) -->
		<Card.Root class="lg:col-span-2">
			<Card.Header
				class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
			>
				<div class="space-y-1">
					<Card.Title class="flex items-center gap-2 text-lg">
						<CalendarDays class="text-muted-foreground size-5" aria-hidden="true" />
						<span class="tabular-nums">{monthLabel}</span>
					</Card.Title>
					<Card.Description>
						{monthEventCount}
						{monthEventCount === 1 ? 'event' : 'events'} this month
					</Card.Description>
				</div>

				<div class="flex items-center gap-1.5">
					<Button
						variant="outline"
						size="icon"
						onclick={() => shiftMonth(-1)}
						aria-label="Previous month"
					>
						<ChevronLeft class="size-4" aria-hidden="true" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onclick={goToday}
						disabled={isViewingCurrentMonth}
					>
						Today
					</Button>
					<Button
						variant="outline"
						size="icon"
						onclick={() => shiftMonth(1)}
						aria-label="Next month"
					>
						<ChevronRight class="size-4" aria-hidden="true" />
					</Button>
				</div>
			</Card.Header>

			<Card.Content>
				<!-- Weekday header row -->
				<div
					class="text-muted-foreground mb-2 grid grid-cols-7 gap-px text-center text-xs font-medium"
				>
					{#each WEEKDAYS as day (day)}
						<div class="py-1">
							<span class="hidden sm:inline">{day}</span>
							<span class="sm:hidden">{day.charAt(0)}</span>
						</div>
					{/each}
				</div>

				<!-- Month grid: 6 weeks × 7 days -->
				<div class="border-border bg-border grid grid-cols-7 gap-px overflow-hidden rounded-lg border">
					{#each grid as cell (cell.key)}
						{@const overflow = cell.dayEvents.length - MAX_CHIPS}
						<div
							class={cn(
								'bg-card relative flex min-h-20 flex-col gap-1 p-1.5 sm:min-h-28 sm:p-2',
								!cell.inMonth && 'bg-muted/40'
							)}
						>
							<!-- Day number; today gets an indigo pill -->
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
									{cell.date.getDate()}
								</span>
							</div>

							<!-- Event chips (up to MAX_CHIPS) + overflow indicator -->
							<div class="flex flex-col gap-1">
								{#each cell.dayEvents.slice(0, MAX_CHIPS) as ev (ev.id)}
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
						</div>
					{/each}
				</div>

				<!-- Legend -->
				<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
					{#each CATEGORY_ORDER as category (category)}
						<div class="flex items-center gap-1.5">
							<span
								class={cn('size-2.5 rounded-full', CATEGORIES[category].dot)}
								aria-hidden="true"
							></span>
							<span class="text-muted-foreground text-xs">{CATEGORIES[category].label}</span>
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
									{CATEGORIES[ev.category].label}
								</Badge>
							</li>
						{/each}
					</ul>

					<Button variant="ghost" size="sm" class="text-muted-foreground mt-3 w-full justify-center">
						View all events
						<ArrowRight class="size-4" aria-hidden="true" />
					</Button>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</PageContainer>
