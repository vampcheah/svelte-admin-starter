// Multi-tab navigation state for the admin shell.
//
// Tabs carry a unique id, so the SAME route can be open in several tabs at once
// (right-click a sidebar item → "Open in new tab"). Ordinary navigation (sidebar,
// command menu, link, deep link) reuses a tab — wired once in AppShell via
// afterNavigate. Each open tab's page component stays mounted in KeepAliveOutlet
// (hidden when inactive), so all page state survives switches.
import type { Component } from 'svelte';
import type { Pathname } from '$app/types';
import FileIcon from '@lucide/svelte/icons/file';
import { t } from '$lib/i18n';
import { confirm } from '$lib/confirm.svelte';
import { leafCrumb } from './breadcrumb.svelte';
import { findNavItem } from './nav';

export interface Tab {
	id: string; // unique per instance — the same route can be open in several tabs
	href: Pathname; // route pathname (may repeat across tabs)
	url: string; // pathname + search; query variants are independent tabs
	title: string;
	baseTitle: string;
	icon: Component;
	revision: number; // increment to remount only this kept-alive page instance
}

export const TAB_SOFT_LIMIT = 20;

function titleCase(seg: string): string {
	return seg
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

/** Best-effort base title before a translated detail prefix is applied. */
function baseLabelFor(pathname: string, data?: unknown): string {
	const clientLabel = leafCrumb.get(pathname);
	if (clientLabel) return clientLabel;
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

	get atSoftLimit(): boolean {
		return this.items.length >= TAB_SOFT_LIMIT;
	}

	async confirmOverflow(): Promise<boolean> {
		if (!this.atSoftLimit) return true;
		return confirm({
			title: t('common.tabLimitTitle'),
			description: t('common.tabLimitDescription', { count: TAB_SOFT_LIMIT }),
			highlights: [String(TAB_SOFT_LIMIT)],
			confirmText: t('common.forceContinue'),
			cancelText: t('common.cancel')
		});
	}

	#add(pathname: Pathname, data?: unknown, url: string = pathname): string {
		const id = `${url}#${this.#seq++}`;
		const baseTitle = baseLabelFor(pathname, data);
		this.items.push({
			id,
			href: pathname,
			url,
			title: baseTitle,
			baseTitle,
			icon: iconFor(pathname),
			revision: 0
		});
		this.active = id;
		return id;
	}

	/**
	 * afterNavigate handler: keep the active tab if it already shows this route,
	 * else focus an existing tab for the route, else open a new one. Ordinary
	 * navigation reuses a tab — duplicates are created only via openNew().
	 */
	open(pathname: Pathname, data?: unknown, url: string = pathname, allowOverflow = false): boolean {
		const current = this.items.find((t) => t.id === this.active);
		if (current && current.url === url) {
			current.baseTitle = baseLabelFor(pathname, data);
			current.title = current.baseTitle;
			return true;
		}
		const existing = this.items.find((t) => t.url === url);
		if (existing) {
			existing.baseTitle = baseLabelFor(pathname, data);
			existing.title = existing.baseTitle;
			this.active = existing.id;
			return true;
		}
		if (this.atSoftLimit && !allowOverflow) return false;
		this.#add(pathname, data, url);
		return true;
	}

	/** Open a NEW independent tab for this route, even if one is already open. */
	openNew(
		pathname: Pathname,
		data?: unknown,
		url: string = pathname,
		allowOverflow = false
	): string | null {
		if (this.atSoftLimit && !allowOverflow) return null;
		return this.#add(pathname, data, url);
	}

	/** Update labels for client-loaded detail tabs once their friendly title is available. */
	rename(pathname: string, title: string): void {
		for (const tab of this.items) {
			if (tab.href === pathname) {
				tab.baseTitle = title;
				tab.title = title;
			}
		}
	}

	/** Rebuild translated labels. */
	refreshTitles(): void {
		for (const tab of this.items) {
			const clientLabel = leafCrumb.get(tab.href);
			const match = findNavItem(tab.href);
			if (clientLabel) tab.baseTitle = clientLabel;
			else if (match && match.item.href === tab.href) tab.baseTitle = match.item.title;
			tab.title = tab.baseTitle;
		}
	}

	/** Duplicate an existing tab beside it and focus the new independent instance. */
	clone(id: string, allowOverflow = false): Tab | null {
		if (this.atSoftLimit && !allowOverflow) return null;
		const index = this.items.findIndex((tab) => tab.id === id);
		const source = this.items[index];
		if (!source) return null;

		const cloned: Tab = {
			...source,
			id: `${source.href}#${this.#seq++}`
		};
		this.items.splice(index + 1, 0, cloned);
		this.active = cloned.id;
		return cloned;
	}

	/** Remount one kept-alive page instance without disturbing any other open tab. */
	refresh(id: string): boolean {
		const tab = this.items.find((item) => item.id === id);
		if (!tab) return false;
		tab.revision = (tab.revision ?? 0) + 1;
		return true;
	}

	/** Move one open tab before or after another without recreating either instance. */
	move(id: string, targetId: string, after = false): void {
		if (id === targetId) return;
		const from = this.items.findIndex((tab) => tab.id === id);
		if (from === -1 || !this.items.some((tab) => tab.id === targetId)) return;

		const [moved] = this.items.splice(from, 1);
		if (!moved) return;
		const target = this.items.findIndex((tab) => tab.id === targetId);
		this.items.splice(target + (after ? 1 : 0), 0, moved);
	}

	/**
	 * Close a tab by id. Returns the url to navigate to when the active tab
	 * was closed, otherwise null.
	 */
	close(id: string): string | null {
		const i = this.items.findIndex((t) => t.id === id);
		if (i === -1) return null;
		const wasActive = this.active === id;
		if (wasActive && this.items.length === 1 && this.items[0]?.href === '/dashboard') return null;
		this.items.splice(i, 1);
		if (!wasActive) return null;
		const next = this.items[i] ?? this.items[i - 1];
		this.active = next?.id ?? '';
		return next?.url ?? '/dashboard';
	}

	/** Discard every kept-alive instance for a route. */
	discardRoute(pathname: Pathname): void {
		const activeWasDiscarded = this.items.some(
			(tab) => tab.id === this.active && tab.href === pathname
		);
		this.items = this.items.filter((tab) => tab.href !== pathname);
		if (activeWasDiscarded) this.active = this.items.at(-1)?.id ?? '';
	}

	/** Close every tab except the selected one and focus it. */
	closeOthers(id: string): string | null {
		const selected = this.items.find((tab) => tab.id === id);
		if (!selected || this.items.length === 1) return null;
		this.items = [selected];
		this.active = selected.id;
		return selected.url;
	}

	/** Close all tabs to the left of the selected one. */
	closeLeft(id: string): string | null {
		const index = this.items.findIndex((tab) => tab.id === id);
		if (index <= 0) return null;
		const activeWasClosed = this.items.slice(0, index).some((tab) => tab.id === this.active);
		const selected = this.items[index];
		this.items = this.items.slice(index);
		if (!activeWasClosed || !selected) return null;
		this.active = selected.id;
		return selected.url;
	}

	/** Close all tabs to the right of the selected one. */
	closeRight(id: string): string | null {
		const index = this.items.findIndex((tab) => tab.id === id);
		if (index === -1 || index === this.items.length - 1) return null;
		const activeWasClosed = this.items.slice(index + 1).some((tab) => tab.id === this.active);
		const selected = this.items[index];
		this.items = this.items.slice(0, index + 1);
		if (!activeWasClosed || !selected) return null;
		this.active = selected.id;
		return selected.url;
	}

	/** Close every page tab and leave one focused Dashboard tab as the shell fallback. */
	closeAll(): string {
		const home =
			this.items.find((tab) => tab.id === this.active && tab.href === '/dashboard') ??
			this.items.find((tab) => tab.href === '/dashboard');

		if (home) {
			this.items = [home];
			this.active = home.id;
		} else {
			this.items = [];
			this.#add('/dashboard');
		}
		return '/dashboard';
	}

	/** Clear every tab — call on logout so a new session starts clean. */
	reset(): void {
		this.items = [];
		this.active = '';
	}
}

export const tabs = new Tabs();
