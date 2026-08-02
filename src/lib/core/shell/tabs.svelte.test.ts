import { describe, expect, it } from 'vitest';
import { openLandedRoute, Tabs } from './tabs.svelte';

function createTabs(confirmOverflow: () => Promise<boolean>, softLimit = 1) {
	return new Tabs({
		homePathname: '/home',
		softLimit,
		confirmOverflow,
		describe(pathname, _data, baseTitle) {
			const title = baseTitle ?? pathname;
			return { title, baseTitle: title };
		}
	});
}

describe('portable tabs', () => {
	it('owns overflow confirmation and restores the previous URL when cancelled', async () => {
		let allow = false;
		let confirmations = 0;
		const tabs = createTabs(async () => {
			confirmations += 1;
			return allow;
		});
		await tabs.open('/home', undefined, '/home?view=active');

		let restored = '';
		expect(
			await openLandedRoute(tabs, '/reports', {}, '/reports?month=1', (url) => {
				restored = url;
			})
		).toBe(false);
		expect(restored).toBe('/home?view=active');
		expect(tabs.items).toHaveLength(1);

		allow = true;
		expect(await tabs.open('/reports', {}, '/reports?month=1')).toBe(true);
		expect(tabs.items.at(-1)?.url).toBe('/reports?month=1');
		expect(confirmations).toBe(2);
	});

	it('applies the same guard to independent and cloned tabs', async () => {
		let confirmations = 0;
		const tabs = createTabs(async () => {
			confirmations += 1;
			return false;
		});
		await tabs.open('/home');
		expect(await tabs.openNew('/reports')).toBeNull();
		expect(await tabs.clone(tabs.active)).toBeNull();
		expect(confirmations).toBe(2);
		expect(tabs.items).toHaveLength(1);
	});
});
