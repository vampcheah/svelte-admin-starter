<script lang="ts">
	import Reply from '@lucide/svelte/icons/reply';
	import Forward from '@lucide/svelte/icons/forward';
	import Archive from '@lucide/svelte/icons/archive';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Send from '@lucide/svelte/icons/send';
	import Mail from '@lucide/svelte/icons/mail';
	import type { Email } from '#lib/data/inbox.ts';
	import { t } from '#lib/i18n/index.ts';
	import { LABEL_TONE, labelText } from './presentation';
	import EmptyState from '#lib/core/components/shared/EmptyState.svelte';
	import * as Avatar from '#lib/core/components/ui/avatar/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Separator } from '#lib/core/components/ui/separator/index.ts';
	import { Textarea } from '#lib/core/components/ui/textarea/index.ts';
	import { initials } from '#lib/i18n/formatters.ts';
	import { cn } from '#lib/core/utils.ts';

	let { selected, replyText = $bindable('') }: { selected: Email | null; replyText?: string } =
		$props();
</script>

{#if selected}
	<!-- Action bar -->
	<div class="flex items-center gap-1 border-b border-border p-2">
		<Button variant="ghost" size="sm">
			<Reply class="size-4" aria-hidden="true" />
			{t('inbox.reply')}
		</Button>
		<Button variant="ghost" size="sm">
			<Forward class="size-4" aria-hidden="true" />
			{t('inbox.forward')}
		</Button>
		<div class="ml-auto flex items-center gap-1">
			<Button variant="ghost" size="sm">
				<Archive class="size-4" aria-hidden="true" />
				{t('inbox.archive')}
			</Button>
			<Button variant="ghost" size="sm" class="text-destructive hover:text-destructive">
				<Trash2 class="size-4" aria-hidden="true" />
				{t('inbox.delete')}
			</Button>
		</div>
	</div>

	<!-- Scrollable message body -->
	<div class="min-h-0 flex-1 overflow-y-auto">
		<div class="space-y-5 p-5 sm:p-6">
			<!-- Sender block -->
			<div class="flex items-start gap-3">
				<Avatar.Root class="size-11 shrink-0">
					<Avatar.Fallback>{initials(selected.from.name)}</Avatar.Fallback>
				</Avatar.Root>
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-2">
						<p class="font-semibold text-foreground">{selected.from.name}</p>
						{#if selected.label}
							<span
								class={cn(
									'rounded-md px-1.5 py-0.5 text-[11px] font-medium',
									LABEL_TONE[selected.label]
								)}
							>
								{labelText(selected.label)}
							</span>
						{/if}
					</div>
					<p class="truncate text-sm text-muted-foreground">{selected.from.email}</p>
				</div>
				<span class="shrink-0 text-xs text-muted-foreground tabular-nums">
					{selected.time}
				</span>
			</div>

			<h1 class="text-xl font-semibold tracking-tight text-foreground">
				{selected.subject}
			</h1>

			<Separator />

			<!-- Body -->
			<div class="space-y-4 text-sm leading-relaxed text-foreground">
				{#each selected.body as paragraph, i (i)}
					<p>{paragraph}</p>
				{/each}
			</div>

			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<Paperclip class="size-3.5" aria-hidden="true" />
				<span>{t('inbox.attachments', { count: 2 })}</span>
			</div>
		</div>
	</div>

	<!-- Quick reply -->
	<div class="border-t border-border bg-muted/30 p-3">
		<Textarea
			bind:value={replyText}
			placeholder={t('inbox.replyTo', { name: selected.from.name })}
			aria-label={t('inbox.replyTo', { name: selected.from.name })}
			class="min-h-[72px] resize-none bg-background"
		/>
		<div class="mt-2 flex items-center justify-between">
			<span class="text-xs text-muted-foreground">{t('inbox.draftHint')}</span>
			<Button size="sm" disabled={replyText.trim().length === 0}>
				<Send class="size-4" aria-hidden="true" />
				{t('inbox.send')}
			</Button>
		</div>
	</div>
{:else}
	<div class="flex h-full items-center justify-center p-6">
		<EmptyState
			icon={Mail}
			title={t('inbox.selectMessage')}
			description={t('inbox.selectDescription')}
		/>
	</div>
{/if}
