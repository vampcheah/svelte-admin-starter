<!-- Demo records are shared by app tabs; filters, selection and drawers belong to this instance. -->
<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Download from '@lucide/svelte/icons/download';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Eye from '@lucide/svelte/icons/eye';
	import { resolve } from '$app/paths';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import DataTable, { type Column } from '#lib/core/components/shared/DataTable.svelte';
	import StatusBadge from '#lib/core/components/shared/StatusBadge.svelte';
	import ConfirmDialog from '#lib/components/shared/ConfirmDialog.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import UserEditor from '#lib/features/users/UserEditor.svelte';
	import UserDetailsDrawer from '#lib/features/users/UserDetailsDrawer.svelte';
	import { useUsersState, type UserDraft } from '#lib/features/users/state.svelte.ts';
	import {
		roleLabel,
		roleTone,
		statusLabel,
		statusTone
	} from '#lib/features/users/presentation.ts';
	import type { DemoUser } from '#lib/data/users.ts';
	import { exportToCsv } from '#lib/core/utils/csv.ts';
	import { formatDate, initials } from '#lib/i18n/formatters.ts';
	import { t, translate } from '#lib/i18n/index.ts';
	import { toast } from 'svelte-sonner';

	const directory = useUsersState();
	let selected = $state<(string | number)[]>([]);
	let search = $state('');
	const selectedIds = $derived(new Set(selected));
	const selectedUsers = $derived(directory.records.filter((user) => selectedIds.has(user.id)));

	// Another tab can delete a selected record without changing this tab's query or drawers.
	$effect(() => {
		const available = new Set(directory.records.map((user) => user.id));
		const next = selected.filter((id) => available.has(String(id)));
		if (next.length !== selected.length) selected = next;
	});

	const columns = $derived<Column<DemoUser>[]>([
		{ key: 'name', header: t('common.name'), sortable: true, searchable: true },
		{ key: 'email', header: t('auth.email'), searchable: true },
		{ key: 'role', header: t('users.role') },
		{ key: 'status', header: t('users.status') },
		{ key: 'createdAt', header: t('users.joined'), sortable: true }
	]);

	let dialogOpen = $state(false);
	let editorSession = $state(0);
	let editingId = $state<string>();
	function openAdd() {
		editingId = undefined;
		editorSession += 1;
		dialogOpen = true;
	}
	function openEdit(user: DemoUser) {
		editingId = user.id;
		editorSession += 1;
		dialogOpen = true;
	}
	function save(draft: UserDraft) {
		if (editingId) {
			if (!directory.update(editingId, draft)) {
				toast.error(t('users.notFound'));
				return;
			}
			toast.success(t('users.updated'));
		} else {
			directory.create(draft);
			toast.success(t('users.created'));
		}
		dialogOpen = false;
	}

	let viewOpen = $state(false);
	let viewingId = $state<string>();
	const viewingUser = $derived(directory.find(viewingId));
	function openView(user: DemoUser) {
		viewingId = user.id;
		viewOpen = true;
	}
	function editFromView() {
		if (!viewingUser) return;
		viewOpen = false;
		openEdit(viewingUser);
	}

	let deleteOpen = $state(false);
	let pendingDeleteId = $state<string>();
	const pendingDelete = $derived(directory.find(pendingDeleteId));
	function requestDelete(user: DemoUser) {
		pendingDeleteId = user.id;
		deleteOpen = true;
	}
	function confirmDelete() {
		if (pendingDeleteId && directory.remove(pendingDeleteId)) toast.success(t('users.deleted'));
		pendingDeleteId = undefined;
	}

	let bulkDeleteOpen = $state(false);
	function exportCsv() {
		const rows = selectedUsers.length > 0 ? selectedUsers : directory.records;
		exportToCsv(rows, 'users.csv', [
			{ key: 'name', header: t('common.name') },
			{ key: 'email', header: t('auth.email') },
			{ key: 'role', header: t('users.role') },
			{ key: 'status', header: t('users.status') },
			{ key: 'createdAt', header: t('users.joined') }
		]);
		toast.success(
			t(rows.length === 1 ? 'users.exportedOne' : 'users.exportedMany', { count: rows.length })
		);
	}
	function confirmBulkDelete() {
		const count = directory.removeMany(selected);
		selected = [];
		if (count > 0) toast.success(t(count === 1 ? 'users.deleted' : 'users.deletedMany', { count }));
	}
