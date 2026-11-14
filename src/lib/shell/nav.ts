// Navigation model for the admin shell: grouped sidebar routes + lookup helper.
import type { Pathname } from '$app/types';
import type { TranslationKey } from '$lib/i18n';
import {
	appRoutePaths,
	filterNavGroups,
	findNavItemInGroups,
	type ShellNavGroup,
	type ShellNavItem
} from '$lib/core/shell/nav';
import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
import Users from '@lucide/svelte/icons/users';
import CalendarDays from '@lucide/svelte/icons/calendar-days';
import Inbox from '@lucide/svelte/icons/inbox';
import SquareKanban from '@lucide/svelte/icons/square-kanban';
import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
import Tag from '@lucide/svelte/icons/tag';
import CreditCard from '@lucide/svelte/icons/credit-card';
import ComponentIcon from '@lucide/svelte/icons/component';
import Sparkles from '@lucide/svelte/icons/sparkles';
import ChartLine from '@lucide/svelte/icons/chart-line';
import List from '@lucide/svelte/icons/list';
import Search from '@lucide/svelte/icons/search';
import ListFilter from '@lucide/svelte/icons/list-filter';
import ListChecks from '@lucide/svelte/icons/list-checks';
import ListTodo from '@lucide/svelte/icons/list-todo';
import Database from '@lucide/svelte/icons/database';
import Loader from '@lucide/svelte/icons/loader';
import FormInput from '@lucide/svelte/icons/form-input';
import FileText from '@lucide/svelte/icons/file-text';
import Settings2 from '@lucide/svelte/icons/settings-2';
import User from '@lucide/svelte/icons/user';
import Settings from '@lucide/svelte/icons/settings';

export type NavItem = ShellNavItem<Pathname, TranslationKey>;
export type NavGroup = ShellNavGroup<Pathname, TranslationKey>;

const configuredNavGroups: NavGroup[] = [
	{
		label: 'Overview',
		labelKey: 'nav.groups.overview',
		items: [
			{ title: 'Dashboard', titleKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard }
		]
	},
	{
		label: 'Applications',
		labelKey: 'nav.groups.applications',
		items: [
			{ title: 'Users', titleKey: 'nav.users', href: '/users', icon: Users },
			{ title: 'Calendar', titleKey: 'nav.calendar', href: '/calendar', icon: CalendarDays },
			{ title: 'Inbox', titleKey: 'nav.inbox', href: '/inbox', icon: Inbox },
			{ title: 'Kanban', titleKey: 'nav.kanban', href: '/kanban', icon: SquareKanban },
			{ title: 'Sales Orders', titleKey: 'nav.orders', href: '/orders', icon: ShoppingBag },
			{ title: 'Cart', titleKey: 'nav.cart', href: '/cart', icon: ShoppingCart },
			{ title: 'Pricing', titleKey: 'nav.pricing', href: '/pricing', icon: Tag },
			{ title: 'Billing', titleKey: 'nav.billing', href: '/billing', icon: CreditCard }
		]
	},
	{
		label: 'Component Gallery',
		labelKey: 'nav.groups.components',
		items: [
			{ title: 'Components', titleKey: 'nav.components', href: '/components', icon: ComponentIcon },
			{ title: 'Icons', titleKey: 'nav.icons', href: '/icons', icon: Sparkles },
			{ title: 'Charts', titleKey: 'nav.charts', href: '/charts', icon: ChartLine }
		]
	},
	{
		label: 'Data Tables',
		labelKey: 'nav.groups.tables',
		items: [
			{ title: 'Basic', titleKey: 'nav.tablesBasic', href: '/tables/basic', icon: List },
			{
				title: 'Pagination',
				titleKey: 'nav.tablesPagination',
				href: '/tables/pagination',
				icon: ListTodo
			},
			{
				title: 'Search & Sort',
				titleKey: 'nav.tablesSearch',
				href: '/tables/search',
				icon: Search
			},
			{
				title: 'Filters',
				titleKey: 'nav.tablesFilters',
				href: '/tables/filters',
				icon: ListFilter
			},
			{
				title: 'Selection',
				titleKey: 'nav.tablesSelection',
				href: '/tables/selection',
				icon: ListChecks
			},
			{
				title: 'Row Actions',
				titleKey: 'nav.tablesActions',
				href: '/tables/actions',
				icon: Settings2
			},
			{
				title: 'Server-side',
				titleKey: 'nav.tablesServer',
				href: '/tables/server',
				icon: Database
			},
			{ title: 'States', titleKey: 'nav.tablesStates', href: '/tables/states', icon: Loader }
		]
	},
	{
		label: 'Page Templates',
		labelKey: 'nav.groups.templates',
		items: [
			{ title: 'List', titleKey: 'nav.templatesList', href: '/templates/list', icon: List },
			{ title: 'Form', titleKey: 'nav.templatesForm', href: '/templates/form', icon: FormInput },
			{
				title: 'Detail',
				titleKey: 'nav.templatesDetail',
				href: '/templates/detail',
				icon: FileText
			},
			{
				title: 'Dashboard',
				titleKey: 'nav.templatesDashboard',
				href: '/templates/dashboard',
				icon: LayoutDashboard
			},
			{
				title: 'Settings',
				titleKey: 'nav.templatesSettings',
				href: '/templates/settings',
				icon: Settings2
			}
		]
	},
	{
		label: 'Account',
		labelKey: 'nav.groups.account',
		items: [
			{ title: 'Profile', titleKey: 'nav.profile', href: '/profile', icon: User },
			{ title: 'Settings', titleKey: 'nav.settings', href: '/settings', icon: Settings }
		]
	}
];

export { filterNavGroups, appRoutePaths };

const appRoutes = appRoutePaths(Object.keys(import.meta.glob('/src/routes/**/+page.svelte')));

/** Only render configured destinations whose route still exists. */
export const navGroups = filterNavGroups(configuredNavGroups, appRoutes);

/** Find the longest matching navigation path. */
export function findNavItem(pathname: string): { group: NavGroup; item: NavItem } | undefined {
	return findNavItemInGroups(navGroups, pathname);
}
