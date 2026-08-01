<!-- TimePicker — a clock-face time selector with 12/24-hour support. -->
<script lang="ts">
	import * as Popover from '$lib/core/components/ui/popover';
	import { Button } from '$lib/core/components/ui/button';
	import { cn } from '$lib/core/utils';
	import { i18n, t } from '$lib/i18n';
	import ClockIcon from '@lucide/svelte/icons/clock-3';
	import XIcon from '@lucide/svelte/icons/x';
	import {
		currentTimeValue,
		formatTimeForDisplay,
		formatTimeValue,
		parseTimeValue
	} from './date-time-utils';

	type ClockView = 'hour' | 'minute';
	type Period = 'AM' | 'PM';

	interface Props {
		value?: string;
		open?: boolean;
		id?: string;
		name?: string;
		placeholder?: string;
		locale?: string;
		hour12?: boolean;
		disabled?: boolean;
		required?: boolean;
		clearable?: boolean;
		class?: string;
		onValueChange?: (value: string) => void;
		'aria-label'?: string;
		'aria-invalid'?: boolean | 'true' | 'false';
	}

	let {
		value = $bindable(''),
		open = $bindable(false),
		id,
		name,
		placeholder,
		locale,
		hour12 = true,
		disabled = false,
		required = false,
		clearable = true,
		class: className,
		onValueChange,
		'aria-label': ariaLabel,
		'aria-invalid': ariaInvalid
	}: Props = $props();

	let draftHour = $state(12);
	let draftMinute = $state(0);
	let view = $state<ClockView>('hour');
	let dragging = $state(false);
	let dragPointerId = $state<number | null>(null);
	let dragView = $state<ClockView | null>(null);

	const resolvedLocale = $derived(locale ?? i18n.locale);
	const resolvedPlaceholder = $derived(placeholder ?? t('dateTimePicker.pickTime'));
	const displayValue = $derived(value ? formatTimeForDisplay(value, resolvedLocale, hour12) : '');
	const period = $derived<Period>(draftHour >= 12 ? 'PM' : 'AM');
	const displayHour = $derived(hour12 ? draftHour % 12 || 12 : draftHour);
	const hourItems = $derived(
		hour12
			? Array.from({ length: 12 }, (_, index) => index + 1)
			: Array.from({ length: 24 }, (_, index) => index)
	);
	const minuteItems = Array.from({ length: 12 }, (_, index) => index * 5);
	const handAngle = $derived(
		view === 'minute' ? draftMinute * 6 - 90 : ((hour12 ? displayHour : draftHour) % 12) * 30 - 90
	);
	const handRadius = $derived(view === 'hour' && !hour12 && draftHour >= 12 ? 27 : 42);

	$effect(() => {
		if (!open) return;
		const parsed = parseTimeValue(value || currentTimeValue())!;
		draftHour = parsed.hour;
		draftMinute = parsed.minute;
		view = 'hour';
	});

	function positionStyle(index: number, total: number, radius: number): string {
		const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
		return `left: ${50 + Math.cos(angle) * radius}%; top: ${50 + Math.sin(angle) * radius}%`;
	}

	function selectHour(hour: number): void {
		if (hour12) {
			draftHour = period === 'PM' ? (hour % 12) + 12 : hour % 12;
		} else {
			draftHour = hour;
		}
		view = 'minute';
	}

	function updateFromPointer(event: PointerEvent, face: HTMLDivElement): void {
		const rect = face.getBoundingClientRect();
		const x = event.clientX - (rect.left + rect.width / 2);
		const y = event.clientY - (rect.top + rect.height / 2);
		if (x === 0 && y === 0) return;

		const fullTurn = Math.PI * 2;
		const angle = (Math.atan2(y, x) + Math.PI / 2 + fullTurn) % fullTurn;
		const activeView = dragView ?? view;

		if (activeView === 'minute') {
			draftMinute = Math.round((angle / fullTurn) * 60) % 60;
			return;
		}

		const dialIndex = Math.round((angle / fullTurn) * 12) % 12;
		if (hour12) {
			const hour = dialIndex === 0 ? 12 : dialIndex;
			draftHour = period === 'PM' ? (hour % 12) + 12 : hour % 12;
			return;
		}

		const distance = Math.hypot(x, y);
		const innerRing = distance < rect.width * 0.345;
		draftHour = dialIndex + (innerRing ? 12 : 0);
	}

	function handlePointerDown(event: PointerEvent): void {
		if (event.pointerType === 'mouse' && event.button !== 0) return;

		const face = event.currentTarget as HTMLDivElement;
		dragging = true;
		dragPointerId = event.pointerId;
		dragView = view;
		face.setPointerCapture(event.pointerId);
		updateFromPointer(event, face);
		event.preventDefault();
	}

	function handlePointerMove(event: PointerEvent): void {
		if (!dragging || event.pointerId !== dragPointerId) return;
		updateFromPointer(event, event.currentTarget as HTMLDivElement);
		event.preventDefault();
	}

	function handlePointerUp(event: PointerEvent): void {
		if (!dragging || event.pointerId !== dragPointerId) return;

		const face = event.currentTarget as HTMLDivElement;
		const completedView = dragView;
		updateFromPointer(event, face);
		dragging = false;
		dragPointerId = null;
		dragView = null;
		if (face.hasPointerCapture(event.pointerId)) face.releasePointerCapture(event.pointerId);
		if (completedView === 'hour') view = 'minute';
	}

	function handlePointerCancel(event: PointerEvent): void {
		if (event.pointerId !== dragPointerId) return;
		dragging = false;
		dragPointerId = null;
		dragView = null;
	}

	function selectPeriod(nextPeriod: Period): void {
		if (nextPeriod === period) return;
		draftHour = nextPeriod === 'PM' ? draftHour + 12 : draftHour - 12;
	}

	function commit(nextValue: string): void {
		value = nextValue;
		onValueChange?.(nextValue);
		open = false;
	}
