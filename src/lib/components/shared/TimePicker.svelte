<!-- TimePicker — a clock-face time selector with 12/24-hour support. -->
<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
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
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
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
					class="bg-muted relative mx-auto size-64 rounded-full"
					role="group"
					aria-label={view === 'hour'
						? t('dateTimePicker.selectHour')
						: t('dateTimePicker.selectMinute')}
				>
					{#if view === 'hour'}
						{#each hourItems as hour, index (hour)}
							<button
								type="button"
								style={positionStyle(index % 12, 12, !hour12 && hour >= 12 ? 27 : 42)}
								class={cn(
									'absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm tabular-nums transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
									hour === draftHour || (hour12 && hour === displayHour)
										? 'bg-primary text-primary-foreground hover:bg-primary'
										: 'text-foreground'
								)}
								onclick={() => selectHour(hour)}
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
									'absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm tabular-nums transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
									minute === draftMinute
										? 'bg-primary text-primary-foreground hover:bg-primary'
										: 'text-foreground'
								)}
								onclick={() => (draftMinute = minute)}
								aria-pressed={minute === draftMinute}
							>
								{String(minute).padStart(2, '0')}
							</button>
						{/each}
					{/if}
					<span
						class="bg-primary absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
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
