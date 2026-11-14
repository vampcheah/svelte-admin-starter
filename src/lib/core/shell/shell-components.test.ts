import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Breadcrumbs from './Breadcrumbs.svelte';

describe('Breadcrumbs portable component', () => {
	it('renders breadcrumb items and separators with custom resolveHref', () => {
		const crumbs = [
			{ label: 'Home', href: '/dashboard' },
			{ label: 'Management' },
			{ label: 'Users', href: '/users' },
			{ label: 'Profile' }
		];

		const resolveHref = (href: string) => `/app-base${href}`;

		const body = render(Breadcrumbs, {
			props: {
				crumbs,
				resolveHref
			}
		}).body;

		expect(body).toContain('Home');
		expect(body).toContain('href="/app-base/dashboard"');
		expect(body).toContain('Management');
		expect(body).toContain('Users');
		expect(body).toContain('href="/app-base/users"');
		expect(body).toContain('Profile');
		// The last crumb should not be a link
		expect(body).not.toContain('href="/app-base/profile"');
	});
});
