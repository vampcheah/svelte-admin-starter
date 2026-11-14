<!--
  CommandMenu — a ⌘K / Ctrl+K command palette.
  Registers a global keydown handler so the palette can be summoned from anywhere;
  `open` is bindable so a parent can toggle it.
-->
<script lang="ts" module>
	import type { Component } from 'svelte';

	export interface CommandMenuItem {
		title: string;
		titleKey?: string;
		href: string;
		icon: Component;
	}

	export interface CommandMenuGroup {
		label: string;
		labelKey?: string;
		items: readonly CommandMenuItem[];
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import * as Command from '../ui/command';
	import { coreI18n } from '../../i18n.svelte';

	interface Props {
		open?: boolean;
		groups?: readonly CommandMenuGroup[];
		groupLabel?: (group: CommandMenuGroup) => string;
		itemTitle?: (item: CommandMenuItem) => string;
		onSelect?: (href: string) => void | Promise<void>;
		title?: string;
		description?: string;
		placeholder?: string;
		emptyText?: string;
	}

	let {
		open = $bindable(false),
		groups = [],
		groupLabel = (group) => (group.labelKey ? coreI18n.t(group.labelKey) : group.label),
		itemTitle = (item) => (item.titleKey ? coreI18n.t(item.titleKey) : item.title),
		onSelect,
		title,
		description,
		placeholder,
		emptyText
	}: Props = $props();

	const resolvedTitle = $derived(title ?? coreI18n.t('command.title'));
	const resolvedDescription = $derived(description ?? coreI18n.t('command.description'));
	const resolvedPlaceholder = $derived(placeholder ?? coreI18n.t('command.placeholder'));
	const resolvedEmptyText = $derived(emptyText ?? coreI18n.t('command.noResults'));

	function handleSelect(href: string) {
		open = false;
		void onSelect?.(href);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			open = !open;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', onKeydown);
		return () => document.removeEventListener('keydown', onKeydown);
	});
</script>

<Command.Dialog bind:open title={resolvedTitle} description={resolvedDescription}>
	<Command.Input placeholder={resolvedPlaceholder} />
	<Command.List>
		<Command.Empty>{resolvedEmptyText}</Command.Empty>
		{#each groups as group (group.label)}
			<Command.Group heading={groupLabel(group)}>
				{#each group.items as item (item.href)}
					{@const Icon = item.icon}
					<Command.Item
						value={`${groupLabel(group)} ${itemTitle(item)} ${group.label} ${item.title} ${item.href}`}
						onSelect={() => handleSelect(item.href)}
					>
						<Icon class="size-4" aria-hidden="true" />
						<span>{itemTitle(item)}</span>
					</Command.Item>
				{/each}
			</Command.Group>
		{/each}
	</Command.List>
</Command.Dialog>
