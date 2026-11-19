import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/paths', () => ({
	resolve: (pathname: string) =>
		pathname === '/' ? '/admin/' : `/admin/${pathname.replace(/^\//, '')}`
}));

import { resolveAppUrl, toAppPathname, toAppUrl } from './paths';
import { createRouteRegistry } from '#lib/core/shell/route-registry.ts';
import type { Component } from 'svelte';

describe('app navigation paths', () => {
	it('strips only the complete base prefix', () => {
		expect(toAppPathname('/admin/users/1')).toBe('/users/1');
		expect(toAppPathname('/admin')).toBe('/');
		expect(toAppPathname('/administrator')).toBe('/administrator');
		expect(toAppPathname('/users/1', '')).toBe('/users/1');
	});

	it('preserves a tab query while resolving its base once', () => {
		const stored = toAppUrl(new URL('https://example.com/admin/users/1?view=activity'));
		expect(stored).toBe('/users/1?view=activity');
		expect(resolveAppUrl(stored)).toBe('/admin/users/1?view=activity');
		expect(resolveAppUrl('/settings?tab=general#name')).toBe('/admin/settings?tab=general#name');
	});

	it('matches a based URL to a page nested within route groups', () => {
		const loader = async () => ({ default: {} as Component });
		const registry = createRouteRegistry(
			{ '/src/routes/(app)/(account)/users/[id]/+page.svelte': loader },
			{}
		);
		expect(registry.resolveChain(toAppPathname('/admin/users/1'))).toEqual([loader]);
	});
});
