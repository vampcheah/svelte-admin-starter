import type { TranslationKey } from '#lib/i18n/index.ts';
import type { Category } from './types';
export const CATEGORIES: Record<Category, { labelKey: TranslationKey; chip: string; dot: string }> =
	{
		meeting: {
			labelKey: 'calendar.categoryMeeting',
			chip: 'bg-primary/10 text-primary',
			dot: 'bg-primary'
		},
		review: {
			labelKey: 'calendar.categoryReview',
			chip: 'bg-secondary text-secondary-foreground',
			dot: 'bg-secondary-foreground'
		},
		deadline: {
			labelKey: 'calendar.categoryDeadline',
			chip: 'bg-destructive/10 text-destructive',
			dot: 'bg-destructive'
		},
		personal: {
			labelKey: 'calendar.categoryPersonal',
			chip: 'bg-accent text-accent-foreground',
			dot: 'bg-accent-foreground'
		}
	};

export const CATEGORY_ORDER: Category[] = ['meeting', 'review', 'deadline', 'personal'];
