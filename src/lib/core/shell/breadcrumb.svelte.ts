// Client-loaded detail pages can provide a friendly breadcrumb label. Labels
// are keyed by pathname so kept-alive tabs cannot overwrite one another.
import { SvelteMap } from 'svelte/reactivity';

class LeafCrumbs {
	#labels = new SvelteMap<string, string>();

	get(pathname: string): string | null {
		return this.#labels.get(pathname) ?? null;
	}

	set(pathname: string, label: string): void {
		this.#labels.set(pathname, label);
	}
}

export const leafCrumb = new LeafCrumbs();
