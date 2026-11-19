<!--
  Calendar — a month-view schedule page. Month grid (6 weeks) computed via
  #lib/calendar.ts helpers to stay clean and reactivity-warning free. Includes
  month jump selector, today highlight, selected cell focus, chip overflows,
  and upcoming event stream.
-->
<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import { TAB_ACTIVITY, type TabActivity } from '#lib/shell/tab-activity.ts';
	import { useCalendarToday } from '#lib/features/calendar/today.svelte.ts';
	import { dateForKey } from '#lib/features/calendar/navigation.ts';
	import MonthGrid from '#lib/features/calendar/MonthGrid.svelte';
	import UpcomingEvents from '#lib/features/calendar/UpcomingEvents.svelte';
	import {
		createEvents,
		groupEventsByDay,
		countEventsInMonth,
		upcomingEvents
	} from '#lib/features/calendar/events.ts';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Plus from '@lucide/svelte/icons/plus';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';

	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import { Label } from '#lib/core/components/ui/label/index.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import { buildGrid, monthLabel, shiftMonth, weekdayLabels } from '#lib/calendar.ts';

	const activity = getContext<TabActivity | undefined>(TAB_ACTIVITY);
	const calendarToday = useCalendarToday(() => activity?.active ?? true);
	const t0 = untrack(() => calendarToday.current);
	const todayKey = $derived(calendarToday.current.key);

	let viewYear = $state(t0.year);
	let viewMonth = $state(t0.month); // 0-indexed
	let selectedKey = $state<string | null>(null);

	const events = createEvents(t0.year, t0.month);

	const grid = $derived(buildGrid(viewYear, viewMonth, todayKey));
	const weekdays = $derived(weekdayLabels(i18n.locale));
	const heading = $derived(monthLabel(viewYear, viewMonth, i18n.locale));
	const monthInput = $derived(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`);

	const eventsByDay = groupEventsByDay(events);
	const monthEventCount = $derived(countEventsInMonth(events, viewYear, viewMonth));
	const upcoming = $derived(upcomingEvents(events, todayKey));

	function move(delta: number): void {
		selectedKey = null;
		({ year: viewYear, month: viewMonth } = shiftMonth(viewYear, viewMonth, delta));
	}

	function goToday(): void {
		selectedKey = null;
		const current = calendarToday.refresh();
		viewYear = current.year;
		viewMonth = current.month;
	}

	function jumpToMonth(event: Event): void {
		const [year, month] = (event.currentTarget as HTMLInputElement).value.split('-').map(Number);
		if (!year || month < 1 || month > 12) return;
		selectedKey = null;
		viewYear = year;
		viewMonth = month - 1;
	}

	function navigateToDay(key: string): void {
		const date = dateForKey(key);
		viewYear = date.getFullYear();
		viewMonth = date.getMonth();
	}

	const instanceId = $props.id();
</script>

<PageContainer>
	<PageHeader title={t('calendar.title')} description={t('calendar.description')}>
		{#snippet actions()}
			<div class="flex flex-wrap items-center gap-1.5">
				<Label for={`${instanceId}-calendar-month-jump`} class="sr-only"
					>{t('calendar.jumpToMonth')}</Label
				>
				<Input
					id={`${instanceId}-calendar-month-jump`}
					type="month"
					value={monthInput}
					onchange={jumpToMonth}
					class="h-8 w-40"
				/>
				<Button
					variant="outline"
					size="icon"
					onclick={() => move(-1)}
					aria-label={t('calendar.previousMonth')}
				>
					<ChevronLeft class="size-4" aria-hidden="true" />
				</Button>
				<Button variant="outline" size="sm" onclick={goToday}>
					{t('calendar.today')}
				</Button>
				<Button
					variant="outline"
					size="icon"
					onclick={() => move(1)}
					aria-label={t('calendar.nextMonth')}
				>
					<ChevronRight class="size-4" aria-hidden="true" />
				</Button>
				<Button class="ml-1">
					<Plus class="size-4" aria-hidden="true" />
					{t('calendar.newEvent')}
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
						{t('calendar.monthEvents', { count: monthEventCount })}
					</Card.Description>
				</div>
			</Card.Header>

			<Card.Content>
				<MonthGrid
					{grid}
					{weekdays}
					{eventsByDay}
					label={heading}
					bind:selectedKey
					onNavigate={navigateToDay}
				/>
			</Card.Content>
		</Card.Root>

		<UpcomingEvents {upcoming} />
	</div>
</PageContainer>
