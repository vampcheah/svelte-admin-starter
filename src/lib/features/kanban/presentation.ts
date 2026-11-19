import type { BadgeTone } from '#lib/core/components/shared/StatusBadge.svelte';
import { t } from '#lib/i18n/index.ts';
import type { TranslationKey } from '#lib/i18n/types.ts';
import type { Column, Priority } from './board';

export const PRIORITY_TONE: Record<Priority, BadgeTone> = {
	low: 'info',
	medium: 'warning',
	high: 'danger'
};

const COLUMN_LABELS: Record<string, TranslationKey | undefined> = {
	backlog: 'kanban.columns.backlog',
	todo: 'kanban.columns.todo',
	'in-progress': 'kanban.columns.in-progress',
	review: 'kanban.columns.review',
	done: 'kanban.columns.done'
};

export function columnTitle(column: Column): string {
	const key = COLUMN_LABELS[column.id];
	return key ? t(key) : column.title;
}
