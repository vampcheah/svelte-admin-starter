<script lang="ts">
	import FormField from '#lib/core/components/shared/FormField.svelte';
	import * as Select from '#lib/core/components/ui/select/index.ts';
	import { i18n, LOCALES, setLocale, t } from '#lib/i18n/index.ts';

	const label = $derived(LOCALES.find((locale) => locale.value === i18n.locale)?.label);

	function change(value: string): void {
		const locale = LOCALES.find((locale) => locale.value === value);
		if (locale) setLocale(locale.value);
	}
</script>

<FormField label={t('common.language')} description={t('settingsForm.languageHint')}>
	{#snippet children(control)}
		<Select.Root type="single" value={i18n.locale} onValueChange={change}>
			<Select.Trigger {...control} class="w-full">{label}</Select.Trigger>
			<Select.Content>
				{#each LOCALES as locale (locale.value)}
					<Select.Item value={locale.value} label={locale.label}>{locale.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	{/snippet}
</FormField>
