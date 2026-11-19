import type { DemoUser } from '#lib/data/users.ts';
import type { BadgeTone } from '#lib/core/components/shared/StatusBadge.svelte';
import { t, type TranslationKey } from '#lib/i18n/index.ts';

export const USER_ROLES = {
	admin: { label: 'users.roles.admin', tone: 'brand' },
	editor: { label: 'users.roles.editor', tone: 'neutral' },
	viewer: { label: 'users.roles.viewer', tone: 'outline' }
} as const satisfies Record<DemoUser['role'], { label: TranslationKey; tone: BadgeTone }>;

export const USER_STATUSES = {
	active: { label: 'users.statuses.active', tone: 'success' },
	invited: { label: 'users.statuses.invited', tone: 'warning' },
	suspended: { label: 'users.statuses.suspended', tone: 'danger' }
} as const satisfies Record<DemoUser['status'], { label: TranslationKey; tone: BadgeTone }>;

export function roleLabel(role: DemoUser['role']): string {
	const presentation = USER_ROLES[role];
	return presentation ? t(presentation.label) : role;
}

export function statusLabel(status: DemoUser['status']): string {
	const presentation = USER_STATUSES[status];
	return presentation ? t(presentation.label) : status;
}

export function roleTone(role: DemoUser['role']): BadgeTone {
	return USER_ROLES[role].tone;
}

export function statusTone(status: DemoUser['status']): BadgeTone {
	return USER_STATUSES[status].tone;
}
