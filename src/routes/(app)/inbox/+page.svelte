<script lang="ts">
	import PenSquare from '@lucide/svelte/icons/pen-square';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import * as Resizable from '#lib/core/components/ui/resizable/index.ts';
	import { t } from '#lib/i18n/index.ts';
	import MessageList from '#lib/features/inbox/MessageList.svelte';
	import MessageReader from '#lib/features/inbox/MessageReader.svelte';
	import { InboxState } from '#lib/features/inbox/state.svelte.ts';

	const inbox = new InboxState();
</script>

<PageContainer class="flex h-full min-h-0 flex-col">
	<PageHeader title={t('inbox.title')} description={t('inbox.description')}>
		{#snippet actions()}
			<Button><PenSquare class="size-4" aria-hidden="true" />{t('inbox.compose')}</Button>
		{/snippet}
	</PageHeader>
	<div class="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
		<Resizable.PaneGroup direction="horizontal" class="h-full">
			<Resizable.Pane defaultSize={38} minSize={28} maxSize={55} class="flex flex-col">
				<MessageList
					emails={inbox.visibleEmails}
					selectedId={inbox.selectedId}
					unreadCount={inbox.unreadCount}
					bind:search={inbox.search}
					bind:filter={inbox.filter}
					onSelect={(id) => inbox.select(id)}
					onToggleStar={(id) => inbox.toggleStar(id)}
				/>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={62} class="flex flex-col">
				<MessageReader selected={inbox.selected} bind:replyText={inbox.replyText} />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</div>
</PageContainer>
