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
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	import Pencil from '@lucide/svelte/icons/pencil';

	import {
		PageContainer,
		PageHeader,
		DataTable,
		ConfirmDialog,
		type Column
	} from '$lib/components/shared';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { demoUsers, type DemoUser } from '$lib/data/users';
	import { userSchema, fieldError } from '$lib/utils/validators';
	import { exportToCsv } from '$lib/utils/csv';
	import { formatDate, initials } from '$lib/utils/formatters';
	import { cn } from '$lib/utils';
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

	// Badge variant mappings — consistent and dark-mode friendly. Roles use the
	// neutral palette (default/secondary/outline); statuses use status accents.
	function roleClass(role: Role): string {
		switch (role) {
			case 'admin':
				return 'border-transparent bg-primary text-primary-foreground';
			case 'editor':
				return 'border-transparent bg-secondary text-secondary-foreground';
			case 'viewer':
				return 'text-foreground';
		}
	}
	function statusClass(status: Status): string {
		switch (status) {
			case 'active':
				return 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
			case 'invited':
				return 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400';
			case 'suspended':
				return 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400';
		}
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
					? { ...u, name: result.data.name, email: result.data.email, role: result.data.role, status }
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
		toast.success(
			`Exported ${rows.length} ${rows.length === 1 ? 'user' : 'users'} to CSV`
		);
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
					<span class="font-medium text-foreground">{row.name}</span>
				</div>
			{:else if column.key === 'email'}
				<span class="text-muted-foreground">{row.email}</span>
			{:else if column.key === 'role'}
				<Badge variant="outline" class={cn('capitalize', roleClass(row.role))}>
					{roleLabel(row.role)}
				</Badge>
			{:else if column.key === 'status'}
				<Badge variant="outline" class={cn('capitalize', statusClass(row.status))}>
					{statusLabel(row.status)}
				</Badge>
			{:else if column.key === 'createdAt'}
				<span class="text-muted-foreground">{formatDate(row.createdAt)}</span>
			{/if}
		{/snippet}

		{#snippet actions(row)}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" class="size-8" aria-label="Open row actions">
							<MoreHorizontal class="size-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-36">
					<DropdownMenu.Item onSelect={() => openEdit(row)}>
						<Pencil class="size-4" />
						Edit
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item
						variant="destructive"
						onSelect={() => requestDelete(row)}
					>
						<Trash2 class="size-4" />
						Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/snippet}
	</DataTable>
</PageContainer>

<!-- Add / Edit dialog -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{dialogTitle}</Dialog.Title>
			<Dialog.Description>
				{editingId ? 'Update the details for this user.' : 'Create a new user record.'}
			</Dialog.Description>
		</Dialog.Header>

		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				save();
			}}
		>
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
								<Select.Item value={status.value} label={status.label}>{status.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button type="submit">{editingId ? 'Save changes' : 'Add user'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

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
