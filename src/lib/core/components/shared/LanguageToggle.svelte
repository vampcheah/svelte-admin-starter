<!--
  LanguageToggle — dropdown that lists the available locales and
  switches the active one. A check marks the current locale.
-->
<script lang="ts">
	import Languages from '@lucide/svelte/icons/languages';
	import Check from '@lucide/svelte/icons/check';
	import * as DropdownMenu from '../ui/dropdown-menu';
	import { Button } from '../ui/button';
	import { coreI18n, type LocaleOption } from '../../i18n.svelte';

	interface Props {
		locales?: readonly LocaleOption[];
		locale?: string;
		label?: string;
		onSelect?: (value: string) => void;
	}

	let { locales, locale, label, onSelect }: Props = $props();

	const activeLocales = $derived(locales ?? coreI18n.locales);
	const activeLocale = $derived(locale ?? coreI18n.locale);
	const resolvedLabel = $derived(label ?? coreI18n.t('common.changeLanguage'));

	function handleSelect(val: string) {
		if (onSelect) {
			onSelect(val);
		} else {
			coreI18n.setLocale(val);
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" size="icon" aria-label={resolvedLabel} {...props}>
				<Languages class="size-4" aria-hidden="true" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="min-w-40">
		{#each activeLocales as item (item.value)}
			<DropdownMenu.Item onSelect={() => handleSelect(item.value)} class="justify-between">
				<span>{item.label}</span>
				{#if activeLocale === item.value}
					<Check class="size-4" aria-hidden="true" />
				{/if}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
