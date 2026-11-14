import { describe, expect, it } from 'vitest';
import type { Component } from 'svelte';
import {
	appRoutePaths,
	buildBreadcrumbTrail,
	filterNavGroups,
	findNavItemInGroups,
	type ShellNavGroup,
	titleCase
} from './nav';

const DummyIcon = (() => undefined) as unknown as Component;

describe('core shell nav helpers', () => {
	it('filters nav groups by known route set and drops empty groups', () => {
		const groups: ShellNavGroup[] = [
			{
				label: 'App',
				items: [
					{ title: 'Users', href: '/users', icon: DummyIcon },
					{ title: 'Old', href: '/old', icon: DummyIcon }
				]
			},
			{
				label: 'Gone',
				items: [{ title: 'Ghost', href: '/ghost', icon: DummyIcon }]
			}
		];

		const filtered = filterNavGroups(groups, new Set(['/users']));
		expect(filtered).toEqual([
			{
				label: 'App',
				items: [{ title: 'Users', href: '/users', icon: DummyIcon }]
			}
		]);
	});

	it('extracts app route paths from glob paths', () => {
		const paths = appRoutePaths([
			'/src/routes/(app)/users/+page.svelte',
			'/src/routes/(app)/settings/[id]/+page.svelte',
			'/src/routes/(auth)/login/+page.svelte'
		]);
		expect([...paths].sort()).toEqual(['/settings/[id]', '/users']);
	});

	it('finds longest matching nav item in groups', () => {
		const groups: ShellNavGroup[] = [
			{
				label: 'Overview',
				items: [{ title: 'Dashboard', href: '/dashboard', icon: DummyIcon }]
			},
			{
				label: 'Templates',
				items: [
					{ title: 'Templates', href: '/templates', icon: DummyIcon },
					{ title: 'Templates List', href: '/templates/list', icon: DummyIcon }
				]
			}
		];

		expect(findNavItemInGroups(groups, '/dashboard')?.item.title).toBe('Dashboard');
		expect(findNavItemInGroups(groups, '/templates/list/item-1')?.item.title).toBe(
			'Templates List'
		);
		expect(findNavItemInGroups(groups, '/unknown')).toBeUndefined();
	});

	it('converts kebab-case segments to Title Case', () => {
		expect(titleCase('hello-world')).toBe('Hello World');
		expect(titleCase('users')).toBe('Users');
	});

	it('builds breadcrumb trail with home, matched nav item, extra segments, and leaf label', () => {
		const groups: ShellNavGroup[] = [
			{
				label: 'Management',
				items: [{ title: 'Users', href: '/users', icon: DummyIcon }]
			}
		];

		const trail = buildBreadcrumbTrail({
			pathname: '/users/123/edit',
			groups,
			home: { label: 'Home', href: '/dashboard' },
			groupLabel: (g) => g.label,
			itemTitle: (i) => i.title,
			leafLabel: 'Edit Profile'
		});

		expect(trail).toEqual([
			{ label: 'Home', href: '/dashboard' },
			{ label: 'Management' },
			{ label: 'Users', href: '/users' },
			{ label: '123', href: '/users/123' },
			{ label: 'Edit Profile', href: '/users/123/edit' }
		]);
	});

	it('builds fallback trail when no nav item matches', () => {
		const trail = buildBreadcrumbTrail({
			pathname: '/some/untracked/path',
			groups: []
		});

		expect(trail).toEqual([
			{ label: 'Some', href: '/some' },
			{ label: 'Untracked', href: '/some/untracked' },
			{ label: 'Path', href: '/some/untracked/path' }
		]);
	});
});
