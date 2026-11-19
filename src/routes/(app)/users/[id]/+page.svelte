<!--
  User detail — a tabbed entity-detail template for a single team member.

  Resolves the user from this tab’s route params against the shared demo directory; renders a
  centered EmptyState when no match is found. A profile header (avatar, name,
  role + status badges, actions) sits above three tabs: Overview (KPIs + a
  detail definition list), Activity (a vertical timeline), and Security (mock
  2FA toggle, password info, and active sessions). All data is mock.
-->
<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import UserX from '@lucide/svelte/icons/user-x';
	import Folder from '@lucide/svelte/icons/folder';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import MessageCircle from '@lucide/svelte/icons/message-square';
	import LogIn from '@lucide/svelte/icons/log-in';
	import Upload from '@lucide/svelte/icons/upload';
	import Settings from '@lucide/svelte/icons/settings';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { untrack, type Component } from 'svelte';

	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import StatCard from '#lib/core/components/shared/StatCard.svelte';
	import StatusBadge from '#lib/core/components/shared/StatusBadge.svelte';
	import EmptyState from '#lib/core/components/shared/EmptyState.svelte';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import * as Avatar from '#lib/core/components/ui/avatar/index.ts';
	import * as Tabs from '#lib/core/components/ui/tabs/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Switch } from '#lib/core/components/ui/switch/index.ts';
	import { Label } from '#lib/core/components/ui/label/index.ts';
	import { Separator } from '#lib/core/components/ui/separator/index.ts';

	import { useUsersState, type UserDraft } from '#lib/features/users/state.svelte.ts';
	import UserEditor from '#lib/features/users/UserEditor.svelte';
	import {
		roleLabel,
		roleTone,
		statusLabel,
		statusTone
	} from '#lib/features/users/presentation.ts';
	import { formatDate, initials } from '#lib/i18n/formatters.ts';
	import { t, type TranslationKey } from '#lib/i18n/index.ts';
	import { leafCrumb } from '#lib/shell/breadcrumb.svelte.ts';
	import { tabs as appTabs } from '#lib/shell/tabs.svelte.ts';
	import { cn } from '#lib/core/utils.ts';
	import { toast } from 'svelte-sonner';

	let { params }: { params?: Record<string, string> } = $props();
	const fieldId = $props.id();
	const directory = useUsersState();
	const id = $derived((params ?? page.params).id);
	const user = $derived(directory.find(id));

	// Publish this route's current name without subscribing to global tab mutations.
	// Duplicate instances share a label, so closing one does not clear another's label.
	$effect(() => {
		if (!id) return;
		const pathname = `/users/${id}`;
		const label = user?.name ?? t('users.notFound');
		untrack(() => {
			leafCrumb.set(pathname, label);
			appTabs.rename(pathname, label);
		});
	});

	let editorOpen = $state(false);
	let editorSession = $state(0);
	function openEditor() {
		editorSession += 1;
		editorOpen = true;
	}
	function save(draft: UserDraft) {
		if (!user || !directory.update(user.id, draft)) {
			toast.error(t('users.notFound'));
			return;
		}
		toast.success(t('users.updated'));
		editorOpen = false;
	}

	// --- Invented (mock) profile metadata, derived from the user record ------
	// Stable, deterministic picks so each profile renders consistently.
	const DEPARTMENTS = [
		'users.departments.engineering',
		'users.departments.design',
		'users.departments.marketing',
		'users.departments.operations',
		'users.departments.support'
	] as const;
	const LOCATIONS = [
		{ city: 'San Francisco, US', tz: 'UTC−08:00 (PST)' },
		{ city: 'London, UK', tz: 'UTC+00:00 (GMT)' },
		{ city: 'Berlin, DE', tz: 'UTC+01:00 (CET)' },
		{ city: 'Singapore, SG', tz: 'UTC+08:00 (SGT)' },
		{ city: 'New York, US', tz: 'UTC−05:00 (EST)' }
	];

	function hashIndex(id: string, length: number): number {
		let h = 0;
		for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
		return h % length;
	}

	const profile = $derived.by(() => {
		const id = user?.id ?? '';
		const li = hashIndex(id, LOCATIONS.length);
		const seed = hashIndex(id, 997);
		return {
			department: t(DEPARTMENTS[hashIndex(id, DEPARTMENTS.length)]),
			location: LOCATIONS[li].city,
			timezone: LOCATIONS[li].tz,
			projects: 4 + (seed % 18),
			tasksDone: 60 + (seed % 240),
			comments: 30 + ((seed * 7) % 410)
		};
	});

	// --- Mock activity timeline ---------------------------------------------
	interface ActivityEntry {
		icon: Component;
		text: string;
		time: string;
		tone: 'brand' | 'success' | 'muted';
	}

	const activity = $derived<ActivityEntry[]>([
		{
			icon: LogIn,
			text: t('users.activityText.signedIn'),
			time: t('users.time.hoursAgo', { count: 2 }),
			tone: 'brand'
		},
		{
			icon: CircleCheck,
			text: t('users.activityText.completedTask'),
			time: t('users.time.hoursAgo', { count: 6 }),
			tone: 'success'
		},
		{
			icon: MessageCircle,
			text: t('users.activityText.commented'),
			time: t('users.time.yesterday'),
			tone: 'muted'
		},
		{
			icon: Upload,
			text: t('users.activityText.uploaded'),
			time: t('users.time.daysAgo', { count: 2 }),
			tone: 'muted'
		},
		{
			icon: Folder,
			text: t('users.activityText.createdProject'),
			time: t('users.time.daysAgo', { count: 5 }),
			tone: 'brand'
		},
		{
			icon: Settings,
			text: t('users.activityText.updatedPreferences'),
			time: t('users.time.lastWeek'),
			tone: 'muted'
		}
	]);

	function dotClass(tone: ActivityEntry['tone']): string {
		return tone === 'brand'
			? 'bg-primary/10 text-primary'
			: tone === 'success'
				? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
				: 'bg-muted text-muted-foreground';
	}

	// --- Mock active sessions ------------------------------------------------
	interface Session {
		icon: Component;
		device: string;
		location: string;
		time: TranslationKey;
		count?: number;
		current: boolean;
	}

	let twoFactor = $state(true);

	const sessions = $state<Session[]>([
		{
			icon: Monitor,
			device: 'MacBook Pro · Chrome',
			location: 'San Francisco, US',
			time: 'users.time.activeNow',
			current: true
		},
		{
			icon: Smartphone,
			device: 'iPhone 15 · Safari',
			location: 'San Francisco, US',
			time: 'users.time.hoursAgo',
			count: 3,
			current: false
		},
		{
			icon: Monitor,
			device: 'Windows · Edge',
			location: 'London, UK',
			time: 'users.time.daysAgo',
			count: 4,
			current: false
		}
	]);

	function notImplemented(label: string) {
		toast.info(t('users.demoUnavailable', { action: label }));
	}

	function revokeSession(index: number) {
		const s = sessions[index];
		if (!s) return;
		sessions.splice(index, 1);
		toast.success(t('users.sessionRevoked'), {
			description: t('users.deviceSignedOut', { device: s.device })
		});
	}

	function onTwoFactorChange(checked: boolean) {
		twoFactor = checked;
		toast.success(t(checked ? 'users.twoFactorEnabled' : 'users.twoFactorDisabled'));
	}
