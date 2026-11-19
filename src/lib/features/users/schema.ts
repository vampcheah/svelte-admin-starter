import { z } from 'zod';
import { createEmailSchema } from '#lib/core/utils/validators.ts';
import type { TranslationKey } from '#lib/i18n/index.ts';

export type UserValidationKey = Extract<TranslationKey, `validation.${string}`>;

/** Build on submit so validation uses the caller's current locale. */
export function createUserSchema(text: (key: UserValidationKey) => string) {
	return z.object({
		name: z.string().trim().min(1, text('validation.nameRequired')),
		email: createEmailSchema({
			required: text('validation.emailRequired'),
			invalid: text('validation.emailInvalid')
		}),
		role: z.enum(['admin', 'editor', 'viewer'], { error: text('validation.roleInvalid') }),
		status: z.enum(['active', 'invited', 'suspended'], { error: text('validation.statusInvalid') })
	});
}