</script>

<div class={cn('w-full', className)} data-slot="time-picker">
	<Popover.Root bind:open>
		<Popover.Trigger {disabled}>
			{#snippet child({ props })}
				<Button
					{...props}
					{id}
					variant="outline"
					class={cn(
						'w-full justify-start text-left font-normal',
						!value && 'text-muted-foreground'
					)}
					{disabled}
					aria-label={ariaLabel ?? resolvedPlaceholder}
					aria-required={required}
					aria-invalid={ariaInvalid}
				>
					<ClockIcon class="size-4" aria-hidden="true" />
					<span class="min-w-0 flex-1 truncate">{displayValue || resolvedPlaceholder}</span>
				</Button>
			{/snippet}
		</Popover.Trigger>

		<Popover.Content class="w-80 p-0" align="start">
			<div class="p-4 pb-3">
				<p class="text-muted-foreground text-center text-xs font-medium tracking-wide uppercase">
					{t('dateTimePicker.selectTime')}
				</p>
				<div class="mt-3 flex items-center justify-center gap-2">
					<button
						type="button"
						class={cn(
							'bg-muted rounded-lg px-3 py-2 text-4xl font-medium tabular-nums transition-colors',
							view === 'hour' && 'bg-primary text-primary-foreground'
						)}
						onclick={() => (view = 'hour')}
						aria-label={t('dateTimePicker.hour')}
					>
						{String(displayHour).padStart(2, '0')}
					</button>
					<span class="text-3xl font-semibold">:</span>
					<button
						type="button"
						class={cn(
							'bg-muted rounded-lg px-3 py-2 text-4xl font-medium tabular-nums transition-colors',
							view === 'minute' && 'bg-primary text-primary-foreground'
						)}
						onclick={() => (view = 'minute')}
						aria-label={t('dateTimePicker.minute')}
					>
						{String(draftMinute).padStart(2, '0')}
					</button>
					{#if hour12}
						<div class="border-input overflow-hidden rounded-md border">
							{#each ['AM', 'PM'] as item (item)}
								<button
									type="button"
									class={cn(
										'block px-2 py-1 text-xs font-medium transition-colors',
										item === period ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
									)}
									onclick={() => selectPeriod(item as Period)}
									aria-pressed={item === period}
								>
									{item === 'AM' ? t('dateTimePicker.am') : t('dateTimePicker.pm')}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<div class="px-4 pb-4">
				<div
					class={cn(
						'bg-muted relative mx-auto size-64 touch-none select-none rounded-full',
						dragging ? 'cursor-grabbing' : 'cursor-grab'
					)}
					role="group"
					aria-label={view === 'hour'
						? t('dateTimePicker.selectHour')
						: t('dateTimePicker.selectMinute')}
					onpointerdown={handlePointerDown}
					onpointermove={handlePointerMove}
					onpointerup={handlePointerUp}
					onpointercancel={handlePointerCancel}
				>
					<span
						class="bg-primary pointer-events-none absolute left-1/2 top-1/2 z-0 h-0.5 origin-left rounded-full"
						style={`width: ${handRadius}%; transform: translateY(-50%) rotate(${handAngle}deg)`}
						aria-hidden="true"
					></span>
					{#if view === 'hour'}
						{#each hourItems as hour (hour)}
							<button
								type="button"
								style={positionStyle(hour % 12, 12, !hour12 && hour >= 12 ? 27 : 42)}
								class={cn(
									'absolute z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm tabular-nums transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
									hour === draftHour || (hour12 && hour === displayHour)
										? 'bg-primary text-primary-foreground hover:bg-primary'
										: 'text-foreground'
								)}
								onclick={(event) => {
									if (event.detail === 0) selectHour(hour);
								}}
								aria-pressed={hour === draftHour || (hour12 && hour === displayHour)}
							>
								{hour}
							</button>
						{/each}
					{:else}
						{#each minuteItems as minute, index (minute)}
							<button
								type="button"
								style={positionStyle(index, 12, 42)}
								class={cn(
									'absolute z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm tabular-nums transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
									minute === draftMinute
										? 'bg-primary text-primary-foreground hover:bg-primary'
										: 'text-foreground'
								)}
								onclick={(event) => {
									if (event.detail === 0) draftMinute = minute;
								}}
								aria-pressed={minute === draftMinute}
							>
								{String(minute).padStart(2, '0')}
							</button>
						{/each}
						{#if draftMinute % 5 !== 0}
							<span
								class="bg-primary text-primary-foreground pointer-events-none absolute z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm tabular-nums"
								style={positionStyle(draftMinute, 60, 42)}
								aria-hidden="true"
							>
								{String(draftMinute).padStart(2, '0')}
							</span>
						{/if}
					{/if}
					<span
						class="bg-primary pointer-events-none absolute left-1/2 top-1/2 z-20 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
						aria-hidden="true"
					></span>
				</div>
			</div>

			<div class="flex items-center justify-between gap-2 border-t p-3">
				{#if clearable}
					<Button variant="ghost" size="sm" onclick={() => commit('')} disabled={!value}>
						<XIcon class="size-3.5" aria-hidden="true" />
						{t('dateTimePicker.clear')}
					</Button>
				{:else}
					<span></span>
				{/if}
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" onclick={() => (open = false)}
						>{t('common.cancel')}</Button
					>
					<Button size="sm" onclick={() => commit(formatTimeValue(draftHour, draftMinute))}>
						{t('dateTimePicker.apply')}
					</Button>
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>

	{#if name}
		<input type="hidden" {name} {value} {disabled} />
	{/if}
</div>
