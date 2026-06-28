<!--
  Inbox / Mail — a resizable two-pane mail client. The left pane is a searchable,
  filterable list of messages; the right pane is the reading view for the selected
  message with reply/forward/archive/delete actions and a quick-reply box.

  All data is mock and lives in local $state — there is no backend. Selecting a
  message marks it read; the star toggle and quick reply mutate local state only.
-->
<script lang="ts">
	import Reply from '@lucide/svelte/icons/reply';
	import Forward from '@lucide/svelte/icons/forward';
	import Archive from '@lucide/svelte/icons/archive';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Star from '@lucide/svelte/icons/star';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Send from '@lucide/svelte/icons/send';
	import PenSquare from '@lucide/svelte/icons/pen-square';
	import Mail from '@lucide/svelte/icons/mail';

	import { PageContainer, PageHeader, SearchInput, EmptyState } from '$lib/components/shared';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Resizable from '$lib/components/ui/resizable';
	import { initials } from '$lib/utils/formatters';
	import { cn } from '$lib/utils';

	type Label = 'work' | 'personal' | 'updates';

	interface Email {
		id: string;
		from: { name: string; email: string };
		subject: string;
		preview: string;
		body: string[];
		time: string;
		read: boolean;
		starred: boolean;
		label?: Label;
	}

	// Soft, token-friendly tint per label for the list/reader chips.
	const LABEL_TONE: Record<Label, string> = {
		work: 'bg-primary/10 text-primary',
		personal: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
		updates: 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
	};

	// ~10 realistic mock messages. Newest first.
	let emails = $state<Email[]>([
		{
			id: 'm1',
			from: { name: 'Priya Nair', email: 'priya.nair@acme.example' },
			subject: 'Q3 roadmap review — your input needed',
			preview:
				'I pulled together the draft roadmap for next quarter and would love your take before Friday.',
			body: [
				'Hi there,',
				'I pulled together the draft roadmap for next quarter and would love your take before we share it with the wider team on Friday. The biggest open question is whether we ship the billing revamp before or after the mobile work.',
				'Could you add comments directly in the doc? I have flagged the three items where I think we need a decision this week.'
			],
			time: '10:24 AM',
			read: false,
			starred: true,
			label: 'work'
		},
		{
			id: 'm2',
			from: { name: 'GitHub', email: 'noreply@github.example' },
			subject: '[acme/dashboard] 3 new pull requests need review',
			preview:
				'You have been requested as a reviewer on three open pull requests in acme/dashboard.',
			body: [
				'Hello,',
				'You have been requested as a reviewer on three open pull requests in acme/dashboard. Two are ready to merge and one is still marked as a draft.',
				'Reviewing promptly helps keep the release train on schedule.'
			],
			time: '9:48 AM',
			read: false,
			starred: false,
			label: 'updates'
		},
		{
			id: 'm3',
			from: { name: 'Marcus Bell', email: 'marcus@northwind.example' },
			subject: 'Re: Contract renewal terms',
			preview:
				'Thanks for the quick turnaround. Legal signed off on the revised terms this morning.',
			body: [
				'Hi,',
				'Thanks for the quick turnaround on the redline. Legal signed off on the revised terms this morning, so we are good to proceed with the two-year option.',
				'I will get the countersigned copy back to you by end of day. Appreciate the partnership.'
			],
			time: '8:15 AM',
			read: false,
			starred: false,
			label: 'work'
		},
		{
			id: 'm4',
			from: { name: 'Dana Whitfield', email: 'dana.w@acme.example' },
			subject: 'Lunch next week?',
			preview: 'It has been ages! Are you free for lunch on Tuesday or Wednesday near the office?',
			body: [
				'Hey!',
				'It has been ages since we caught up properly. Are you free for lunch on Tuesday or Wednesday next week? There is a new place near the office that does great ramen.',
				'Let me know what works and I will book a table.'
			],
			time: 'Yesterday',
			read: true,
			starred: true,
			label: 'personal'
		},
		{
			id: 'm5',
			from: { name: 'Stripe', email: 'receipts@stripe.example' },
			subject: 'Your monthly payout has been sent',
			preview: 'A payout of $12,480.00 is on its way to your bank account ending in 4421.',
			body: [
				'Hi,',
				'A payout of $12,480.00 is on its way to your bank account ending in 4421. It should arrive within 1-2 business days.',
				'You can view a full breakdown of the included charges in your dashboard.'
			],
			time: 'Yesterday',
			read: true,
			starred: false,
			label: 'updates'
		},
		{
			id: 'm6',
			from: { name: 'Sofia Ramirez', email: 'sofia.r@acme.example' },
			subject: 'Design tokens are merged 🎉',
			preview:
				'The new color and spacing tokens are live on main — please pull before your next build.',
			body: [
				'Team,',
				'The new color and spacing tokens are merged to main. Please pull the latest before your next build so everyone is rendering against the same values.',
				'I have updated the Figma library to match. Shout if anything looks off in dark mode.'
			],
			time: 'Mon',
			read: true,
			starred: false,
			label: 'work'
		},
		{
			id: 'm7',
			from: { name: 'Anika Patel', email: 'anika@bright.example' },
			subject: 'Speaking slot confirmed for the summit',
			preview: 'Great news — your talk has been accepted for the afternoon track on day two.',
			body: [
				'Hi,',
				'Great news — your talk has been accepted for the afternoon track on day two of the summit. You will have a 30 minute slot followed by 10 minutes of Q&A.',
				'We will send logistics and the green room schedule closer to the date.'
			],
			time: 'Mon',
			read: true,
			starred: false,
			label: 'work'
		},
		{
			id: 'm8',
			from: { name: 'Mom', email: 'eleanor@home.example' },
			subject: 'Photos from the weekend',
			preview: 'Attached a few of my favorites from the garden — the roses finally bloomed!',
			body: [
				'Sweetheart,',
				'Attached a few of my favorites from the weekend. The roses finally bloomed and the whole back garden looks wonderful this year.',
				'Call me when you get a chance. Love you.'
			],
			time: 'Sun',
			read: true,
			starred: true,
			label: 'personal'
		},
		{
			id: 'm9',
			from: { name: 'Figma', email: 'updates@figma.example' },
			subject: 'New comments on “Inbox redesign”',
			preview:
				'Three teammates left comments on frames you are watching in the Inbox redesign file.',
			body: [
				'Hello,',
				'Three teammates left comments on frames you are watching in the Inbox redesign file. Most relate to the message list density and the read/unread treatment.',
				'Open the file to reply inline and resolve the threads.'
			],
			time: 'Sun',
			read: true,
			starred: false,
			label: 'updates'
		},
		{
			id: 'm10',
			from: { name: 'Theo Lindqvist', email: 'theo@acme.example' },
			subject: 'Onboarding checklist for the new hires',
			preview:
				'I drafted a checklist for the two engineers joining in July — can you sanity check it?',
			body: [
				'Hi,',
				'I drafted an onboarding checklist for the two engineers joining in July. It covers access requests, the first-week buddy system, and their starter tasks.',
				'Can you give it a sanity check and add anything I missed from the platform side?'
			],
			time: 'Jun 2',
			read: true,
			starred: false,
			label: 'work'
		}
	]);

	let selectedId = $state<string | null>('m1');
	let search = $state('');
	let filter = $state<'all' | 'unread'>('all');
	let replyText = $state('');

	const unreadCount = $derived(emails.filter((e) => !e.read).length);

	const visibleEmails = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return emails.filter((e) => {
			if (filter === 'unread' && e.read) return false;
			if (!q) return true;
			return (
				e.from.name.toLowerCase().includes(q) ||
				e.subject.toLowerCase().includes(q) ||
				e.preview.toLowerCase().includes(q)
			);
		});
	});

	const selected = $derived(emails.find((e) => e.id === selectedId) ?? null);

	function select(id: string): void {
		selectedId = id;
		replyText = '';
		const email = emails.find((e) => e.id === id);
		if (email) email.read = true;
	}

	function toggleStar(id: string, event: MouseEvent): void {
		event.stopPropagation();
		const email = emails.find((e) => e.id === id);
		if (email) email.starred = !email.starred;
	}

	function labelText(label: Label): string {
		return label.charAt(0).toUpperCase() + label.slice(1);
	}
