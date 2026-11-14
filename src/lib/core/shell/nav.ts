import type { Component } from 'svelte';
import { toRouteId } from './route-registry';

export interface ShellNavItem<Href extends string = string, Key extends string = string> {
	title: string;
	titleKey?: Key;
	href: Href;
	icon: Component;
	badge?: string | number;
}

export interface ShellNavGroup<Href extends string = string, Key extends string = string> {
	label: string;
	labelKey?: Key;
	items: ShellNavItem<Href, Key>[];
}

export interface BreadcrumbCrumb {
	label: string;
	href?: string;
}

export function filterNavGroups<G extends ShellNavGroup>(
	groups: readonly G[],
	routes: ReadonlySet<string>
): G[] {
	return groups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => routes.has(item.href))
		}))
		.filter((group) => group.items.length > 0) as G[];
}

export function appRoutePaths(files: Iterable<string>): Set<string> {
	return new Set(
		Array.from(files)
			.filter((file) => file.includes('/(app)/'))
			.map((file) => toRouteId(file, '/+page.svelte'))
	);
}

export function findNavItemInGroups<G extends ShellNavGroup>(
	groups: readonly G[],
	pathname: string
): { group: G; item: G['items'][number] } | undefined {
	let best: { group: G; item: G['items'][number] } | undefined;
	for (const group of groups) {
		for (const item of group.items) {
			const isMatch = pathname === item.href || pathname.startsWith(item.href + '/');
			if (isMatch && (!best || item.href.length > best.item.href.length)) {
				best = { group, item };
			}
		}
	}
	return best;
}

export function titleCase(segment: string): string {
	return segment
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export interface BuildBreadcrumbTrailOptions {
	pathname: string;
	groups?: readonly ShellNavGroup[];
	home?: { label: string; href?: string };
	groupLabel?: (group: ShellNavGroup) => string;
	itemTitle?: (item: ShellNavItem) => string;
	leafLabel?: string;
}

export function buildBreadcrumbTrail({
	pathname,
	groups = [],
	home,
	groupLabel = (g) => g.label,
	itemTitle = (i) => i.title,
	leafLabel
}: BuildBreadcrumbTrailOptions): BreadcrumbCrumb[] {
	const trail: BreadcrumbCrumb[] = [];
	if (home) {
		trail.push({ label: home.label, href: home.href });
	}

	const match = findNavItemInGroups(groups, pathname);
	if (match) {
		trail.push({ label: groupLabel(match.group) });
		trail.push({ label: itemTitle(match.item), href: match.item.href });

		const rest = pathname.slice(match.item.href.length).split('/').filter(Boolean);
		let acc = match.item.href;
		for (const seg of rest) {
			acc += '/' + seg;
			trail.push({ label: titleCase(seg), href: acc });
		}
	} else {
		let acc = '';
		for (const seg of pathname.split('/').filter(Boolean)) {
			acc += '/' + seg;
			trail.push({ label: titleCase(seg), href: acc });
		}
	}

	if (leafLabel && trail.length > (home ? 1 : 0)) {
		trail[trail.length - 1] = {
			...trail[trail.length - 1],
			label: leafLabel
		};
	}

	return trail;
}
