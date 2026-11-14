<!-- DatePicker — a form-ready, confirmable calendar popover. -->
<script lang="ts">
	import * as Popover from '../ui/popover';
	import PickerTrigger from './PickerTrigger.svelte';
	import { Button } from '../ui/button';
	import { Calendar } from '../ui/calendar';
	import { cn } from '../../utils';
	import { coreI18n } from '../../i18n.svelte';
	import type { DateValue } from '@internationalized/date';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import XIcon from '@lucide/svelte/icons/x';
	import {
		dateValueToString,
		formatDateForDisplay,
		isDateWithinBounds,
		parseDateValue
	} from './date-time-utils';

	interface Props {
		value?: string;
		open?: boolean;
		id?: string;
		name?: string;
		placeholder?: string;
		locale?: string;
		minValue?: DateValue;
		maxValue?: DateValue;
		disabled?: boolean;
		/** Announces a required field. Parent forms must validate the bound value. */
		required?: boolean;
		clearable?: boolean;
		/** Commit calendar selections immediately instead of requiring Apply. */
		commitOnSelect?: boolean;
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
		minValue,
		maxValue,
		disabled = false,
		required = false,
		clearable = true,
		commitOnSelect = false,
		class: className,
		onValueChange,
		'aria-label': ariaLabel,
		'aria-invalid': ariaInvalid,
		'aria-describedby': ariaDescribedby
	}: Props = $props();

	let draftValue = $state<DateValue | undefined>();
	const resolvedLocale = $derived(locale ?? coreI18n.locale);
	const resolvedPlaceholder = $derived(placeholder ?? coreI18n.t('dateTimePicker.pickDate'));
	const displayValue = $derived(value ? formatDateForDisplay(value, resolvedLocale) : '');
	const canApply = $derived(isDateWithinBounds(draftValue, minValue, maxValue));

	$effect(() => {
		if (open) draftValue = parseDateValue(value);
	});

	function commit(nextValue: string): void {
		if (nextValue && !isDateWithinBounds(parseDateValue(nextValue), minValue, maxValue)) return;
		value = nextValue;
		onValueChange?.(nextValue);
		open = false;
	}
</script>

<div class={cn('w-full', className)} data-slot="date-picker">
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

		<Popover.Content class="w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden p-0" align="start">
			<div class="flex items-center justify-between gap-4 border-b px-4 py-3">
				<p class="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
					{coreI18n.t('dateTimePicker.selectDate')}
				</p>
				<p class="min-h-6 min-w-0 truncate text-right text-base font-semibold">
					{draftValue
						? formatDateForDisplay(dateValueToString(draftValue), resolvedLocale)
						: resolvedPlaceholder}
				</p>
			</div>
			<Calendar
				type="single"
				bind:value={draftValue}
				{minValue}
				{maxValue}
				locale={resolvedLocale}
				captionLayout="dropdown"
				class="mx-auto w-fit"
				onValueChange={(nextValue) => {
					if (commitOnSelect) commit(dateValueToString(nextValue));
				}}
			/>
			<div class="flex items-center justify-between gap-2 border-t p-3">
				{#if clearable}
					<Button variant="ghost" size="sm" onclick={() => commit('')} disabled={!value}>
						<XIcon class="size-3.5" aria-hidden="true" />
						{coreI18n.t('dateTimePicker.clear')}
					</Button>
				{:else}
					<span></span>
				{/if}
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" onclick={() => (open = false)}>
						{coreI18n.t('common.cancel')}
					</Button>
					{#if !commitOnSelect}
						<Button
							size="sm"
							disabled={!canApply}
							onclick={() => commit(dateValueToString(draftValue))}
						>
							{coreI18n.t('dateTimePicker.apply')}
						</Button>
					{/if}
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>

	{#if name}
		<input type="hidden" {name} {value} {disabled} />
	{/if}
</div>
