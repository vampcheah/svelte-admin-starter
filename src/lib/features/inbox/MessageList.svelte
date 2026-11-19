<script lang="ts">
	import Star from '@lucide/svelte/icons/star';
	import Mail from '@lucide/svelte/icons/mail';
	import { t } from '#lib/i18n/index.ts';
	import type { Email } from '#lib/data/inbox.ts';
	import type { InboxFilter } from './state.svelte';
	import { LABEL_TONE, labelText } from './presentation';
	import SearchInput from '#lib/core/components/shared/SearchInput.svelte';
	import EmptyState from '#lib/core/components/shared/EmptyState.svelte';
	import * as Avatar from '#lib/core/components/ui/avatar/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { initials } from '#lib/i18n/formatters.ts';
	import { cn } from '#lib/core/utils.ts';

	interface Props {
		emails: Email[];
		selectedId: string | null;
		unreadCount: number;
		search?: string;
		filter?: InboxFilter;
		onSelect: (id: string) => void;
		onToggleStar: (id: string) => void;
	}
	let {
		emails,
		selectedId,
		unreadCount,
		search = $bindable(''),
		filter = $bindable('all'),
		onSelect,
		onToggleStar
	}: Props = $props();
</script>

<!-- Toolbar -->
<div class="flex flex-col gap-3 border-b border-border p-3">
	<div class="flex items-center justify-between gap-2">
		<h2 class="text-sm font-semibold tracking-tight text-foreground">{t('inbox.allMail')}</h2>
		<span class="text-xs text-muted-foreground tabular-nums">
			{t('inbox.unreadCount', { count: unreadCount })}
		</span>
	</div>
	<SearchInput
		clearLabel={t('common.clearSearch')}
		bind:value={search}
		placeholder={t('common.searchMessages')}
	/>
	<div class="flex items-center gap-1">
		<Button
			variant={filter === 'all' ? 'secondary' : 'ghost'}
			size="sm"
			onclick={() => (filter = 'all')}
		>
			{t('inbox.all')}
		</Button>
		<Button
			variant={filter === 'unread' ? 'secondary' : 'ghost'}
			size="sm"
			onclick={() => (filter = 'unread')}
		>
			{t('inbox.unread')}
		</Button>
	</div>
</div>

<!-- Scrollable list -->
<div class="min-h-0 flex-1 overflow-y-auto">
	{#if emails.length === 0}
		<div class="p-4">
			<EmptyState icon={Mail} title={t('inbox.noMessages')} description={t('inbox.noMatches')} />
		</div>
	{:else}
		<ul class="divide-y divide-border">
			{#each emails as email (email.id)}
				<li class="relative">
					<button
						type="button"
						onclick={() => onSelect(email.id)}
						aria-pressed={selectedId === email.id}
						class={cn(
							'flex w-full items-start gap-3 py-3 ps-3 pe-11 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
							selectedId === email.id ? 'bg-accent' : 'hover:bg-accent/60'
						)}
					>
						<Avatar.Root class="mt-0.5 size-9 shrink-0">
							<Avatar.Fallback class="text-xs">{initials(email.from.name)}</Avatar.Fallback>
						</Avatar.Root>

						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p
									class={cn(
										'min-w-0 flex-1 truncate text-sm',
										email.read ? 'text-foreground' : 'font-semibold text-foreground'
									)}
								>
									{email.from.name}
								</p>
								{#if !email.read}
									<span
										class="size-2 shrink-0 rounded-full bg-primary"
										aria-label={t('inbox.unread')}
									></span>
								{/if}
								<span class="shrink-0 text-xs text-muted-foreground tabular-nums">
									{email.time}
								</span>
							</div>

							<p
								class={cn(
									'mt-0.5 truncate text-sm',
									email.read ? 'text-muted-foreground' : 'font-medium text-foreground'
								)}
							>
								{email.subject}
							</p>
							<p class="mt-0.5 truncate text-xs text-muted-foreground">
								{email.preview}
							</p>

							<div class="mt-1.5 flex items-center gap-2">
								{#if email.label}
									<span
										class={cn(
											'rounded-md px-1.5 py-0.5 text-[11px] font-medium',
											LABEL_TONE[email.label]
										)}
									>
										{labelText(email.label)}
									</span>
								{/if}
							</div>
						</div>
					</button>
					<button
						type="button"
						aria-label={t(email.starred ? 'inbox.unstar' : 'inbox.star')}
						aria-pressed={email.starred}
						onclick={() => onToggleStar(email.id)}
						class="absolute end-3 top-3.5 flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<Star
							class={cn('size-4', email.starred && 'fill-primary text-primary')}
							aria-hidden="true"
						/>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
