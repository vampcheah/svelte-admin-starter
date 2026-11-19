<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import X from '@lucide/svelte/icons/x';
	import * as Sheet from '#lib/core/components/ui/sheet/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import StatusBadge from '#lib/core/components/shared/StatusBadge.svelte';
	import type { DemoUser } from '#lib/data/users.ts';
	import { formatDate, initials } from '#lib/i18n/formatters.ts';
	import { t } from '#lib/i18n/index.ts';
	import { roleLabel, roleTone, statusLabel, statusTone } from './presentation';

	interface Props {
		open?: boolean;
		user?: DemoUser;
		onEdit: () => void;
	}
	let { open = $bindable(false), user, onEdit }: Props = $props();
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" showCloseButton={false} class="gap-0 sm:max-w-lg!">
		<Sheet.Header class="border-b">
			<Sheet.Title>{t('users.detailsTitle')}</Sheet.Title>
			<Sheet.Description>{t('users.detailsDescription')}</Sheet.Description>
		</Sheet.Header>
		<Sheet.Close
			class="absolute end-3 top-3 rounded-sm p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			aria-label={t('users.close')}
		>
			<X class="size-4" aria-hidden="true" />
		</Sheet.Close>
		{#if user}
			<div class="flex-1 space-y-6 overflow-y-auto p-4">
				<div class="flex items-center gap-4">
					<span
						class="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-medium"
						aria-hidden="true">{initials(user.name)}</span
					>
					<div class="min-w-0 space-y-2">
						<p class="truncate text-lg font-semibold">{user.name}</p>
						<div class="flex flex-wrap gap-2">
							<StatusBadge tone={roleTone(user.role)}>{roleLabel(user.role)}</StatusBadge>
							<StatusBadge tone={statusTone(user.status)}>{statusLabel(user.status)}</StatusBadge>
						</div>
					</div>
				</div>
				<dl class="divide-border bg-card divide-y rounded-lg border">
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">{t('auth.email')}</dt>
						<dd class="truncate text-sm font-medium">{user.email}</dd>
					</div>
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">{t('users.role')}</dt>
						<dd class="text-sm font-medium">{roleLabel(user.role)}</dd>
					</div>
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">{t('users.status')}</dt>
						<dd class="text-sm font-medium">{statusLabel(user.status)}</dd>
					</div>
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">{t('users.joined')}</dt>
						<dd class="text-sm font-medium">{formatDate(user.createdAt)}</dd>
					</div>
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<dt class="text-muted-foreground text-sm">{t('users.id')}</dt>
						<dd class="text-muted-foreground font-mono text-xs">{user.id}</dd>
					</div>
				</dl>
			</div>
		{:else}
			<p role="status" class="flex-1 p-4 text-sm text-muted-foreground">
				{t('users.notFoundDescription')}
			</p>
		{/if}
		<Sheet.Footer class="flex-row justify-end border-t">
			<Button variant="outline" onclick={() => (open = false)}>{t('users.close')}</Button>
			{#if user}<Button onclick={onEdit}><Pencil class="size-4" />{t('common.edit')}</Button>{/if}
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
