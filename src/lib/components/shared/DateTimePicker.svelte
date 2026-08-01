<!-- DateTimePicker — a single confirmable popover for local date and time. -->
<script lang="ts">
	import * as Popover from '$lib/core/components/ui/popover';
	import { Button } from '$lib/core/components/ui/button';
	import { Calendar } from '$lib/core/components/ui/calendar';
	import { Input } from '$lib/core/components/ui/input';
	import { cn } from '$lib/core/utils';
	import { i18n, t } from '$lib/i18n';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import CalendarClockIcon from '@lucide/svelte/icons/calendar-clock';
	import ClockIcon from '@lucide/svelte/icons/clock-3';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import XIcon from '@lucide/svelte/icons/x';
	import {
		currentTimeValue,
		dateValueToString,
		formatDateTimeForDisplay,
		parseDateTimeValue,
		parseDateValue,
		parseTimeValue
	} from './date-time-utils';

	interface Props {
		value?: string;
		open?: boolean;
		id?: string;
		name?: string;
		placeholder?: string;
		locale?: string;
		hour12?: boolean;
		minValue?: DateValue;
		maxValue?: DateValue;
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
		hour12,
		minValue,
		maxValue,
		disabled = false,
		required = false,
		clearable = true,
		class: className,
		onValueChange,
		'aria-label': ariaLabel,
		'aria-invalid': ariaInvalid
	}: Props = $props();

	let draftDate = $state<DateValue | undefined>();
	let draftTime = $state('');

	const resolvedLocale = $derived(locale ?? i18n.locale);
	const resolvedPlaceholder = $derived(placeholder ?? t('dateTimePicker.pickDateTime'));
	const displayValue = $derived(
		value ? formatDateTimeForDisplay(value, resolvedLocale, hour12) : ''
	);
	const draftDateString = $derived(dateValueToString(draftDate));
	const canApply = $derived(Boolean(draftDate && parseTimeValue(draftTime)));

	$effect(() => {
		if (!open) return;
		const parsed = parseDateTimeValue(value);
		draftDate = parsed?.date;
		draftTime = parsed?.time ?? currentTimeValue();
	});

	function updateDraftDate(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		draftDate = parseDateValue(input.value);
	}

	function commit(nextValue: string): void {
		value = nextValue;
		onValueChange?.(nextValue);
		open = false;
	}

	function apply(): void {
		if (!canApply) return;
		commit(`${dateValueToString(draftDate)}T${draftTime}`);
	}

	function useNow(): void {
		draftDate = today(getLocalTimeZone());
		draftTime = currentTimeValue();
	}
</script>

<div class={cn('w-full', className)} data-slot="date-time-picker">
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
					<CalendarClockIcon class="size-4" aria-hidden="true" />
					<span class="min-w-0 flex-1 truncate">{displayValue || resolvedPlaceholder}</span>
				</Button>
			{/snippet}
		</Popover.Trigger>

		<Popover.Content class="w-auto max-w-[calc(100vw-2rem)] overflow-hidden p-0" align="start">
			<div class="grid gap-2 border-b p-3 sm:grid-cols-2">
				<label class="relative block">
					<span class="sr-only">{t('dateTimePicker.date')}</span>
					<CalendarIcon
						class="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 z-10 size-4 -translate-y-1/2"
						aria-hidden="true"
					/>
					<Input
						type="date"
						value={draftDateString}
						onchange={updateDraftDate}
						min={minValue?.toString()}
						max={maxValue?.toString()}
						class="ps-8"
					/>
				</label>
				<label class="relative block">
					<span class="sr-only">{t('dateTimePicker.time')}</span>
					<ClockIcon
						class="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 z-10 size-4 -translate-y-1/2"
						aria-hidden="true"
					/>
					<Input type="time" bind:value={draftTime} class="ps-8" />
				</label>
			</div>

			<Calendar
				type="single"
				bind:value={draftDate}
				{minValue}
				{maxValue}
				locale={resolvedLocale}
				captionLayout="dropdown"
				class="mx-auto w-fit"
			/>

			<div class="flex flex-wrap items-center justify-between gap-2 border-t p-3">
				<div class="flex gap-1">
					<Button variant="ghost" size="sm" onclick={useNow}>{t('dateTimePicker.now')}</Button>
					{#if clearable}
						<Button variant="ghost" size="sm" onclick={() => commit('')} disabled={!value}>
							<XIcon class="size-3.5" aria-hidden="true" />
							{t('dateTimePicker.clear')}
						</Button>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" onclick={() => (open = false)}
						>{t('common.cancel')}</Button
					>
					<Button size="sm" disabled={!canApply} onclick={apply}>{t('dateTimePicker.apply')}</Button
					>
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>

	{#if name}
		<input type="hidden" {name} {value} {disabled} />
	{/if}
</div>