</script>

<PageContainer>
	{#if !user}
		<div class="flex min-h-[60vh] items-center justify-center">
			<EmptyState
				icon={UserX}
				title={t('users.notFound')}
				description={t('users.notFoundDescription')}
				class="w-full max-w-md"
			>
				{#snippet action()}
					<Button href={resolve('users')} variant="outline">
						<ArrowLeft class="size-4" />
						{t('users.back')}
					</Button>
				{/snippet}
			</EmptyState>
		</div>
	{:else}
		<!-- Breadcrumb / back link -->
		<a
			href={resolve('users')}
			class="text-muted-foreground hover:text-foreground -mb-2 inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors"
		>
			<ArrowLeft class="size-4" aria-hidden="true" />
			{t('users.back')}
		</a>

		<!-- Profile header -->
		<div
			class="from-primary/10 via-primary/5 to-card relative overflow-hidden rounded-xl border bg-gradient-to-br p-6"
		>
			<div
				class="bg-primary/10 pointer-events-none absolute -top-16 -right-12 size-56 rounded-full blur-3xl"
				aria-hidden="true"
			></div>
			<div class="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-4">
					<Avatar.Root class="border-background size-16 border-2 shadow-sm">
						{#if user.avatarUrl}
							<Avatar.Image src={user.avatarUrl} alt={user.name} />
						{/if}
						<Avatar.Fallback class="bg-primary/10 text-primary text-lg font-semibold">
							{initials(user.name)}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="min-w-0 space-y-2">
						<h1 class="truncate text-2xl font-semibold tracking-tight">{user.name}</h1>
						<div class="flex flex-wrap items-center gap-2">
							<StatusBadge tone={roleTone(user.role)}>{roleLabel(user.role)}</StatusBadge>
							<StatusBadge tone={statusTone(user.status)}>{statusLabel(user.status)}</StatusBadge>
							<span class="text-muted-foreground truncate text-sm">{user.email}</span>
						</div>
					</div>
				</div>
				<div class="flex shrink-0 items-center gap-2">
					<Button variant="outline" onclick={openEditor}>
						<Pencil class="size-4" />
						{t('common.edit')}
					</Button>
					<Button variant="ghost" onclick={() => notImplemented(t('users.messaging'))}>
						<MessageSquare class="size-4" />
						{t('users.sendMessage')}
					</Button>
				</div>
			</div>
		</div>

		<!-- Tabs -->
		<Tabs.Root value="overview" class="gap-6">
			<Tabs.List>
				<Tabs.Trigger value="overview">{t('users.overview')}</Tabs.Trigger>
				<Tabs.Trigger value="activity">{t('users.activity')}</Tabs.Trigger>
				<Tabs.Trigger value="security">{t('users.security')}</Tabs.Trigger>
			</Tabs.List>

			<!-- Overview -->
			<Tabs.Content value="overview" class="space-y-6">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<StatCard
						title={t('users.projects')}
						value={profile.projects}
						icon={Folder}
						hint={t('users.active')}
					/>
					<StatCard
						title={t('users.tasksDone')}
						value={profile.tasksDone}
						icon={CircleCheck}
						change={12}
						trend="up"
						hint={t('users.thisQuarter')}
					/>
					<StatCard
						title={t('users.comments')}
						value={profile.comments}
						icon={MessageCircle}
						hint={t('users.allTime')}
					/>
				</div>

				<Card.Root>
					<Card.Header>
						<Card.Title>{t('users.detailsTitle')}</Card.Title>
						<Card.Description>{t('users.profileDescription')}</Card.Description>
					</Card.Header>
					<Card.Content>
						<dl class="divide-border divide-y">
							<div class="flex items-center justify-between gap-4 py-3 first:pt-0">
								<dt class="text-muted-foreground text-sm">{t('auth.email')}</dt>
								<dd class="truncate text-sm font-medium">{user.email}</dd>
							</div>
							<div class="flex items-center justify-between gap-4 py-3">
								<dt class="text-muted-foreground text-sm">{t('users.role')}</dt>
								<dd>
									<StatusBadge tone={roleTone(user.role)}>{roleLabel(user.role)}</StatusBadge>
								</dd>
							</div>
							<div class="flex items-center justify-between gap-4 py-3">
								<dt class="text-muted-foreground text-sm">{t('users.status')}</dt>
								<dd>
									<StatusBadge tone={statusTone(user.status)}
										>{statusLabel(user.status)}</StatusBadge
									>
								</dd>
							</div>
							<div class="flex items-center justify-between gap-4 py-3">
								<dt class="text-muted-foreground text-sm">{t('users.department')}</dt>
								<dd class="text-sm font-medium">{profile.department}</dd>
							</div>
							<div class="flex items-center justify-between gap-4 py-3">
								<dt class="text-muted-foreground text-sm">{t('users.location')}</dt>
								<dd class="text-sm font-medium">{profile.location}</dd>
							</div>
							<div class="flex items-center justify-between gap-4 py-3">
								<dt class="text-muted-foreground text-sm">{t('users.timezone')}</dt>
								<dd class="text-sm font-medium tabular-nums">{profile.timezone}</dd>
							</div>
							<div class="flex items-center justify-between gap-4 py-3">
								<dt class="text-muted-foreground text-sm">{t('users.joined')}</dt>
								<dd class="text-sm font-medium tabular-nums">{formatDate(user.createdAt)}</dd>
							</div>
							<div class="flex items-center justify-between gap-4 py-3 last:pb-0">
								<dt class="text-muted-foreground text-sm">{t('users.id')}</dt>
								<dd class="text-muted-foreground font-mono text-xs">{user.id}</dd>
							</div>
						</dl>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<!-- Activity -->
			<Tabs.Content value="activity" class="space-y-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>{t('users.recentActivity')}</Card.Title>
						<Card.Description>{t('users.activityDescription')}</Card.Description>
					</Card.Header>
					<Card.Content>
						<ol class="relative space-y-6">
							<!-- connecting rail -->
							<span class="bg-border absolute top-2 bottom-2 left-[15px] w-px" aria-hidden="true"
							></span>
							{#each activity as item, i (i)}
								<li class="relative flex gap-4">
									<span
										class={cn(
											'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
											dotClass(item.tone)
										)}
									>
										<item.icon class="size-4" aria-hidden="true" />
									</span>
									<div class="flex min-w-0 flex-1 items-start justify-between gap-4 pt-1">
										<p class="text-foreground text-sm">{item.text}</p>
										<span class="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
											{item.time}
										</span>
									</div>
								</li>
							{/each}
						</ol>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<!-- Security -->
			<Tabs.Content value="security" class="space-y-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>{t('users.security')}</Card.Title>
						<Card.Description>{t('users.securityDescription')}</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-1">
						<!-- Two-factor -->
						<div class="flex items-center justify-between gap-4 py-2">
							<div class="space-y-0.5">
								<div class="flex items-center gap-2">
									<ShieldCheck class="text-muted-foreground size-4" aria-hidden="true" />
									<Label for={`${fieldId}-two-factor`} class="text-sm font-medium"
										>{t('users.twoFactor')}</Label
									>
								</div>
								<p class="text-muted-foreground text-sm">
									{t('users.twoFactorDescription')}
								</p>
							</div>
							<Switch
								id={`${fieldId}-two-factor`}
								checked={twoFactor}
								onCheckedChange={onTwoFactorChange}
								aria-label={t('users.twoFactor')}
							/>
						</div>

						<Separator />

						<!-- Last password change -->
						<div class="flex items-center justify-between gap-4 py-2">
							<div class="space-y-0.5">
								<p class="text-sm font-medium">{t('auth.password')}</p>
								<p class="text-muted-foreground text-sm">
									{t('users.passwordChanged', { date: formatDate('2024-09-14') })}
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								onclick={() => notImplemented(t('users.resettingPasswords'))}
							>
								{t('users.resetPassword')}
							</Button>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>{t('users.activeSessions')}</Card.Title>
						<Card.Description>{t('users.sessionsDescription')}</Card.Description>
					</Card.Header>
					<Card.Content>
						{#if sessions.length === 0}
							<p class="text-muted-foreground py-4 text-center text-sm">{t('users.noSessions')}</p>
						{:else}
							<ul class="divide-border divide-y">
								{#each sessions as session, i (session.device)}
									<li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
										<span
											class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg"
											aria-hidden="true"
										>
											<session.icon class="size-4" />
										</span>
										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-2">
												<p class="truncate text-sm font-medium">{session.device}</p>
												{#if session.current}
													<StatusBadge tone="success">{t('users.thisDevice')}</StatusBadge>
												{/if}
											</div>
											<p class="text-muted-foreground truncate text-xs">
												{session.location} · {t(session.time, { count: session.count ?? 0 })}
											</p>
										</div>
										<Button
											variant="ghost"
											size="sm"
											class="text-muted-foreground hover:text-destructive shrink-0"
											disabled={session.current}
											onclick={() => revokeSession(i)}
										>
											{t('users.revoke')}
										</Button>
									</li>
								{/each}
							</ul>
						{/if}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</PageContainer>

{#key editorSession}
	<UserEditor bind:open={editorOpen} {user} editing onSave={save} />
{/key}
