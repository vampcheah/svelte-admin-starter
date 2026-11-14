<!-- DateRangePicker — a two-month interactive calendar popover for date range selection. -->
<script lang="ts">
	import * as Popover from '../ui/popover';
	import PickerTrigger from './PickerTrigger.svelte';
	import { Button } from '../ui/button';
	import { RangeCalendar } from '../ui/range-calendar';
	import { cn } from '../../utils';
	import { coreI18n } from '../../i18n.svelte';
	import type { DateValue } from '@internationalized/date';
	import type { DateRange } from 'bits-ui';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import XIcon from '@lucide/svelte/icons/x';
	import {
		dateRangeToString,
		formatDateRangeForDisplay,
		formatDateValueForDisplay
	} from './date-time-utils';

	interface Props {
		value?: DateRange;
		open?: boolean;
		id?: string;
		name?: string;
		placeholder?: string;
		locale?: string;
		numberOfMonths?: number;
		minValue?: DateValue;
		maxValue?: DateValue;
		disabled?: boolean;
		/** Announces a required field. Parent forms must validate the bound range. */
		required?: boolean;
		clearable?: boolean;
		class?: string;
		onValueChange?: (value: DateRange | undefined) => void;
		'aria-label'?: string;
		'aria-invalid'?: boolean | 'true' | 'false';
		'aria-describedby'?: string;
	}

	let {
		value = $bindable(undefined),
		open = $bindable(false),
		id,
		name,
		placeholder,
		locale,
		numberOfMonths = 2,
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

	const resolvedLocale = $derived(locale ?? coreI18n.locale);
	const resolvedPlaceholder = $derived(placeholder ?? coreI18n.t('dateTimePicker.selectDateRange'));

	const displayValue = $derived.by(() => {
		if (!value?.start) return '';
		if (!value.end) return formatDateValueForDisplay(value.start, resolvedLocale);
		return formatDateRangeForDisplay(value, resolvedLocale);
	});

	const hasValue = $derived(Boolean(value?.start || value?.end));

	function handleRangeChange(nextRange: DateRange | undefined): void {
		value = nextRange;
		onValueChange?.(nextRange);
	}

	function handleClear(): void {
		value = undefined;
		onValueChange?.(undefined);
	}

	const stringValues = $derived(dateRangeToString(value));
</script>

<div class={cn('w-full', className)} data-slot="date-range-picker">
	<Popover.Root bind:open>
		<PickerTrigger
			{id}
			icon={CalendarIcon}
			{displayValue}
			placeholder={resolvedPlaceholder}
			{disabled}
			{required}
			aria-label={ariaLabel}
			aria-invalid={ariaInvalid}
			aria-describedby={ariaDescribedby}
		/>

		<Popover.Content class="w-auto max-w-[calc(100vw-2rem)] overflow-hidden p-0" align="start">
			<div class="flex items-center justify-between gap-4 border-b px-4 py-3">
				<p class="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
					{coreI18n.t('dateTimePicker.selectDateRange')}
				</p>
				<p class="min-h-6 min-w-0 truncate text-right text-sm font-semibold">
					{displayValue || resolvedPlaceholder}
				</p>
			</div>

			<div class="p-2 sm:p-3">
				<RangeCalendar
					bind:value
					{numberOfMonths}
					{minValue}
					{maxValue}
					locale={resolvedLocale}
					class="mx-auto w-fit"
					onValueChange={handleRangeChange}
				/>
			</div>

			<div class="flex items-center justify-between gap-2 border-t p-3">
				{#if clearable}
					<Button variant="ghost" size="sm" onclick={handleClear} disabled={!hasValue}>
						<XIcon class="size-3.5" aria-hidden="true" />
						{coreI18n.t('dateTimePicker.clear')}
					</Button>
				{:else}
					<span></span>
				{/if}
				<div class="flex gap-2">
					<Button variant="outline" size="sm" onclick={() => (open = false)}>
						{coreI18n.t('dateTimePicker.close')}
					</Button>
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>

	{#if name}
		<input type="hidden" name="{name}_start" value={stringValues.start} {disabled} />
		<input type="hidden" name="{name}_end" value={stringValues.end} {disabled} />
	{/if}
</div>
