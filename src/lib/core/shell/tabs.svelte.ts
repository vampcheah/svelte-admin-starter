// Portable multi-tab state. Applications provide titles, icons, confirmation,
// and the home route; every operation that can create a tab shares one limit guard.
import type { Component } from 'svelte';
import FileIcon from '@lucide/svelte/icons/file';

export interface Tab {
	id: string;
	href: string;
	url: string;
	title: string;
	baseTitle: string;
	icon: Component;
	data?: unknown;
	revision: number;
}

export interface TabDescriptor {
	title: string;
	baseTitle?: string;
	icon?: Component;
}

export interface TabsOptions {
	homePathname: string;
	describe: (pathname: string, data?: unknown, baseTitle?: string) => TabDescriptor;
	confirmOverflow: (limit: number) => Promise<boolean>;
	softLimit?: number;
}

export const TAB_SOFT_LIMIT = 20;

export class Tabs {
	items = $state<Tab[]>([]);
	active = $state('');
	readonly homePathname: string;
	readonly softLimit: number;
	#seq = 0;
	#describe: TabsOptions['describe'];
	#confirmOverflow: TabsOptions['confirmOverflow'];

	constructor(options: TabsOptions) {
		this.homePathname = options.homePathname;
		this.softLimit = options.softLimit ?? TAB_SOFT_LIMIT;
		this.#describe = options.describe;
		this.#confirmOverflow = options.confirmOverflow;
	}

	get activeTab(): Tab | undefined {
		return this.items.find((tab) => tab.id === this.active);
	}

	get atSoftLimit(): boolean {
		return this.items.length >= this.softLimit;
	}

	async #allowNewTab(): Promise<boolean> {
		return !this.atSoftLimit || this.#confirmOverflow(this.softLimit);
	}

	#update(tab: Tab, data?: unknown, baseTitle?: string): void {
		const descriptor = this.#describe(tab.href, data, baseTitle);
		tab.data = data;
		tab.baseTitle = descriptor.baseTitle ?? descriptor.title;
		tab.title = descriptor.title;
		tab.icon = descriptor.icon ?? FileIcon;
	}

	#add(pathname: string, data?: unknown, url: string = pathname): string {
		const id = `${url}#${this.#seq++}`;
		const descriptor = this.#describe(pathname, data);
		this.items.push({
			id,
			href: pathname,
			url,
			title: descriptor.title,
			baseTitle: descriptor.baseTitle ?? descriptor.title,
			icon: descriptor.icon ?? FileIcon,
			data,
			revision: 0
		});
		this.active = id;
		return id;
	}

	/** Focus an existing URL or open it after the shared overflow confirmation. */
	async open(pathname: string, data?: unknown, url: string = pathname): Promise<boolean> {
		const current = this.activeTab;
		if (current?.url === url) {
			this.#update(current, data);
			return true;
		}
		const existing = this.items.find((tab) => tab.url === url);
		if (existing) {
			this.#update(existing, data);
			this.active = existing.id;
			return true;
		}
		if (!(await this.#allowNewTab())) return false;
		this.#add(pathname, data, url);
		return true;
	}

	/** Open a new independent tab, even when the URL already exists. */
	async openNew(pathname: string, data?: unknown, url: string = pathname): Promise<string | null> {
		if (!(await this.#allowNewTab())) return null;
		return this.#add(pathname, data, url);
	}

	/** Duplicate an existing tab beside it. */
	async clone(id: string): Promise<Tab | null> {
		const index = this.items.findIndex((tab) => tab.id === id);
		const source = this.items[index];
		if (!source || !(await this.#allowNewTab())) return null;
		const cloned = { ...source, id: `${source.url}#${this.#seq++}` };
		this.items.splice(index + 1, 0, cloned);
		this.active = cloned.id;
		return cloned;
	}

	rename(pathname: string, title: string): void {
		for (const tab of this.items) {
			if (tab.href === pathname) this.#update(tab, tab.data, title);
		}
	}

	refreshTitles(): void {
		for (const tab of this.items) this.#update(tab, tab.data);
	}

	refresh(id: string): boolean {
		const tab = this.items.find((item) => item.id === id);
		if (!tab) return false;
		tab.revision += 1;
		return true;
	}

	move(id: string, targetId: string, after = false): void {
		if (id === targetId) return;
		const from = this.items.findIndex((tab) => tab.id === id);
		if (from === -1 || !this.items.some((tab) => tab.id === targetId)) return;
		const [moved] = this.items.splice(from, 1);
		if (!moved) return;
		const target = this.items.findIndex((tab) => tab.id === targetId);
		this.items.splice(target + (after ? 1 : 0), 0, moved);
	}

	close(id: string): string | null {
		const index = this.items.findIndex((tab) => tab.id === id);
		if (index === -1) return null;
		const wasActive = this.active === id;
		if (wasActive && this.items.length === 1 && this.items[0]?.href === this.homePathname) {
			return null;
		}
		this.items.splice(index, 1);
		if (!wasActive) return null;
		const next = this.items[index] ?? this.items[index - 1];
		this.active = next?.id ?? '';
		return next?.url ?? this.homePathname;
	}

	discardRoute(pathname: string): void {
		const activeWasDiscarded = this.items.some(
			(tab) => tab.id === this.active && tab.href === pathname
		);
		this.items = this.items.filter((tab) => tab.href !== pathname);
		if (activeWasDiscarded) this.active = this.items.at(-1)?.id ?? '';
	}

	retain(allowed: (tab: Tab) => boolean): void {
		const kept = this.items.filter(allowed);
		if (kept.length === this.items.length) return;
		const activeStillExists = kept.some((tab) => tab.id === this.active);
		this.items = kept;
		if (!activeStillExists) this.active = kept.at(-1)?.id ?? '';
	}

	closeOthers(id: string): string | null {
		const selected = this.items.find((tab) => tab.id === id);
		if (!selected || this.items.length === 1) return null;
		this.items = [selected];
		this.active = selected.id;
		return selected.url;
	}

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

	closeAll(): string {
		const home =
			this.items.find((tab) => tab.id === this.active && tab.href === this.homePathname) ??
			this.items.find((tab) => tab.href === this.homePathname);
		if (home) {
			this.items = [home];
			this.active = home.id;
		} else {
			this.items = [];
			this.#add(this.homePathname);
		}
		return this.homePathname;
	}

	reset(): void {
		this.items = [];
		this.active = '';
	}
}

/** Register a landed SvelteKit route and restore the previous URL when cancelled. */
export async function openLandedRoute(
	tabs: Tabs,
	pathname: string,
	data: unknown,
	url: string,
	restore: (url: string) => void | Promise<void>
): Promise<boolean> {
	const fallback = tabs.activeTab;
	if (await tabs.open(pathname, data, url)) return true;
	if (fallback && fallback.url !== url) await restore(fallback.url);
	return false;
}