</script>

<svelte:head>
	<title>Inbox · Admin Starter</title>
</svelte:head>

<PageContainer class="flex h-full min-h-0 flex-col">
	<PageHeader
		title="Inbox"
		description="Read, triage and reply to your messages — all in one place."
	>
		{#snippet actions()}
			<Button>
				<PenSquare class="size-4" aria-hidden="true" />
				Compose
			</Button>
		{/snippet}
	</PageHeader>

	<div class="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
		<Resizable.PaneGroup direction="horizontal" class="h-full">
			<!-- LEFT: message list -->
			<Resizable.Pane defaultSize={38} minSize={28} maxSize={55} class="flex flex-col">
				<!-- Toolbar -->
				<div class="flex flex-col gap-3 border-b border-border p-3">
					<div class="flex items-center justify-between gap-2">
						<h2 class="text-sm font-semibold tracking-tight text-foreground">All mail</h2>
						<span class="text-xs text-muted-foreground tabular-nums">
							{unreadCount} unread
						</span>
					</div>
					<SearchInput bind:value={search} placeholder="Search messages..." />
					<div class="flex items-center gap-1">
						<Button
							variant={filter === 'all' ? 'secondary' : 'ghost'}
							size="sm"
							onclick={() => (filter = 'all')}
						>
							All
						</Button>
						<Button
							variant={filter === 'unread' ? 'secondary' : 'ghost'}
							size="sm"
							onclick={() => (filter = 'unread')}
						>
							Unread
						</Button>
					</div>
				</div>

				<!-- Scrollable list -->
				<div class="min-h-0 flex-1 overflow-y-auto">
					{#if visibleEmails.length === 0}
						<div class="p-4">
							<EmptyState
								icon={Mail}
								title="No messages"
								description="Nothing matches your search or filter right now."
							/>
						</div>
					{:else}
						<ul class="divide-y divide-border">
							{#each visibleEmails as email (email.id)}
								<li>
									<button
										type="button"
										onclick={() => select(email.id)}
										aria-pressed={selectedId === email.id}
										class={cn(
											'flex w-full items-start gap-3 px-3 py-3 text-left transition-colors',
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
													<span class="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread"
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

										<span
											role="button"
											tabindex="0"
											aria-label={email.starred ? 'Unstar message' : 'Star message'}
											onclick={(e) => toggleStar(email.id, e)}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													toggleStar(email.id, e as unknown as MouseEvent);
												}
											}}
											class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										>
											<Star
												class={cn('size-4', email.starred && 'fill-amber-400 text-amber-400')}
												aria-hidden="true"
											/>
										</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</Resizable.Pane>

			<Resizable.Handle withHandle />

			<!-- RIGHT: reader -->
			<Resizable.Pane defaultSize={62} class="flex flex-col">
				{#if selected}
					<!-- Action bar -->
					<div class="flex items-center gap-1 border-b border-border p-2">
						<Button variant="ghost" size="sm">
							<Reply class="size-4" aria-hidden="true" />
							Reply
						</Button>
						<Button variant="ghost" size="sm">
							<Forward class="size-4" aria-hidden="true" />
							Forward
						</Button>
						<div class="ml-auto flex items-center gap-1">
							<Button variant="ghost" size="sm">
								<Archive class="size-4" aria-hidden="true" />
								Archive
							</Button>
							<Button variant="ghost" size="sm" class="text-destructive hover:text-destructive">
								<Trash2 class="size-4" aria-hidden="true" />
								Delete
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
								<span>2 attachments</span>
							</div>
						</div>
					</div>

					<!-- Quick reply -->
					<div class="border-t border-border bg-muted/30 p-3">
						<Textarea
							bind:value={replyText}
							placeholder={`Reply to ${selected.from.name}...`}
							class="min-h-[72px] resize-none bg-background"
						/>
						<div class="mt-2 flex items-center justify-between">
							<span class="text-xs text-muted-foreground">Drafts are saved automatically</span>
							<Button size="sm" disabled={replyText.trim().length === 0}>
								<Send class="size-4" aria-hidden="true" />
								Send
							</Button>
						</div>
					</div>
				{:else}
					<div class="flex h-full items-center justify-center p-6">
						<EmptyState
							icon={Mail}
							title="Select a message"
							description="Choose a conversation from the list to read it here."
						/>
					</div>
				{/if}
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</div>
</PageContainer>
