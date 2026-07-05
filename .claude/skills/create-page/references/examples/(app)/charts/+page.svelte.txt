<!--
  Charts showcase — a reference gallery of four common chart types.

  The area (Revenue), bar (Traffic) and line (Orders) charts are hand-rolled and
  fully self-contained: a fixed-height plot, HTML y-axis labels centered on each
  gridline, and HTML x-axis labels. This keeps them light and guarantees nothing
  overflows the card at any width. The donut (Channel share) has no axes, so it
  stays on layerchart's PieChart. Fed by mock dashboard data — no backend.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Chart from '$lib/components/ui/chart';
	import { PageContainer, PageHeader } from '$lib/components/shared';
	import { revenueSeries, trafficByChannel } from '$lib/data/dashboard';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import { PieChart } from 'layerchart';

	// Turn the "2025-06" month strings into short labels like "Jun" for the axes.
	function monthLabel(date: string): string {
		const d = new Date(`${date}-01T00:00:00`);
		return d.toLocaleDateString('en-US', { month: 'short' });
	}

	// Pre-shape the series so accessors stay simple string keys.
	const revenueData = revenueSeries.map((r) => ({
		month: monthLabel(r.date),
		revenue: r.revenue,
		orders: r.orders
	}));

	const trafficData = trafficByChannel.map((c) => ({
		channel: c.channel,
		visitors: c.visitors
	}));

	// Compute a "nice" axis maximum and evenly spaced ticks for a given data max.
	function niceScale(max: number, count = 5): { niceMax: number; ticks: number[] } {
		const rawStep = max / count;
		const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
		const norm = rawStep / mag;
		const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
		const niceMax = Math.ceil(max / step) * step;
		const ticks: number[] = [];
		for (let v = 0; v <= niceMax + 1e-9; v += step) ticks.push(Math.round(v));
		return { niceMax, ticks };
	}

	// Shared plot height + line/area SVG viewBox width (paths stretch to fit).
	const CHART_H = 240;
	const CHART_W = 720;

	const rev = niceScale(Math.max(...revenueData.map((d) => d.revenue)));
	const ord = niceScale(Math.max(...revenueData.map((d) => d.orders)));
	const traf = niceScale(Math.max(...trafficData.map((d) => d.visitors)));

	const xAt = (i: number) => (i / (revenueData.length - 1)) * CHART_W;
	const yAt = (v: number, niceMax: number) => (1 - v / niceMax) * CHART_H;

	const revLine = revenueData
		.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(d.revenue, rev.niceMax)}`)
		.join(' ');
	const revArea = `${revLine} L${xAt(revenueData.length - 1)},${CHART_H} L${xAt(0)},${CHART_H} Z`;
	const ordLine = revenueData
		.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(d.orders, ord.niceMax)}`)
		.join(' ');

	// Donut palette + config (the only chart still on layerchart).
	const palette = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	];
	const channelConfig = Object.fromEntries(
		trafficData.map((d, i) => [d.channel, { label: d.channel, color: palette[i % palette.length] }])
	) satisfies Chart.ChartConfig;
	const totalVisitors = trafficData.reduce((sum, d) => sum + d.visitors, 0);
</script>

<svelte:head>
	<title>Charts · Admin Starter</title>
</svelte:head>

