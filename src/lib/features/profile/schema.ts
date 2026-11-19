import { z } from 'zod';
import { createEmailSchema } from '#lib/core/utils/validators.ts';
import type en from './locales/en';

export type ProfileValidationKey = `profile.validation.${keyof typeof en.validation}`;

export function createProfileSchema(text: (key: ProfileValidationKey) => string) {
	return z.object({
		name: z.string().trim().min(1, text('profile.validation.name')),
		email: createEmailSchema({
			required: text('profile.validation.emailRequired'),
			invalid: text('profile.validation.emailInvalid')
		}),
		bio: z.string().trim()
	});
}
