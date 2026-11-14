import { describe, expect, it } from 'vitest';
import { Confirmer } from './confirm.svelte';

describe('Confirmer', () => {
	it('opens dialog with options and resolves true when accepted', async () => {
		const confirmer = new Confirmer();
		expect(confirmer.open).toBe(false);

		const promise = confirmer.ask({
			title: 'Delete item',
			description: 'Are you sure?',
			variant: 'destructive',
			warningHighlights: ['item']
		});

		expect(confirmer.open).toBe(true);
		expect(confirmer.opts.title).toBe('Delete item');
		expect(confirmer.opts.warningHighlights).toEqual(['item']);

		confirmer.accept();

		const result = await promise;
		expect(result).toBe(true);
		expect(confirmer.open).toBe(false);
	});

	it('resolves false when dismissed', async () => {
		const confirmer = new Confirmer();
		const promise = confirmer.ask({ title: 'Cancel action' });

		expect(confirmer.open).toBe(true);

		confirmer.dismissed();

		const result = await promise;
		expect(result).toBe(false);
		expect(confirmer.open).toBe(false);
	});

	it('settles any previous pending ask with false when a new ask is made', async () => {
		const confirmer = new Confirmer();
		const firstPromise = confirmer.ask({ title: 'First ask' });
		expect(confirmer.open).toBe(true);

		const secondPromise = confirmer.ask({ title: 'Second ask' });
		expect(confirmer.opts.title).toBe('Second ask');

		const firstResult = await firstPromise;
		expect(firstResult).toBe(false);

		confirmer.accept();
		const secondResult = await secondPromise;
		expect(secondResult).toBe(true);
		expect(confirmer.open).toBe(false);
	});
});
