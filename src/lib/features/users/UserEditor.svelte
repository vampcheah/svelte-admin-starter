<script lang="ts">
	import { untrack } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import type { z } from 'zod';
	import * as Sheet from '#lib/core/components/ui/sheet/index.ts';
	import * as Select from '#lib/core/components/ui/select/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import FormField from '#lib/core/components/shared/FormField.svelte';
	import { fieldError } from '#lib/core/utils/validators.ts';
	import type { DemoUser } from '#lib/data/users.ts';
	import { t } from '#lib/i18n/index.ts';
	import { USER_ROLES, USER_STATUSES, roleLabel, statusLabel } from './presentation';
	import { createUserSchema } from './schema';
	import type { UserDraft } from './state.svelte';

	interface Props {
		open?: boolean;
		user?: DemoUser;
		editing?: boolean;
		onSave: (draft: UserDraft) => void;
	}

	let { open = $bindable(true), user, editing = false, onSave }: Props = $props();
	const initial = untrack(() => user);
	let form = $state<{ name: string; email: string; role: string; status: string }>({
		name: initial?.name ?? '',
		email: initial?.email ?? '',
		role: initial?.role ?? 'viewer',
		status: initial?.status ?? 'active'
	});
	let errors = $state<z.ZodError | null>(null);
	const missing = $derived(editing && !user);

	function save() {
		if (missing) return;
		const result = createUserSchema(t).safeParse(form);
		if (!result.success) {
			errors = result.error;
			return;
		}
		errors = null;
		onSave(result.data);
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" showCloseButton={false} class="gap-0 sm:max-w-lg!">
		<Sheet.Header class="border-b">
			<Sheet.Title>{t(editing ? 'users.editUser' : 'users.addUser')}</Sheet.Title>
			<Sheet.Description>
				{t(editing ? 'users.editDescription' : 'users.createDescription')}
			</Sheet.Description>
		</Sheet.Header>
		<Sheet.Close
			class="absolute end-3 top-3 rounded-sm p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			aria-label={t('users.close')}
		>
			<X class="size-4" aria-hidden="true" />
		</Sheet.Close>

		<form
			class="flex min-h-0 flex-1 flex-col"
			novalidate
			onsubmit={(event) => {
				event.preventDefault();
				save();
			}}
		>
			<div class="flex-1 space-y-4 overflow-y-auto p-4">
				{#if missing}<p role="status" class="text-sm text-destructive">
						{t('users.removedWhileEditing')}
					</p>{/if}
				<FormField label={t('common.name')} error={fieldError(errors, 'name')}>
					{#snippet children(control)}
						<Input
							{...control}
							bind:value={form.name}
							placeholder={t('users.namePlaceholder')}
							autocomplete="off"
						/>
					{/snippet}
				</FormField>
				<FormField label={t('auth.email')} error={fieldError(errors, 'email')}>
					{#snippet children(control)}
						<Input
							{...control}
							type="email"
							bind:value={form.email}
							placeholder={t('users.emailPlaceholder')}
							autocomplete="off"
						/>
					{/snippet}
				</FormField>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FormField label={t('users.role')} error={fieldError(errors, 'role')}>
						{#snippet children(control)}
							<Select.Root type="single" bind:value={form.role}>
								<Select.Trigger {...control} class="w-full"
									>{roleLabel(form.role as DemoUser['role'])}</Select.Trigger
								>
								<Select.Content>
									{#each Object.entries(USER_ROLES) as [value, presentation] (value)}
										<Select.Item {value} label={t(presentation.label)}
											>{t(presentation.label)}</Select.Item
										>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</FormField>
					<FormField label={t('users.status')} error={fieldError(errors, 'status')}>
						{#snippet children(control)}
							<Select.Root type="single" bind:value={form.status}>
								<Select.Trigger {...control} class="w-full"
									>{statusLabel(form.status as DemoUser['status'])}</Select.Trigger
								>
								<Select.Content>
									{#each Object.entries(USER_STATUSES) as [value, presentation] (value)}
										<Select.Item {value} label={t(presentation.label)}
											>{t(presentation.label)}</Select.Item
										>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</FormField>
				</div>
			</div>
			<Sheet.Footer class="flex-row justify-end border-t">
				<Button type="button" variant="outline" onclick={() => (open = false)}
					>{t('common.cancel')}</Button
				>
				<Button type="submit" disabled={missing}
					>{t(editing ? 'users.saveChanges' : 'users.addUser')}</Button
				>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
