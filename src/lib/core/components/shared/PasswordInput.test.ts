import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import PasswordInput from './PasswordInput.svelte';
import { PasswordInput as CompatibilityPasswordInput } from '../ui/password-input';
import CompatibilityPasswordInputFile from '../ui/password-input/password-input.svelte';

describe('PasswordInput', () => {
	it('uses the canonical component for the compatibility export', () => {
		expect(CompatibilityPasswordInput).toBe(PasswordInput);
		expect(
			render(CompatibilityPasswordInputFile, { props: { showLabel: 'Reveal secret' } }).body
		).toContain('aria-label="Reveal secret"');
	});

	it('renders customizable accessible toggle text', () => {
		const body = render(PasswordInput, {
			props: { showLabel: 'Reveal secret', hideLabel: 'Conceal secret' }
		}).body;
		expect(body).toContain('aria-label="Reveal secret"');
		expect(body).toContain('aria-pressed="false"');
	});
});
