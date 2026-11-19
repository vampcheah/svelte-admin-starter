import { z } from 'zod';
import type { DateValue } from '@internationalized/date';
import { isDateWithinBounds, parseDateValue } from '#lib/components/shared/date-time-utils.ts';
import type en from './locales/en';

export type ProjectValidationKey = `projectForm.validation.${keyof typeof en.validation}`;

export const PROJECT_CATEGORIES = ['web', 'mobile', 'api', 'data'] as const;
export const PROJECT_TECHNOLOGIES = ['svelte', 'react', 'node', 'python'] as const;
export const PROJECT_VISIBILITIES = ['private', 'team', 'public'] as const;

export function createProjectSchema(
	text: (key: ProjectValidationKey) => string,
	minDate: DateValue
) {
	return z.object({
		name: z.string().trim().min(3, text('projectForm.validation.name')),
		description: z.string().trim().max(280, text('projectForm.validation.description')),
		category: z.enum(PROJECT_CATEGORIES, { error: text('projectForm.validation.category') }),
		stack: z
			.array(z.enum(PROJECT_TECHNOLOGIES, { error: text('projectForm.validation.stackInvalid') }))
			.min(1, text('projectForm.validation.stack')),
		visibility: z.enum(PROJECT_VISIBILITIES, { error: text('projectForm.validation.visibility') }),
		dueDate: z
			.string()
			.min(1, text('projectForm.validation.dueDate'))
			.refine(
				(value) => !value || isDateWithinBounds(parseDateValue(value), minDate),
				text('projectForm.validation.dueDateInvalid')
			),
		priority: z
			.number({ error: text('projectForm.validation.priority') })
			.min(0, text('projectForm.validation.priority'))
			.max(100, text('projectForm.validation.priority'))
	});
}