{#snippet yAxis(ticks: number[], niceMax: number, fmt: (v: number) => string)}
	<div class="relative w-14 shrink-0" style="height: {CHART_H}px" aria-hidden="true">
		{#each ticks as t (t)}
			<span
				class="text-muted-foreground absolute right-1 -translate-y-1/2 text-xs leading-none tabular-nums"
				style="top: {(1 - t / niceMax) * 100}%"
			>
				{fmt(t)}
			</span>
		{/each}
	</div>
{/snippet}

{#snippet xMonths()}
	<div class="text-muted-foreground mt-2 flex justify-between text-xs">
		{#each revenueData as d (d.month)}
			<span>{d.month}</span>
		{/each}
	</div>
{/snippet}

<PageContainer>
	<PageHeader
		title="Charts"
		description="A gallery of common chart types wired to the mock dashboard data."
	/>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Area chart — monthly revenue -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Revenue</Card.Title>
				<Card.Description>Monthly revenue over the last 12 months.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex gap-3">
					{@render yAxis(rev.ticks, rev.niceMax, (v) => formatCurrency(v).replace('.00', ''))}
					<div class="min-w-0 flex-1">
						<svg
							viewBox="0 0 {CHART_W} {CHART_H}"
							class="w-full"
							style="height: {CHART_H}px"
							preserveAspectRatio="none"
							role="img"
							aria-label="Monthly revenue over the last 12 months"
						>
							<defs>
								<linearGradient id="rev-area" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stop-color="var(--chart-1)" stop-opacity="0.25" />
									<stop offset="100%" stop-color="var(--chart-1)" stop-opacity="0" />
								</linearGradient>
							</defs>
							{#each rev.ticks as t (t)}
								<line
									x1="0"
									x2={CHART_W}
									y1={yAt(t, rev.niceMax)}
									y2={yAt(t, rev.niceMax)}
									stroke="var(--border)"
									stroke-width="1"
									vector-effect="non-scaling-stroke"
								/>
							{/each}
							<path d={revArea} fill="url(#rev-area)" />
							<path
								d={revLine}
								fill="none"
								stroke="var(--chart-1)"
								stroke-width="2"
								stroke-linejoin="round"
								stroke-linecap="round"
								vector-effect="non-scaling-stroke"
							/>
						</svg>
						{@render xMonths()}
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Bar chart — visitors by channel (CSS bars, perfectly rounded) -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Traffic by channel</Card.Title>
				<Card.Description>Visitor sessions grouped by acquisition channel.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex gap-3">
					{@render yAxis(traf.ticks, traf.niceMax, (v) => formatNumber(v))}
					<div class="min-w-0 flex-1">
						<div class="relative" style="height: {CHART_H}px">
							{#each traf.ticks as t (t)}
								<div
									class="border-border absolute inset-x-0 border-t"
									style="top: {(1 - t / traf.niceMax) * 100}%"
								></div>
							{/each}
							<div class="absolute inset-0 flex items-end gap-2 px-1">
								{#each trafficData as d (d.channel)}
									<div class="flex h-full flex-1 items-end justify-center">
										<div
											class="bg-chart-1 w-full max-w-14 rounded-t-md"
											style="height: {(d.visitors / traf.niceMax) * 100}%"
										></div>
									</div>
								{/each}
							</div>
						</div>
						<div class="text-muted-foreground mt-2 flex gap-2 px-1 text-xs">
							{#each trafficData as d (d.channel)}
								<span class="flex-1 text-center leading-tight text-balance">{d.channel}</span>
							{/each}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Line chart — monthly orders -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Orders</Card.Title>
				<Card.Description>Number of orders placed each month.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex gap-3">
					{@render yAxis(ord.ticks, ord.niceMax, (v) => formatNumber(v))}
					<div class="min-w-0 flex-1">
						<svg
							viewBox="0 0 {CHART_W} {CHART_H}"
							class="w-full"
							style="height: {CHART_H}px"
							preserveAspectRatio="none"
							role="img"
							aria-label="Number of orders placed each month"
						>
							{#each ord.ticks as t (t)}
								<line
									x1="0"
									x2={CHART_W}
									y1={yAt(t, ord.niceMax)}
									y2={yAt(t, ord.niceMax)}
									stroke="var(--border)"
									stroke-width="1"
									vector-effect="non-scaling-stroke"
								/>
							{/each}
							<path
								d={ordLine}
								fill="none"
								stroke="var(--chart-2)"
								stroke-width="2"
								stroke-linejoin="round"
								stroke-linecap="round"
								vector-effect="non-scaling-stroke"
							/>
						</svg>
						{@render xMonths()}
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Donut chart — share of traffic by channel -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Channel share</Card.Title>
				<Card.Description>Each channel's share of total visitors.</Card.Description>
			</Card.Header>
			<Card.Content class="flex items-center justify-center">
				<Chart.Container config={channelConfig} class="mx-auto aspect-square h-[260px]">
					<PieChart
						data={trafficData}
						key="channel"
						value="visitors"
						c="channel"
						cRange={palette}
						innerRadius={60}
						padAngle={0.02}
						props={{ pie: { motion: 'tween' } }}
					>
						{#snippet aboveMarks()}
							<text
								x="50%"
								y="50%"
								text-anchor="middle"
								class="fill-foreground text-lg font-semibold"
							>
								{formatNumber(totalVisitors)}
							</text>
							<text
								x="50%"
								y="50%"
								dy="20"
								text-anchor="middle"
								class="fill-muted-foreground text-xs"
							>
								Visitors
							</text>
						{/snippet}
						{#snippet tooltip()}
							<Chart.Tooltip nameKey="channel" hideLabel />
						{/snippet}
					</PieChart>
				</Chart.Container>
			</Card.Content>
		</Card.Root>
	</div>
</PageContainer>
