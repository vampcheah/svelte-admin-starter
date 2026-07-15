<!-- DatePicker — a form-ready, confirmable calendar popover. -->
<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import { cn } from '$lib/utils';
	import { i18n, t } from '$lib/i18n';
	import type { DateValue } from '@internationalized/date';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import XIcon from '@lucide/svelte/icons/x';
	import { dateValueToString, formatDateForDisplay, parseDateValue } from './date-time-utils';

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

	let draftValue = $state<DateValue | undefined>();
	const resolvedLocale = $derived(locale ?? i18n.locale);
	const resolvedPlaceholder = $derived(placeholder ?? t('dateTimePicker.pickDate'));
	const displayValue = $derived(value ? formatDateForDisplay(value, resolvedLocale) : '');

	$effect(() => {
		if (open) draftValue = parseDateValue(value);
	});

	function commit(nextValue: string): void {
		value = nextValue;
		onValueChange?.(nextValue);
		open = false;
	}
</script>

<div class={cn('w-full', className)} data-slot="date-picker">
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
					<CalendarIcon class="size-4" aria-hidden="true" />
					<span class="min-w-0 flex-1 truncate">{displayValue || resolvedPlaceholder}</span>
				</Button>
			{/snippet}
		</Popover.Trigger>

		<Popover.Content class="w-auto overflow-hidden p-0" align="start">
			<div class="border-b px-4 py-3">
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
					{t('dateTimePicker.selectDate')}
				</p>
				<p class="mt-1 min-h-6 text-base font-semibold">
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
			/>
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
					<Button variant="ghost" size="sm" onclick={() => (open = false)}>
						{t('common.cancel')}
					</Button>
					<Button
						size="sm"
						disabled={!draftValue}
						onclick={() => commit(dateValueToString(draftValue))}
					>
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
