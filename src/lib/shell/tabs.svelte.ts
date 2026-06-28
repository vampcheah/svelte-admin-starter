// Multi-tab navigation state for the admin shell.
//
// Tabs carry a unique id, so the SAME route can be open in several tabs at once
// (right-click a sidebar item → "Open in new tab"). Ordinary navigation (sidebar,
// command menu, link, deep link) reuses a tab — wired once in AppShell via
// afterNavigate. Each open tab's page component stays mounted in KeepAliveOutlet
// (hidden when inactive), so all page state survives switches.
//
// ponytail: in-memory only — a reload rebuilds the bar from the current route.
// Add sessionStorage (store hrefs, re-resolve icons) if reload-persist is wanted.
import type { Component } from 'svelte';
import type { Pathname } from '$app/types';
import FileIcon from '@lucide/svelte/icons/file';
import { findNavItem } from './nav';

export interface Tab {
	id: string; // unique per instance — the same route can be open in several tabs
	href: Pathname; // route pathname (may repeat across tabs)
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
	active = $state(''); // active tab id
	#seq = 0;

	#add(pathname: Pathname, data?: unknown): string {
		const id = `${pathname}#${this.#seq++}`;
		this.items.push({
			id,
			href: pathname,
			title: labelFor(pathname, data),
			icon: iconFor(pathname)
		});
		this.active = id;
		return id;
	}

	/**
	 * afterNavigate handler: keep the active tab if it already shows this route,
	 * else focus an existing tab for the route, else open a new one. Ordinary
	 * navigation reuses a tab — duplicates are created only via openNew().
	 */
	open(pathname: Pathname, data?: unknown): void {
		const current = this.items.find((t) => t.id === this.active);
		if (current && current.href === pathname) {
			// Refresh the title once async load data (e.g. a breadcrumb name) arrives.
			current.title = labelFor(pathname, data);
			return;
		}
		const existing = this.items.find((t) => t.href === pathname);
		if (existing) {
			existing.title = labelFor(pathname, data);
			this.active = existing.id;
			return;
		}
		this.#add(pathname, data);
	}

	/** Open a NEW independent tab for this route, even if one is already open. */
	openNew(pathname: Pathname, data?: unknown): string {
		return this.#add(pathname, data);
	}

	/**
	 * Close a tab by id. Returns the pathname to navigate to when the active tab
	 * was closed (the caller navigates only if it differs from the current URL),
	 * otherwise null.
	 */
	close(id: string): Pathname | null {
		const i = this.items.findIndex((t) => t.id === id);
		if (i === -1) return null;
		const wasActive = this.active === id;
		// Closing the sole home tab is a no-op: afterNavigate would just reopen it.
		if (wasActive && this.items.length === 1 && this.items[0]?.href === '/dashboard') return null;
		this.items.splice(i, 1);
		// Removing the item unmounts its (kept-alive) page instance — closing a tab
		// discards its state, which is the expected behaviour.
		if (!wasActive) return null;
		const next = this.items[i] ?? this.items[i - 1];
		this.active = next?.id ?? '';
		return next?.href ?? '/dashboard';
	}

	/** Clear every tab — call on logout so a new session starts clean. */
	reset(): void {
		this.items = [];
		this.active = '';
	}
}

export const tabs = new Tabs();
