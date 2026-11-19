<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Clock from '@lucide/svelte/icons/clock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Badge } from '#lib/core/components/ui/badge/index.ts';
	import { cn } from '#lib/core/utils.ts';
	import { i18n, t } from '#lib/i18n/index.ts';
	import { CATEGORIES } from './presentation';
	import type { CalendarEvent } from './types';
	let { upcoming }: { upcoming: CalendarEvent[] } = $props();
	function formatUpcomingDate(date: Date) {
		return date.toLocaleString(i18n.locale, { month: 'short', day: 'numeric' });
	}
	function weekdayShort(date: Date) {
		return date.toLocaleString(i18n.locale, { weekday: 'short' });
	}
</script>

<!-- Upcoming (narrow) -->
<Card.Root>
	<Card.Header>
		<Card.Title class="text-lg">{t('calendar.upcoming')}</Card.Title>
		<Card.Description>{t('calendar.nextEvents', { count: upcoming.length })}</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if upcoming.length === 0}
			<div class="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center">
				<CalendarDays class="size-6" aria-hidden="true" />
				<p class="text-sm">{t('calendar.noUpcoming')}</p>
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
							{CATEGORIES[ev.category].labelKey ? t(CATEGORIES[ev.category].labelKey) : ev.category}
						</Badge>
					</li>
				{/each}
			</ul>

			<Button variant="ghost" size="sm" class="text-muted-foreground mt-3 w-full justify-center">
				{t('calendar.viewAll')}
				<ArrowRight class="size-4" aria-hidden="true" />
			</Button>
		{/if}
	</Card.Content>
</Card.Root>
