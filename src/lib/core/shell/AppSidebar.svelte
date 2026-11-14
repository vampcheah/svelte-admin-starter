<!-- Admin sidebar: brand header, grouped nav with active highlighting, user footer dropdown. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { mergeProps } from 'bits-ui';
	import * as Sidebar from '../components/ui/sidebar';
	import { useSidebar } from '../components/ui/sidebar';
	import * as DropdownMenu from '../components/ui/dropdown-menu';
	import * as ContextMenu from '../components/ui/context-menu';
	import * as Avatar from '../components/ui/avatar';
	import { initials } from '../utils/formatters';
	import { coreI18n } from '../i18n.svelte';
	import type { ShellNavGroup, ShellNavItem } from './nav';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Plus from '@lucide/svelte/icons/plus';

	interface Props {
		brand: { name: string; logo: string; subtitle: string; href: string };
		navGroups: readonly ShellNavGroup[];
		pathname: string;
		user?: { name: string; email?: string; role?: string; avatarUrl?: string } | null;
		groupLabel?: (group: ShellNavGroup) => string;
		itemTitle?: (item: ShellNavItem) => string;
		resolveHref?: (href: string) => string;
		onOpenInNewTab?: (href: string) => void | Promise<void>;
		onLogout?: () => void;
		accountMenuItems?: Snippet<[{ closeMobile: () => void }]>;
		openInNewTabLabel?: string;
		guestLabel?: string;
		logoutLabel?: string;
	}

	let {
		brand,
		navGroups,
		pathname,
		user = null,
		groupLabel = (group) => (group.labelKey ? coreI18n.t(group.labelKey) : group.label),
		itemTitle = (item) => (item.titleKey ? coreI18n.t(item.titleKey) : item.title),
		resolveHref = (href) => href,
		onOpenInNewTab,
		onLogout,
		accountMenuItems,
		openInNewTabLabel,
		guestLabel,
		logoutLabel
	}: Props = $props();

	const sidebar = useSidebar();

	const resolvedOpenInNewTab = $derived(openInNewTabLabel ?? coreI18n.t('common.openInNewTab'));
	const resolvedGuest = $derived(guestLabel ?? coreI18n.t('common.guest'));
	const resolvedLogout = $derived(logoutLabel ?? coreI18n.t('common.logout'));

	function isActive(href: string): boolean {
		return pathname === href || pathname.startsWith(href + '/');
	}

	function handleNavClick(): void {
		sidebar.setOpenMobile(false);
	}

	function closeMobile(): void {
		sidebar.setOpenMobile(false);
	}

	// Auto-close mobile sidebar whenever route navigation completes
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		pathname;
		sidebar.setOpenMobile(false);
	});
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href={resolveHref(brand.href)} onclick={handleNavClick} {...props}>
							<div
								class="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-base font-semibold"
							>
								{brand.logo}
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{brand.name}</span>
								<span class="text-sidebar-foreground/80 truncate text-xs">{brand.subtitle}</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		{#each navGroups as group (group.label)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{groupLabel(group)}</Sidebar.GroupLabel>
				<Sidebar.Menu>
					{#each group.items as item (item.href)}
						<Sidebar.MenuItem>
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									{#snippet child({ props: ctxProps })}
										<Sidebar.MenuButton
											isActive={isActive(item.href)}
											tooltipContent={itemTitle(item)}
											class="relative pl-3 transition-colors data-active:text-sidebar-primary data-active:before:absolute data-active:before:inset-y-1.5 data-active:before:left-0 data-active:before:w-0.5 data-active:before:rounded-full data-active:before:bg-sidebar-primary data-active:before:content-['']"
										>
											{#snippet child({ props })}
												<a
													href={resolveHref(item.href)}
													onclick={handleNavClick}
													{...mergeProps(props, ctxProps)}
												>
													<item.icon />
													<span>{itemTitle(item)}</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									{/snippet}
								</ContextMenu.Trigger>
								{#if onOpenInNewTab}
									<ContextMenu.Content>
										<ContextMenu.Item onSelect={() => onOpenInNewTab(item.href)}>
											<Plus class="size-4" />
											{resolvedOpenInNewTab}
										</ContextMenu.Item>
									</ContextMenu.Content>
								{/if}
							</ContextMenu.Root>
							{#if item.badge != null}
								<Sidebar.MenuBadge>{item.badge}</Sidebar.MenuBadge>
							{/if}
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								size="lg"
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								{...props}
							>
								<Avatar.Root class="size-8 rounded-lg">
									{#if user?.avatarUrl}
										<Avatar.Image src={user.avatarUrl} alt={user.name} />
									{/if}
									<Avatar.Fallback class="rounded-lg">
										{user ? initials(user.name) : '?'}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-semibold">{user?.name ?? resolvedGuest}</span>
									<span
										class="text-sidebar-foreground/80 dark:text-muted-foreground truncate text-xs capitalize"
									>
										{user?.role ?? ''}
									</span>
								</div>
								<ChevronsUpDown class="ml-auto size-4" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
						side="right"
						align="end"
						sideOffset={4}
					>
						<DropdownMenu.Label class="p-0 font-normal">
							<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar.Root class="size-8 rounded-lg">
									{#if user?.avatarUrl}
										<Avatar.Image src={user.avatarUrl} alt={user.name} />
									{/if}
									<Avatar.Fallback class="rounded-lg">
										{user ? initials(user.name) : '?'}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-semibold">{user?.name ?? resolvedGuest}</span>
									<span class="text-muted-foreground truncate text-xs">{user?.email ?? ''}</span>
								</div>
							</div>
						</DropdownMenu.Label>
						{#if accountMenuItems}
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								{@render accountMenuItems({ closeMobile })}
							</DropdownMenu.Group>
						{/if}
						{#if onLogout}
							<DropdownMenu.Separator />
							<DropdownMenu.Item variant="destructive" onSelect={onLogout}>
								<LogOut />
								{resolvedLogout}
							</DropdownMenu.Item>
						{/if}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>

	<Sidebar.Rail />
</Sidebar.Root>
