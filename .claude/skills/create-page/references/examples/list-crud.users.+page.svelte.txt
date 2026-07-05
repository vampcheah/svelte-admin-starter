<!--
  Users — full CRUD over a local $state copy of the mock user directory.

  Everything is client-side: the table renders a local array, and the
  add/edit/delete flows mutate that array in place. No backend is involved.
  Showcases the shared <DataTable> (search, sort, selection, custom cells,
  per-row actions) plus a bulk toolbar (export CSV / delete selected).
-->
<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Download from '@lucide/svelte/icons/download';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Eye from '@lucide/svelte/icons/eye';
	import { resolve } from '$app/paths';

	import {
		PageContainer,
		PageHeader,
		DataTable,
		ConfirmDialog,
		StatusBadge,
		type Column,
		type BadgeTone
	} from '$lib/components/shared';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Select from '$lib/components/ui/select';

	import { demoUsers, type DemoUser } from '$lib/data/users';
	import { userSchema, fieldError } from '$lib/utils/validators';
	import { exportToCsv } from '$lib/utils/csv';
	import { formatDate, initials } from '$lib/utils/formatters';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';

	// --- Local, mutable copy of the mock data ------------------------------
	let users = $state<DemoUser[]>(demoUsers.map((u) => ({ ...u })));
	let selected = $state<(string | number)[]>([]);

	type Role = DemoUser['role'];
	type Status = DemoUser['status'];

	const ROLES: { value: Role; label: string }[] = [
		{ value: 'admin', label: 'Admin' },
		{ value: 'editor', label: 'Editor' },
		{ value: 'viewer', label: 'Viewer' }
	];
	const STATUSES: { value: Status; label: string }[] = [
		{ value: 'active', label: 'Active' },
		{ value: 'invited', label: 'Invited' },
		{ value: 'suspended', label: 'Suspended' }
	];

	// Map roles/statuses to the shared StatusBadge tones — one tint convention
	// for the whole app lives in StatusBadge, pages only choose a semantic tone.
	function roleTone(role: Role): BadgeTone {
		return role === 'admin' ? 'brand' : role === 'editor' ? 'neutral' : 'outline';
	}
	function statusTone(status: Status): BadgeTone {
		return status === 'active' ? 'success' : status === 'invited' ? 'warning' : 'danger';
	}
	function roleLabel(role: Role): string {
		return ROLES.find((r) => r.value === role)?.label ?? role;
	}
	function statusLabel(status: Status): string {
		return STATUSES.find((s) => s.value === status)?.label ?? status;
	}

	const columns: Column<DemoUser>[] = [
		{ key: 'name', header: 'Name', sortable: true, searchable: true },
		{ key: 'email', header: 'Email', searchable: true },
		{ key: 'role', header: 'Role' },
		{ key: 'status', header: 'Status' },
		{ key: 'createdAt', header: 'Joined', sortable: true }
	];

	// --- Add / Edit dialog state -------------------------------------------
	// `role`/`status` are kept as plain strings so they bind cleanly to the
	// single <Select> (whose value is a `string`); they are narrowed on save.
	let dialogOpen = $state(false);
	let editingId = $state<string | null>(null);
	let form = $state<{ name: string; email: string; role: string; status: string }>({
		name: '',
		email: '',
		role: 'viewer',
		status: 'active'
	});
	let errors = $state<z.ZodError | null>(null);

	const dialogTitle = $derived(editingId ? 'Edit user' : 'Add user');
	const roleTriggerLabel = $derived(roleLabel(form.role as Role));
	const statusTriggerLabel = $derived(statusLabel(form.status as Status));

	function openAdd() {
		editingId = null;
		form = { name: '', email: '', role: 'viewer', status: 'active' };
		errors = null;
		dialogOpen = true;
	}

	function openEdit(user: DemoUser) {
		editingId = user.id;
		form = { name: user.name, email: user.email, role: user.role, status: user.status };
		errors = null;
		dialogOpen = true;
	}

	// --- View (read-only) drawer state -------------------------------------
	let viewOpen = $state(false);
	let viewingUser = $state<DemoUser | null>(null);

	function openView(user: DemoUser) {
		viewingUser = user;
		viewOpen = true;
	}
	function editFromView() {
		if (!viewingUser) return;
		const u = viewingUser;
		viewOpen = false;
		openEdit(u);
	}

	function save() {
		const result = userSchema.safeParse({
			name: form.name,
			email: form.email,
			role: form.role
		});
		if (!result.success) {
			errors = result.error;
			return;
		}
		errors = null;
		const status = form.status as Status;

		if (editingId) {
			users = users.map((u) =>
				u.id === editingId
					? {
							...u,
							name: result.data.name,
							email: result.data.email,
							role: result.data.role,
							status
						}
					: u
			);
			toast.success('User updated');
		} else {
			const id = `usr_${Math.random().toString(36).slice(2, 8)}`;
			users = [
				{
					id,
					name: result.data.name,
					email: result.data.email,
					role: result.data.role,
					status,
					createdAt: new Date().toISOString().slice(0, 10)
				},
				...users
			];
			toast.success('User added');
		}
		dialogOpen = false;
	}

	// --- Delete (single) ----------------------------------------------------
	let deleteOpen = $state(false);
	let pendingDelete = $state<DemoUser | null>(null);

	function requestDelete(user: DemoUser) {
		pendingDelete = user;
		deleteOpen = true;
	}
	function confirmDelete() {
		if (!pendingDelete) return;
		const id = pendingDelete.id;
		users = users.filter((u) => u.id !== id);
		selected = selected.filter((s) => s !== id);
		toast.success('User deleted');
		pendingDelete = null;
	}

	// --- Bulk actions -------------------------------------------------------
	let bulkDeleteOpen = $state(false);

	const selectedUsers = $derived(users.filter((u) => selected.includes(u.id)));

	function exportCsv() {
		const rows = selectedUsers.length > 0 ? selectedUsers : users;
		exportToCsv(rows, 'users.csv', [
			{ key: 'name', header: 'Name' },
			{ key: 'email', header: 'Email' },
			{ key: 'role', header: 'Role' },
			{ key: 'status', header: 'Status' },
			{ key: 'createdAt', header: 'Joined' }
		]);
		toast.success(`Exported ${rows.length} ${rows.length === 1 ? 'user' : 'users'} to CSV`);
	}

	function confirmBulkDelete() {
		const ids = new Set(selected);
		const count = ids.size;
		users = users.filter((u) => !ids.has(u.id));
		selected = [];
		toast.success(`Deleted ${count} ${count === 1 ? 'user' : 'users'}`);
	}
