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
//
// ponytail: layout matching is plain path-prefix. The repo has one nested,
// load-less layout (settings) and one dynamic route (users/[id]); a *dynamic*
// nested layout would need regex matching here — add it then, not now.
import type { Component } from 'svelte';

type Loader = () => Promise<{ default: Component }>;

// import.meta.glob can't name the "(app)" route group directly — picomatch reads
// "(app)" as an extglob and matches nothing. So glob every route, then keep only
// the (app) group by path. (The root redirect and (auth) pages are filtered out.)
function pickAppGroup(mods: Record<string, () => Promise<unknown>>): Record<string, Loader> {
	return Object.fromEntries(
		Object.entries(mods).filter(([file]) => file.includes('/(app)/'))
	) as Record<string, Loader>;
}

const PAGES = pickAppGroup(import.meta.glob('/src/routes/**/+page.svelte'));
const LAYOUTS = pickAppGroup(import.meta.glob('/src/routes/**/+layout.svelte'));

// '/src/routes/(app)/users/[id]/+page.svelte' -> '/users/[id]'
// Route groups like '(app)' never appear in the URL, so strip them.
function toRouteId(file: string, suffix: string): string {
	const id = file
		.slice('/src/routes'.length, -suffix.length)
		.replace(/\/\([^/]+\)/g, '') // drop (group) segments
		.replace(/\/$/, ''); // drop trailing slash
	return id === '' ? '/' : id;
}

interface PageRoute {
	load: Loader;
	matcher: RegExp;
	staticDepth: number;
}

const pageRoutes: PageRoute[] = Object.entries(PAGES).map(([file, load]) => {
	const id = toRouteId(file, '/+page.svelte');
	const pattern = id.replace(/\[[^\]]+\]/g, '[^/]+'); // [id] -> one path segment
	return {
		load,
		matcher: new RegExp(`^${pattern}$`),
		staticDepth: id.split('/').filter((s) => s && !s.startsWith('[')).length
	};
});
// More-specific (more static segments) routes win over dynamic ones.
pageRoutes.sort((a, b) => b.staticDepth - a.staticDepth);

interface LayoutRoute {
	id: string;
	load: Loader;
}

// Exclude the (app) root layout — that's the AppShell host, already rendered.
const layoutRoutes: LayoutRoute[] = Object.entries(LAYOUTS)
	.map(([file, load]) => ({ id: toRouteId(file, '/+layout.svelte'), load }))
	.filter((l) => l.id !== '/');

/** Loaders for a pathname's layout chain (outermost first) + its page, or null. */
function resolveChain(pathname: string): Loader[] | null {
	const page = pageRoutes.find((r) => r.matcher.test(pathname));
	if (!page) return null;
	const layouts = layoutRoutes
		.filter((l) => pathname === l.id || pathname.startsWith(l.id + '/'))
		.sort((a, b) => a.id.length - b.id.length);
	return [...layouts.map((l) => l.load), page.load];
}

const cache = new Map<string, Promise<Component[]>>();

/**
 * Resolve a pathname to its rendered component chain ([...layouts, page]).
 * Cached per pathname so switching back to a tab reuses the loaded modules and
 * never re-triggers the {#await} that hosts the mounted page.
 */
export function loadRoute(pathname: string): Promise<Component[]> {
	let promise = cache.get(pathname);
	if (!promise) {
		const chain = resolveChain(pathname);
		promise = chain
			? Promise.all(chain.map((load) => load().then((m) => m.default)))
			: Promise.resolve([]);
		cache.set(pathname, promise);
	}
	return promise;
}
