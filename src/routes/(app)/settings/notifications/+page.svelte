<!--
  Notification settings. Preference toggles grouped into Email / Push / SMS
  cards. Everything lives in local $state (no backend) and Save shows a toast.
-->
<script lang="ts">
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import PreferenceRow from '#lib/core/components/shared/PreferenceRow.svelte';
	import { t } from '#lib/i18n/index.ts';
	import { Separator } from '#lib/core/components/ui/separator/index.ts';
	import { toast } from 'svelte-sonner';
	import type { Component } from 'svelte';
	import type { TranslationKey } from '#lib/i18n/index.ts';
	import Mail from '@lucide/svelte/icons/mail';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Save from '@lucide/svelte/icons/save';

	interface Preference {
		id: string;
		label: TranslationKey;
		description: TranslationKey;
		enabled: boolean;
	}

	interface PreferenceGroup {
		id: string;
		title: TranslationKey;
		description: TranslationKey;
		icon: Component;
		preferences: Preference[];
	}

	// Grouped notification preferences with mock defaults.
	let groups = $state<PreferenceGroup[]>([
		{
			id: 'email',
			title: 'notificationSettings.email',
			description: 'notificationSettings.emailDescription',
			icon: Mail,
			preferences: [
				{
					id: 'email-product',
					label: 'notificationSettings.product',
					description: 'notificationSettings.productDescription',
					enabled: true
				},
				{
					id: 'email-security',
					label: 'notificationSettings.security',
					description: 'notificationSettings.securityDescription',
					enabled: true
				},
				{
					id: 'email-marketing',
					label: 'notificationSettings.marketing',
					description: 'notificationSettings.marketingDescription',
					enabled: false
				}
			]
		},
		{
			id: 'push',
			title: 'notificationSettings.push',
			description: 'notificationSettings.pushDescription',
			icon: Smartphone,
			preferences: [
				{
					id: 'push-activity',
					label: 'notificationSettings.activity',
					description: 'notificationSettings.activityDescription',
					enabled: true
				},
				{
					id: 'push-reminders',
					label: 'notificationSettings.reminders',
					description: 'notificationSettings.remindersDescription',
					enabled: false
				}
			]
		},
		{
			id: 'sms',
			title: 'notificationSettings.sms',
			description: 'notificationSettings.smsDescription',
			icon: MessageSquare,
			preferences: [
				{
					id: 'sms-security',
					label: 'notificationSettings.codes',
					description: 'notificationSettings.codesDescription',
					enabled: true
				},
				{
					id: 'sms-alerts',
					label: 'notificationSettings.alerts',
					description: 'notificationSettings.alertsDescription',
					enabled: false
				}
			]
		}
	]);

	function setPreference(groupId: string, prefId: string, value: boolean): void {
		const group = groups.find((g) => g.id === groupId);
		const pref = group?.preferences.find((p) => p.id === prefId);
		if (pref) pref.enabled = value;
	}

	function savePreferences(): void {
		toast.success(t('notificationSettings.saved'), {
			description: t('notificationSettings.savedDescription')
		});
	}
</script>

{#each groups as group (group.id)}
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-3">
				<div
					class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
				>
					<group.icon class="size-4" />
				</div>
				<div>
					<Card.Title>{t(group.title)}</Card.Title>
					<Card.Description>{t(group.description)}</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="space-y-1">
			{#each group.preferences as pref, i (pref.id)}
				{#if i > 0}
					<Separator class="my-1" />
				{/if}
				<PreferenceRow
					label={t(pref.label)}
					description={t(pref.description)}
					checked={pref.enabled}
					onCheckedChange={(value) => setPreference(group.id, pref.id, value)}
				/>
			{/each}
		</Card.Content>
	</Card.Root>
{/each}

<div class="flex justify-end">
	<Button onclick={savePreferences}>
		<Save class="size-4" />
		{t('notificationSettings.save')}
	</Button>
</div>
