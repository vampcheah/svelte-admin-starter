<!--
  Dashboard — the flagship overview page. KPI stat cards, a revenue area chart,
  a traffic-by-channel bar list, and a recent-activity feed. All mock data.

  Charts are hand-rolled with SVG/CSS using design tokens. layerchart's high-level
  AreaChart/BarChart components are intentionally avoided here: their published
  prop types (data/x/y/series only) don't expose the axis/tooltip/props fields
  their runtime accepts, so wiring them up would not type-check under svelte-check.
  A clean SVG area chart + a token-based bar list are fully responsive and exact.
-->
<script lang="ts">
	import DollarSign from '@lucide/svelte/icons/dollar-sign';
	import Users from '@lucide/svelte/icons/users';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import Activity from '@lucide/svelte/icons/activity';
	import Download from '@lucide/svelte/icons/download';
	import type { Component } from 'svelte';

	import { PageContainer, StatCard } from '$lib/components/shared';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';

	import { auth } from '$lib/auth';
	import { t } from '$lib/i18n';
	import { stats, revenueSeries, recentActivity, trafficByChannel } from '$lib/data/dashboard';
	import { formatDate, formatNumber, initials } from '$lib/utils/formatters';
	import { exportToCsv } from '$lib/utils/csv';

	// Map each stat to a Lucide icon (data stays icon-free per the contract).
	const statIcons: Component[] = [DollarSign, Users, CreditCard, Activity];

	// First name for the greeting, falling back gracefully.
	const firstName = $derived(auth.user?.name?.split(' ')[0] ?? 'there');

	// Today's date for the hero banner (e.g. "Monday, June 9").
	const today = formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' });

	// Format a "2024-07" month key into a short label like "Jul".
	function monthLabel(key: string): string {
		const [year, month] = key.split('-').map(Number);
		return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short' });
	}

	// --- Revenue area chart geometry (responsive via viewBox) ---
	const CHART_W = 600;
	const CHART_H = 220;
	const PAD_X = 8;
	const PAD_Y = 16;

	const maxRevenue = $derived(Math.max(...revenueSeries.map((d) => d.revenue)));
	const minRevenue = $derived(Math.min(...revenueSeries.map((d) => d.revenue)));

	// Map a data point to chart coordinates.
	function pointX(i: number): number {
		const span = revenueSeries.length - 1 || 1;
		return PAD_X + (i / span) * (CHART_W - PAD_X * 2);
	}
	function pointY(value: number): number {
		const range = maxRevenue - minRevenue || 1;
		const ratio = (value - minRevenue) / range;
		return CHART_H - PAD_Y - ratio * (CHART_H - PAD_Y * 2);
	}

	const linePath = $derived(
		revenueSeries.map((d, i) => `${i === 0 ? 'M' : 'L'}${pointX(i)},${pointY(d.revenue)}`).join(' ')
	);
	const areaPath = $derived(
		`${linePath} L${pointX(revenueSeries.length - 1)},${CHART_H - PAD_Y} L${pointX(0)},${CHART_H - PAD_Y} Z`
	);

	// --- Traffic bar list ---
	const maxVisitors = $derived(Math.max(...trafficByChannel.map((d) => d.visitors)));

	// Export the revenue series as CSV.
	function downloadReport() {
		exportToCsv(revenueSeries, 'revenue-report.csv', [
			{ key: 'date', header: 'Month' },
			{ key: 'revenue', header: 'Revenue' },
			{ key: 'orders', header: 'Orders' }
		]);
	}
</script>

<svelte:head>
	<title>Dashboard · Admin Starter</title>
</svelte:head>

<PageContainer>
	<!-- Hero greeting -->
	<div
		class="from-primary/10 via-primary/5 to-card relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 sm:p-8"
	>
		<div
			class="bg-primary/10 pointer-events-none absolute -top-16 -right-12 size-56 rounded-full blur-3xl"
			aria-hidden="true"
		></div>
		<div class="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="space-y-1.5">
				<p class="text-muted-foreground text-sm font-medium">{today}</p>
				<h1 class="text-2xl font-semibold tracking-tight">
					{t('dashboard.greeting', { name: firstName })}
				</h1>
				<p class="text-muted-foreground">
					Here is what is happening across your workspace today.
				</p>
			</div>
			<Button onclick={downloadReport} class="shrink-0">
				<Download class="size-4" aria-hidden="true" />
				Download
			</Button>
		</div>
	</div>

	<!-- KPI stat cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat, i (stat.title)}
			<StatCard
				title={stat.title}
				value={stat.value}
				change={stat.change}
				trend={stat.trend}
				icon={statIcons[i]}
				hint="vs last month"
			/>
		{/each}
	</div>

	<!-- Charts row: revenue (wide) + traffic (narrow) -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-7">
		<Card.Root class="lg:col-span-4">
			<Card.Header>
				<Card.Title>Revenue overview</Card.Title>
				<Card.Description>Monthly revenue over the last 12 months</Card.Description>
			</Card.Header>
			<Card.Content>
				<svg
					viewBox="0 0 {CHART_W} {CHART_H}"
					class="h-[220px] w-full overflow-visible"
					preserveAspectRatio="none"
					role="img"
					aria-label="Revenue over the last 12 months"
				>
					<defs>
						<linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="var(--primary)" stop-opacity="0.25" />
							<stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
						</linearGradient>
					</defs>
					<!-- Area fill -->
					<path d={areaPath} fill="url(#revenue-fill)" />
					<!-- Line -->
					<path
						d={linePath}
						fill="none"
						stroke="var(--primary)"
						stroke-width="2"
						stroke-linejoin="round"
						stroke-linecap="round"
						vector-effect="non-scaling-stroke"
					/>
					<!-- Data points -->
					{#each revenueSeries as d, i (d.date)}
						<circle cx={pointX(i)} cy={pointY(d.revenue)} r="2.5" fill="var(--primary)" />
					{/each}
				</svg>
				<!-- X axis labels -->
				<div class="mt-2 flex justify-between text-xs text-muted-foreground">
					{#each revenueSeries as d (d.date)}
						<span class="flex-1 text-center first:text-left last:text-right">{monthLabel(d.date)}</span>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="lg:col-span-3">
			<Card.Header>
				<Card.Title>Traffic by channel</Card.Title>
				<Card.Description>Visitors grouped by acquisition channel</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#each trafficByChannel as item (item.channel)}
					<div class="space-y-1.5">
						<div class="flex items-center justify-between text-sm">
							<span class="text-foreground">{item.channel}</span>
							<span class="font-medium tabular-nums text-muted-foreground">
								{formatNumber(item.visitors)}
							</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
							<div
								class="h-full rounded-full bg-primary"
								style="width: {(item.visitors / maxVisitors) * 100}%"
							></div>
						</div>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Recent activity feed -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Recent activity</Card.Title>
			<Card.Description>Latest actions taken by your team</Card.Description>
		</Card.Header>
		<Card.Content>
			<ul class="divide-y divide-border">
				{#each recentActivity as item (item.id)}
					<li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
						<Avatar.Root class="size-9">
							<Avatar.Fallback class="text-xs">{initials(item.user)}</Avatar.Fallback>
						</Avatar.Root>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm text-foreground">
								<span class="font-medium">{item.user}</span>
								<span class="text-muted-foreground"> {item.action} </span>
								<span class="font-medium">{item.target}</span>
							</p>
						</div>
						<span class="shrink-0 text-xs text-muted-foreground">{item.time}</span>
					</li>
				{/each}
			</ul>
		</Card.Content>
	</Card.Root>
</PageContainer>
