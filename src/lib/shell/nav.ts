// Navigation model for the admin shell: grouped sidebar routes + lookup helper.
import type { Component } from 'svelte';
import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
import Users from '@lucide/svelte/icons/users';
import Table from '@lucide/svelte/icons/table';
import ClipboardList from '@lucide/svelte/icons/clipboard-list';
import ComponentIcon from '@lucide/svelte/icons/component';
import ChartLine from '@lucide/svelte/icons/chart-line';
import User from '@lucide/svelte/icons/user';
import Settings from '@lucide/svelte/icons/settings';
import CalendarDays from '@lucide/svelte/icons/calendar-days';
import Inbox from '@lucide/svelte/icons/inbox';
import SquareKanban from '@lucide/svelte/icons/square-kanban';
import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
import Tag from '@lucide/svelte/icons/tag';
import CreditCard from '@lucide/svelte/icons/credit-card';

export interface NavItem {
	title: string;
	href: string;
	icon: Component;
	badge?: string | number;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const navGroups: NavGroup[] = [
	{
		label: 'Overview',
		items: [{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }]
	},
	{
		label: 'Management',
		items: [
			{ title: 'Users', href: '/users', icon: Users },
			{ title: 'Tables', href: '/tables', icon: Table },
			{ title: 'Forms', href: '/forms', icon: ClipboardList }
		]
	},
	{
		label: 'Apps',
		items: [
			{ title: 'Calendar', href: '/calendar', icon: CalendarDays },
			{ title: 'Inbox', href: '/inbox', icon: Inbox },
			{ title: 'Board', href: '/kanban', icon: SquareKanban }
		]
	},
	{
		label: 'Commerce',
		items: [
			{ title: 'Sales Orders', href: '/orders', icon: ShoppingBag },
			{ title: 'Cart', href: '/cart', icon: ShoppingCart }
		]
	},
	{
		label: 'Showcase',
		items: [
			{ title: 'Components', href: '/components', icon: ComponentIcon },
			{ title: 'Charts', href: '/charts', icon: ChartLine }
		]
	},
	{
		label: 'Billing',
		items: [
			{ title: 'Pricing', href: '/pricing', icon: Tag },
			{ title: 'Billing', href: '/billing', icon: CreditCard }
		]
	},
	{
		label: 'Account',
		items: [
			{ title: 'Profile', href: '/profile', icon: User },
			{ title: 'Settings', href: '/settings', icon: Settings }
		]
	}
];

/**
 * Find the nav item whose `href` is the longest prefix of `pathname`.
 * Returns the owning group alongside the matched item, or `undefined`.
 */
export function findNavItem(
	pathname: string
): { group: NavGroup; item: NavItem } | undefined {
	let best: { group: NavGroup; item: NavItem } | undefined;
	for (const group of navGroups) {
		for (const item of group.items) {
			const isMatch =
				pathname === item.href || pathname.startsWith(item.href + '/');
			if (!isMatch) continue;
			if (!best || item.href.length > best.item.href.length) {
				best = { group, item };
			}
		}
	}
	return best;
}
