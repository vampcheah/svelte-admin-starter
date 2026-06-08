<!--
  Charts showcase — a reference gallery of the four most common chart types
  (area, bar, line, donut) built on `$lib/components/ui/chart` + layerchart's
  simplified chart components, fed by the mock dashboard data. Each chart lives
  in its own titled Card. No backend — everything reads from static mock data.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Chart from '$lib/components/ui/chart';
	import { PageContainer, PageHeader } from '$lib/components/shared';
	import { revenueSeries, trafficByChannel } from '$lib/data/dashboard';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import { AreaChart, BarChart, LineChart, PieChart } from 'layerchart';

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

	// Five-color palette (chart token vars defined by the theme) used for the
	// bar series and the donut slices.
	const palette = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	];

	// Chart configs drive the tooltip labels rendered by `Chart.Tooltip`.
	const revenueConfig = {
		revenue: { label: 'Revenue', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	const ordersConfig = {
		orders: { label: 'Orders', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;

	const trafficConfig = {
		visitors: { label: 'Visitors', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	// Per-channel config so the donut tooltip resolves a readable label per slice.
	const channelConfig = Object.fromEntries(
		trafficData.map((d, i) => [d.channel, { label: d.channel, color: palette[i % palette.length] }])
	) satisfies Chart.ChartConfig;

	const totalVisitors = trafficData.reduce((sum, d) => sum + d.visitors, 0);
</script>

<svelte:head>
	<title>Charts · Admin Starter</title>
</svelte:head>

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
				<Chart.Container config={revenueConfig} class="h-[260px] w-full">
					<AreaChart
						data={revenueData}
						x="month"
						y="revenue"
						series={[{ key: 'revenue', label: 'Revenue', color: 'var(--chart-1)' }]}
						props={{
							area: { 'fill-opacity': 0.2, line: { class: 'stroke-2' } },
							yAxis: { format: (v: number) => formatCurrency(v).replace('.00', '') }
						}}
					>
						{#snippet tooltip()}
							<Chart.Tooltip labelKey="month" />
						{/snippet}
					</AreaChart>
				</Chart.Container>
			</Card.Content>
		</Card.Root>

		<!-- Bar chart — visitors by channel -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Traffic by channel</Card.Title>
				<Card.Description>Visitor sessions grouped by acquisition channel.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Chart.Container config={trafficConfig} class="h-[260px] w-full">
					<BarChart
						data={trafficData}
						x="channel"
						y="visitors"
						bandPadding={0.25}
						series={[{ key: 'visitors', label: 'Visitors', color: 'var(--chart-1)' }]}
						props={{
							yAxis: { format: (v: number) => formatNumber(v) },
							bars: { rounded: 'top', radius: 6 }
						}}
					>
						{#snippet tooltip()}
							<Chart.Tooltip labelKey="channel" />
						{/snippet}
					</BarChart>
				</Chart.Container>
			</Card.Content>
		</Card.Root>

		<!-- Line chart — monthly orders -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Orders</Card.Title>
				<Card.Description>Number of orders placed each month.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Chart.Container config={ordersConfig} class="h-[260px] w-full">
					<LineChart
						data={revenueData}
						x="month"
						y="orders"
						series={[{ key: 'orders', label: 'Orders', color: 'var(--chart-2)' }]}
						props={{
							spline: { class: 'stroke-2' },
							yAxis: { format: (v: number) => formatNumber(v) }
						}}
					>
						{#snippet tooltip()}
							<Chart.Tooltip labelKey="month" />
						{/snippet}
					</LineChart>
				</Chart.Container>
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
