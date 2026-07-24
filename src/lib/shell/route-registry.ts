// Route registry for the keep-alive outlet.
//
// The outlet renders pages itself (instead of via SvelteKit's <slot>/children),
// so it needs to map a pathname to its page component plus the chain of nested
// (app) layouts that wrap it. SvelteKit still runs each route's `load` and keeps
// `page`/`page.data` current; the outlet only takes over *rendering* so pages
// can stay mounted across tab switches.
//
// Lazy globs (not { eager: true }) preserve code-splitting — each route's chunk
// (e.g. charts' ~250kB) loads only when its tab first opens. The (app) layout
// gates rendering on mount, so all of this runs client-side.
import type { Component } from 'svelte';

type Loader = () => Promise<{ default: Component }>;

function pickAppGroup(mods: Record<string, () => Promise<unknown>>): Record<string, Loader> {
	return Object.fromEntries(
		Object.entries(mods).filter(([file]) => file.includes('/(app)/'))
	) as Record<string, Loader>;
}

const PAGES = pickAppGroup(import.meta.glob('/src/routes/**/+page.svelte'));
const LAYOUTS = pickAppGroup(import.meta.glob('/src/routes/**/+layout.svelte'));

function toRouteId(file: string, suffix: string): string {
	const id = file
		.slice('/src/routes'.length, -suffix.length)
		.replace(/\/\([^/]+\)/g, '')
		.replace(/\/$/, '');
	return id === '' ? '/' : id;
}

interface PageRoute {
	load: Loader;
	matcher: RegExp;
	staticDepth: number;
}

const pageRoutes: PageRoute[] = Object.entries(PAGES).map(([file, load]) => {
	const id = toRouteId(file, '/+page.svelte');
	const pattern = id.replace(/\[[^\]]+\]/g, '[^/]+');
	return {
		load,
		matcher: new RegExp(`^${pattern}$`),
		staticDepth: id.split('/').filter((s) => s && !s.startsWith('[')).length
	};
});
pageRoutes.sort((a, b) => b.staticDepth - a.staticDepth);

interface LayoutRoute {
	id: string;
	load: Loader;
}

const layoutRoutes: LayoutRoute[] = Object.entries(LAYOUTS)
	.map(([file, load]) => ({ id: toRouteId(file, '/+layout.svelte'), load }))
	.filter((l) => l.id !== '/');

function resolveChain(pathname: string): Loader[] | null {
	const page = pageRoutes.find((r) => r.matcher.test(pathname));
	if (!page) return null;
	const layouts = layoutRoutes
		.filter((l) => pathname === l.id || pathname.startsWith(l.id + '/'))
		.sort((a, b) => a.id.length - b.id.length);
	return [...layouts.map((l) => l.load), page.load];
}

const cache = new Map<string, Promise<Component[]>>();

export function loadRoute(pathname: string, _revision = 0): Promise<Component[]> {
	let promise = cache.get(pathname);
	if (!promise) {
		const chain = resolveChain(pathname);
		const loading = chain
			? Promise.all(chain.map((load) => load().then((m) => m.default)))
			: Promise.resolve([]);
		promise = loading.catch((error: unknown) => {
			if (cache.get(pathname) === promise) cache.delete(pathname);
			throw error;
		});
		cache.set(pathname, promise);
	}
	return promise;
}

export function invalidateRoute(pathname: string): void {
	cache.delete(pathname);
}
