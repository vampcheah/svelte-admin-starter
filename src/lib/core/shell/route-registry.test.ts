import { describe, expect, it } from 'vitest';
import { assertSupportedLayouts, toRouteId } from './route-registry';

describe('portable keep-alive route registry', () => {
	it('normalizes route groups and rejects dynamic nested layouts', () => {
		expect(toRouteId('/src/routes/(app)/settings/+layout.svelte', '/+layout.svelte')).toBe(
			'/settings'
		);
		expect(() => assertSupportedLayouts(['/src/routes/(app)/clients/[id]/+layout.svelte'])).toThrow(
			'dynamic nested layout: /clients/[id]'
		);
	});
});