</script>

<PageContainer>
	<PageHeader title={t('users.title')} description={t('users.description')}>
		{#snippet actions()}
			<Button onclick={openAdd}>
				<Plus class="size-4" />
				{t('users.addUser')}
			</Button>
		{/snippet}
	</PageHeader>

	<DataTable
		data={directory.records}
		text={translate}
		{columns}
		searchable
		selectable
		bind:selected
		bind:search
		emptyTitle={t('users.emptyTitle')}
		emptyDescription={t('users.emptyDescription')}
	>
		{#snippet toolbar()}
			<Button variant="outline" size="sm" onclick={exportCsv}>
				<Download class="size-4" />
				{t('users.exportCsv')}
			</Button>
			{#if selected.length > 0}
				<Button variant="outline" size="sm" onclick={() => (bulkDeleteOpen = true)}>
					<Trash2 class="size-4 text-destructive" />
					{t('users.deleteSelected', { count: selected.length })}
				</Button>
			{/if}
		{/snippet}

		{#snippet cell(row, column)}
			{#if column.key === 'name'}
				<div class="flex items-center gap-3">
					<span
						class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
						aria-hidden="true"
					>
						{initials(row.name)}
					</span>
					<a
						href={resolve(`users/${row.id}`)}
						class="hover:text-primary font-medium text-foreground hover:underline"
					>
						{row.name}
					</a>
				</div>
			{:else if column.key === 'email'}
				<span class="text-muted-foreground">{row.email}</span>
			{:else if column.key === 'role'}
				<StatusBadge tone={roleTone(row.role)}>{roleLabel(row.role)}</StatusBadge>
			{:else if column.key === 'status'}
				<StatusBadge tone={statusTone(row.status)}>{statusLabel(row.status)}</StatusBadge>
			{:else if column.key === 'createdAt'}
				<span class="text-muted-foreground">{formatDate(row.createdAt)}</span>
			{/if}
		{/snippet}

		{#snippet actions(row)}
			<div class="flex items-center justify-end gap-0.5">
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:text-foreground size-8"
					title={t('users.view')}
					aria-label={t('users.viewNamed', { name: row.name })}
					onclick={() => openView(row)}
				>
					<Eye class="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:text-foreground size-8"
					title={t('common.edit')}
					aria-label={t('users.editNamed', { name: row.name })}
					onclick={() => openEdit(row)}
				>
					<Pencil class="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:text-destructive size-8"
					title={t('common.delete')}
					aria-label={t('users.deleteNamed', { name: row.name })}
					onclick={() => requestDelete(row)}
				>
					<Trash2 class="size-4" />
				</Button>
			</div>
		{/snippet}
	</DataTable>
</PageContainer>

{#key editorSession}
	<UserEditor
		bind:open={dialogOpen}
		user={directory.find(editingId)}
		editing={Boolean(editingId)}
		onSave={save}
	/>
{/key}
<UserDetailsDrawer bind:open={viewOpen} user={viewingUser} onEdit={editFromView} />

<ConfirmDialog
	bind:open={deleteOpen}
	variant="destructive"
	title={t('users.deleteTitle')}
	description={pendingDelete
		? t('users.deleteDescription', { name: pendingDelete.name })
		: t('users.notFoundDescription')}
	confirmText={t('common.delete')}
	onConfirm={confirmDelete}
/>
<ConfirmDialog
	bind:open={bulkDeleteOpen}
	variant="destructive"
	title={t('users.bulkDeleteTitle')}
	description={t('users.bulkDeleteDescription')}
	confirmText={t('common.delete')}
	onConfirm={confirmBulkDelete}
/>
