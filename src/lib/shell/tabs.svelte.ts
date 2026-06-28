// Multi-tab navigation state for the admin shell.
//
// Tabs are keyed by pathname. Every navigation (sidebar, command menu, link,
// deep link) opens or focuses a tab — wired once in AppShell via afterNavigate,
// so there is no per-link plumbing. Each open tab's page component stays mounted
// in KeepAliveOutlet (hidden when inactive), so all page state survives switches.
//
// ponytail: in-memory only — a reload rebuilds the bar from the current route.
// Add sessionStorage (store hrefs, re-resolve icons) if reload-persist is wanted.
import type { Component } from 'svelte';
import type { Pathname } from '$app/types';
import FileIcon from '@lucide/svelte/icons/file';
import { findNavItem } from './nav';

export interface Tab {
	href: Pathname;
	title: string;
	icon: Component;
}

function titleCase(seg: string): string {
	return seg
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

/** Best-effort title: page-supplied breadcrumb > exact nav title > last segment. */
function labelFor(pathname: string, data?: unknown): string {
	const bc = (data as { breadcrumb?: unknown } | undefined)?.breadcrumb;
	if (typeof bc === 'string' && bc.trim()) return bc;
	const match = findNavItem(pathname);
	if (match && match.item.href === pathname) return match.item.title;
	const seg = pathname.split('/').filter(Boolean).pop();
	return seg ? titleCase(seg) : 'Untitled';
}

function iconFor(pathname: string): Component {
	return findNavItem(pathname)?.item.icon ?? FileIcon;
}

class Tabs {
	items = $state<Tab[]>([]);
	active = $state<Pathname | ''>('');

	/** Open or focus the tab for `pathname`. Called from afterNavigate. */
	open(pathname: Pathname, data?: unknown): void {
		this.active = pathname;
		const existing = this.items.find((t) => t.href === pathname);
		if (existing) {
			// Refresh the title once async load data (e.g. a breadcrumb name) arrives.
			existing.title = labelFor(pathname, data);
			return;
		}
		this.items.push({ href: pathname, title: labelFor(pathname, data), icon: iconFor(pathname) });
	}

	/**
	 * Close a tab. Returns the pathname to navigate to when the active tab was
	 * closed (caller does the goto), otherwise null.
	 */
	close(pathname: Pathname): Pathname | null {
		const i = this.items.findIndex((t) => t.href === pathname);
		if (i === -1) return null;
		const wasActive = this.active === pathname;
		// Closing the sole home tab is a no-op: afterNavigate would just reopen it,
		// so splicing only causes a flicker + needless remount.
		if (wasActive && this.items.length === 1 && pathname === '/dashboard') return null;
		this.items.splice(i, 1);
		// Removing the item unmounts its (kept-alive) page instance — closing a tab
		// discards its state, which is the expected behaviour.
		if (!wasActive) return null;
		const next = this.items[i] ?? this.items[i - 1];
		const target: Pathname = next?.href ?? '/dashboard';
		this.active = target;
		return target;
	}

	/** Clear every tab — call on logout so a new session starts clean. */
	reset(): void {
		this.items = [];
		this.active = '';
	}
}

export const tabs = new Tabs();