</script>

<svelte:head>
	<title>Users · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader title="Users" description="Manage team members, their roles and access.">
		{#snippet actions()}
			<Button onclick={openAdd}>
				<Plus class="size-4" />
				Add user
			</Button>
		{/snippet}
	</PageHeader>

	<DataTable
		data={users}
		{columns}
		searchable
		selectable
		bind:selected
		emptyTitle="No users"
		emptyDescription="Add your first user to get started."
	>
		{#snippet toolbar()}
			<Button variant="outline" size="sm" onclick={exportCsv}>
				<Download class="size-4" />
				Export CSV
			</Button>
			{#if selected.length > 0}
				<Button variant="outline" size="sm" onclick={() => (bulkDeleteOpen = true)}>
					<Trash2 class="size-4 text-red-500" />
					Delete selected ({selected.length})
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
						href={resolve(`/users/${row.id}`)}
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
					title="View"
					aria-label={`View ${row.name}`}
					onclick={() => openView(row)}
				>
					<Eye class="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:text-foreground size-8"
					title="Edit"
					aria-label={`Edit ${row.name}`}
					onclick={() => openEdit(row)}
				>
					<Pencil class="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:text-destructive size-8"
					title="Delete"
					aria-label={`Delete ${row.name}`}
					onclick={() => requestDelete(row)}
				>
					<Trash2 class="size-4" />
				</Button>
			</div>
		{/snippet}
	</DataTable>
</PageContainer>

<!-- Add / Edit dialog -->
<Sheet.Root bind:open={dialogOpen}>
	<Sheet.Content side="right" class="gap-0 sm:max-w-lg!">
		<Sheet.Header class="border-b">
			<Sheet.Title>{dialogTitle}</Sheet.Title>
			<Sheet.Description>
				{editingId ? 'Update the details for this user.' : 'Create a new user record.'}
			</Sheet.Description>
		</Sheet.Header>

		<form
			class="flex min-h-0 flex-1 flex-col"
			onsubmit={(e) => {
				e.preventDefault();
				save();
			}}
		>
			<div class="flex-1 space-y-4 overflow-y-auto p-4">
				<div class="space-y-2">
					<Label for="user-name">Name</Label>
					<Input id="user-name" bind:value={form.name} placeholder="Jane Doe" autocomplete="off" />
					{#if fieldError(errors, 'name')}
						<p class="text-xs text-red-500">{fieldError(errors, 'name')}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="user-email">Email</Label>
					<Input
						id="user-email"
						type="email"
						bind:value={form.email}
						placeholder="jane@example.com"
						autocomplete="off"
					/>
					{#if fieldError(errors, 'email')}
						<p class="text-xs text-red-500">{fieldError(errors, 'email')}</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label>Role</Label>
						<Select.Root type="single" bind:value={form.role}>
							<Select.Trigger class="w-full capitalize">{roleTriggerLabel}</Select.Trigger>
							<Select.Content>
								{#each ROLES as role (role.value)}
									<Select.Item value={role.value} label={role.label}>{role.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="space-y-2">
						<Label>Status</Label>
						<Select.Root type="single" bind:value={form.status}>
							<Select.Trigger class="w-full capitalize">{statusTriggerLabel}</Select.Trigger>
							<Select.Content>
								{#each STATUSES as status (status.value)}
									<Select.Item value={status.value} label={status.label}>{status.label}</Select.Item
									>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			</div>

			<Sheet.Footer class="flex-row justify-end border-t">
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button type="submit">{editingId ? 'Save changes' : 'Add user'}</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>

<!-- View (read-only) drawer -->
<Sheet.Root bind:open={viewOpen}>
	<Sheet.Content side="right" class="gap-0 sm:max-w-lg!">
		<Sheet.Header class="border-b">
			<Sheet.Title>User details</Sheet.Title>
			<Sheet.Description>Read-only overview of this team member.</Sheet.Description>
		</Sheet.Header>

		{#if viewingUser}
			<div class="flex-1 space-y-6 overflow-y-auto p-4">
				<!-- Identity -->
				<div class="flex items-center gap-4">
					<span
						class="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-medium"
						aria-hidden="true"
					>
						{initials(viewingUser.name)}
					</span>
					<div class="min-w-0 space-y-2">
						<p class="truncate text-lg font-semibold">{viewingUser.name}</p>
						<div class="flex flex-wrap gap-2">
							<StatusBadge tone={roleTone(viewingUser.role)}
								>{roleLabel(viewingUser.role)}</StatusBadge
							>
							<StatusBadge tone={statusTone(viewingUser.status)}>
								{statusLabel(viewingUser.status)}
							</StatusBadge>
						</div>
					</div>
				</div>

				<!-- Details -->
				<dl class="divide-border bg-card divide-y rounded-lg border">
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">Email</dt>
						<dd class="truncate text-sm font-medium">{viewingUser.email}</dd>
					</div>
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">Role</dt>
						<dd class="text-sm font-medium">{roleLabel(viewingUser.role)}</dd>
					</div>
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">Status</dt>
						<dd class="text-sm font-medium">{statusLabel(viewingUser.status)}</dd>
					</div>
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">Joined</dt>
						<dd class="text-sm font-medium">{formatDate(viewingUser.createdAt)}</dd>
					</div>
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">User ID</dt>
						<dd class="text-muted-foreground font-mono text-xs">{viewingUser.id}</dd>
					</div>
				</dl>
			</div>

			<Sheet.Footer class="flex-row justify-end border-t">
				<Button variant="outline" onclick={() => (viewOpen = false)}>Close</Button>
				<Button onclick={editFromView}>
					<Pencil class="size-4" />
					Edit
				</Button>
			</Sheet.Footer>
		{/if}
	</Sheet.Content>
</Sheet.Root>

<!-- Single delete confirmation -->
<ConfirmDialog
	bind:open={deleteOpen}
	variant="destructive"
	title="Delete user?"
	description={pendingDelete
		? `${pendingDelete.name} will be permanently removed. This cannot be undone.`
		: ''}
	confirmText="Delete"
	onConfirm={confirmDelete}
/>

<!-- Bulk delete confirmation -->
<ConfirmDialog
	bind:open={bulkDeleteOpen}
	variant="destructive"
	title="Delete selected users?"
	description={`${selected.length} ${selected.length === 1 ? 'user' : 'users'} will be permanently removed. This cannot be undone.`}
	confirmText="Delete"
	onConfirm={confirmBulkDelete}
/>
