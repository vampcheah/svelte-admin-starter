<script lang="ts">
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import * as Dialog from '$lib/core/components/ui/dialog';
	import { Button } from '$lib/core/components/ui/button';
	import { Input } from '$lib/core/components/ui/input';
	import { Label } from '$lib/core/components/ui/label';
	import { t } from '$lib/i18n';
	import { toast } from 'svelte-sonner';

	export interface Client {
		id: number;
		name: string;
	}

	interface Props {
		onCreated: (client: Client) => void | Promise<void>;
		createFn?: (name: string) => Promise<Client>;
	}

	let { onCreated, createFn }: Props = $props();
	let open = $state(false);
	let name = $state('');
	let saving = $state(false);

	function show() {
		name = '';
		open = true;
	}

	async function createClient(event: SubmitEvent) {
		event.preventDefault();
		const value = name.trim();
		if (!value) return toast.error(t('clients.nameRequired'));
		saving = true;
		try {
			const client = createFn ? await createFn(value) : { id: Date.now(), name: value };
			await onCreated(client);
			open = false;
			name = '';
			toast.success(t('clients.clientCreated'));
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t('common.createFailed'));
		} finally {
			saving = false;
		}
	}
</script>

<Button
	type="button"
	variant="outline"
	size="icon"
	class="h-9 w-16 shrink-0 border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 sm:w-14 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900"
	onclick={show}
	aria-label={t('clients.newClient')}
	title={t('clients.newClient')}
>
	<UserPlus class="size-4" />
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<form onsubmit={createClient}>
			<Dialog.Header>
				<Dialog.Title>{t('clients.newClient')}</Dialog.Title>
				<Dialog.Description>{t('clients.quickCreateHint')}</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-2 py-4">
				<Label>{t('common.name')} *</Label>
				<Input bind:value={name} autocomplete="organization" required />
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)} disabled={saving}>
					{t('common.cancel')}
				</Button>
				<Button type="submit" disabled={saving}>
					{saving ? t('common.saving') : t('common.create')}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
