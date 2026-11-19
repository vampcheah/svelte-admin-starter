<!-- Bell button with unread badge and a keyboard-accessible popover listing app notifications. -->
<script lang="ts">
	import * as Popover from '#lib/core/components/ui/popover/index.ts';
	import { Separator } from '#lib/core/components/ui/separator/index.ts';
	import { t } from '#lib/i18n/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Badge } from '#lib/core/components/ui/badge/index.ts';
	import { cn } from '#lib/core/utils.ts';
	import { useNotificationsState, type AppNotification } from '#lib/stores/notifications.svelte.ts';
	import Bell from '@lucide/svelte/icons/bell';
	import Info from '@lucide/svelte/icons/info';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import CheckCheck from '@lucide/svelte/icons/check-check';

	const notifications = useNotificationsState();
	const instanceId = $props.id();
	let panel = $state<HTMLDivElement | null>(null);
	const items = $derived(notifications.items);
	const unread = $derived(notifications.unread);

	const typeIcon = {
		info: Info,
		success: CircleCheck,
		warning: TriangleAlert
	} as const;

	const typeColor = {
		info: 'text-sky-500',
		success: 'text-emerald-500',
		warning: 'text-amber-500'
	} as const;

	function iconFor(n: AppNotification) {
		return typeIcon[n.type];
	}
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="ghost"
				size="icon"
				class="relative"
				aria-label={t('notifications.title')}
				aria-describedby={`${instanceId}-unread`}
			>
				<Bell aria-hidden="true" />
				<span id={`${instanceId}-unread`} class="sr-only"
					>{t('notifications.unreadCount', { count: unread })}</span
				>
				{#if unread > 0}
					<Badge
						aria-hidden="true"
						class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full p-0 px-1 text-[10px] font-semibold leading-none tabular-nums"
					>
						<span class="translate-y-px">{unread > 9 ? '9+' : unread}</span>
					</Badge>
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		bind:ref={panel}
		onOpenAutoFocus={(event) => {
			event.preventDefault();
			(panel?.querySelector<HTMLButtonElement>('button') ?? panel)?.focus();
		}}
		align="end"
		role="dialog"
		aria-labelledby={`${instanceId}-title`}
		class="w-80 max-w-[calc(100vw-2rem)] p-0"
	>
		<div class="flex items-center justify-between px-3 py-2">
			<h2 id={`${instanceId}-title`} class="text-sm font-semibold">{t('notifications.title')}</h2>
			{#if items.length > 0}
				<button
					type="button"
					class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-sm text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:opacity-50"
					aria-disabled={unread === 0}
					onclick={() => {
						if (unread > 0) notifications.markAllRead();
					}}
				>
					<CheckCheck class="size-3.5" aria-hidden="true" />
					{t('notifications.markAllRead')}
				</button>
			{/if}
		</div>
		<Separator />
		{#if items.length === 0}
			<div class="text-muted-foreground px-3 py-8 text-center text-sm">
				{t('notifications.empty')}
			</div>
		{:else}
			<ul class="max-h-80 overflow-y-auto">
				{#each items as n (n.id)}
					{@const Icon = iconFor(n)}
					<li>
						<button
							type="button"
							class="hover:bg-accent flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
							onclick={() => notifications.markRead(n.id)}
						>
							<Icon class={cn('mt-0.5 size-4 shrink-0', typeColor[n.type])} aria-hidden="true" />
							<div class="grid flex-1 gap-0.5">
								<span class="text-sm leading-tight font-medium">{n.title}</span>
								<span class="text-muted-foreground line-clamp-2 text-xs">{n.body}</span>
								<span class="text-muted-foreground text-[11px]">{n.time}</span>
							</div>
							{#if !n.read}
								<span class="bg-primary mt-1.5 size-2 shrink-0 rounded-full" aria-hidden="true"
								></span>
							{/if}
							<span class="sr-only"
								>{t(n.read ? 'notifications.read' : 'notifications.unread')}</span
							>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</Popover.Content>
</Popover.Root>
