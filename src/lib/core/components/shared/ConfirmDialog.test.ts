import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog.svelte';

vi.mock('../ui/alert-dialog', async (importOriginal) => {
	const original = await importOriginal<typeof import('../ui/alert-dialog')>();
	const { default: Content } = await import('./PickerContent.test.svelte');
	return { ...original, Content };
});

describe('ConfirmDialog', () => {
	it('highlights auto matches and custom highlights with text-primary', () => {
		const body = render(ConfirmDialog, {
			props: {
				open: true,
				title: 'Confirm Payment',
				description: 'Pay invoice INV-2026-001 for $1,234.56 to vendor Acme Corp.',
				highlights: ['Acme Corp'],
				onConfirm: vi.fn()
			}
		}).body;

		expect(body).toContain('<strong class="text-primary font-semibold">INV-2026-001</strong>');
		expect(body).toContain('<strong class="text-primary font-semibold">1,234.56</strong>');
		expect(body).toContain('<strong class="text-primary font-semibold">Acme Corp</strong>');
	});

	it('highlights warningHighlights with orange text styling', () => {
		const body = render(ConfirmDialog, {
			props: {
				open: true,
				title: 'Delete Resource',
				description: 'This will permanently destroy database ProductionDB.',
				warningHighlights: ['ProductionDB'],
				onConfirm: vi.fn()
			}
		}).body;

		expect(body).toContain(
			'<strong class="text-orange-600 dark:text-orange-400 font-semibold">ProductionDB</strong>'
		);
	});

	it('renders default button labels from core i18n fallback', () => {
		const body = render(ConfirmDialog, {
			props: {
				open: true,
				title: 'Are you sure?',
				onConfirm: vi.fn()
			}
		}).body;

		expect(body).toContain('Cancel');
		expect(body).toContain('Confirm');
	});

	it('renders custom confirm and cancel labels', () => {
		const body = render(ConfirmDialog, {
			props: {
				open: true,
				title: 'Delete file?',
				confirmText: 'Delete Now',
				cancelText: 'Keep File',
				onConfirm: vi.fn()
			}
		}).body;

		expect(body).toContain('Delete Now');
		expect(body).toContain('Keep File');
	});
});
