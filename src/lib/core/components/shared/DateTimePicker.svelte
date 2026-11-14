<!-- DateTimePicker — a single confirmable popover for local date and time. -->
<script lang="ts">
	import * as Popover from '../ui/popover';
	import PickerTrigger from './PickerTrigger.svelte';
	import { Button } from '../ui/button';
	import { Calendar } from '../ui/calendar';
	import { Input } from '../ui/input';
	import { cn } from '../../utils';
	import { coreI18n } from '../../i18n.svelte';
	import { getLocalTimeZone, toCalendarDate, today, type DateValue } from '@internationalized/date';
	import CalendarClockIcon from '@lucide/svelte/icons/calendar-clock';
	import ClockIcon from '@lucide/svelte/icons/clock-3';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import XIcon from '@lucide/svelte/icons/x';
	import {
		currentTimeValue,
		dateValueToString,
		formatDateTimeForDisplay,
		isDateWithinBounds,
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
		/** Inclusive calendar-day bounds. Time components are ignored. */
		minValue?: DateValue;
		maxValue?: DateValue;
		disabled?: boolean;
		/** Announces a required field. Parent forms must validate the bound value. */
		required?: boolean;
		clearable?: boolean;
		class?: string;
		onValueChange?: (value: string) => void;
		'aria-label'?: string;
		'aria-invalid'?: boolean | 'true' | 'false';
		'aria-describedby'?: string;
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
		'aria-invalid': ariaInvalid,
		'aria-describedby': ariaDescribedby
	}: Props = $props();

	let draftDate = $state<DateValue | undefined>();
	let draftTime = $state('');

	const resolvedLocale = $derived(locale ?? coreI18n.locale);
	const resolvedPlaceholder = $derived(placeholder ?? coreI18n.t('dateTimePicker.pickDateTime'));
	const displayValue = $derived(
		value ? formatDateTimeForDisplay(value, resolvedLocale, hour12) : ''
	);
	const draftDateString = $derived(dateValueToString(draftDate));
	const canApply = $derived(
		isDateWithinBounds(draftDate, minValue, maxValue) && Boolean(parseTimeValue(draftTime))
	);

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
		if (nextValue) {
			const parsed = parseDateTimeValue(nextValue);
			if (!parsed || !isDateWithinBounds(parsed.date, minValue, maxValue)) return;
		}
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
		<PickerTrigger
			{id}
			icon={CalendarClockIcon}
			{displayValue}
			placeholder={resolvedPlaceholder}
			{disabled}
			{required}
			aria-label={ariaLabel}
			aria-invalid={ariaInvalid}
			aria-describedby={ariaDescribedby}
		/>

		<Popover.Content class="w-auto max-w-[calc(100vw-2rem)] overflow-hidden p-0" align="start">
			<div class="grid gap-2 border-b p-3 sm:grid-cols-2">
				<label class="relative block">
					<span class="sr-only">{coreI18n.t('dateTimePicker.date')}</span>
					<CalendarIcon
						class="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 z-10 size-4 -translate-y-1/2"
						aria-hidden="true"
					/>
					<Input
						type="date"
						value={draftDateString}
						onchange={updateDraftDate}
						min={minValue ? toCalendarDate(minValue).toString() : undefined}
						max={maxValue ? toCalendarDate(maxValue).toString() : undefined}
						class="ps-8"
					/>
				</label>
				<label class="relative block">
					<span class="sr-only">{coreI18n.t('dateTimePicker.time')}</span>
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
					<Button variant="ghost" size="sm" onclick={useNow}>
						{coreI18n.t('dateTimePicker.now')}
					</Button>
					{#if clearable}
						<Button variant="ghost" size="sm" onclick={() => commit('')} disabled={!value}>
							<XIcon class="size-3.5" aria-hidden="true" />
							{coreI18n.t('dateTimePicker.clear')}
						</Button>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" onclick={() => (open = false)}>
						{coreI18n.t('common.cancel')}
					</Button>
					<Button size="sm" disabled={!canApply} onclick={apply}>
						{coreI18n.t('dateTimePicker.apply')}
					</Button>
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>

	{#if name}
		<input type="hidden" {name} {value} {disabled} />
	{/if}
</div>
