import type { Component } from 'svelte';

type ModuleLoader = () => Promise<unknown>;
type Loader = () => Promise<{ default: Component }>;
type Modules = Record<string, ModuleLoader>;

function pickAppGroup(modules: Modules): Record<string, Loader> {
	return Object.fromEntries(
		Object.entries(modules).filter(([file]) => file.includes('/(app)/'))
	) as Record<string, Loader>;
}

export function toRouteId(file: string, suffix: string): string {
	const id = file
		.slice('/src/routes'.length, -suffix.length)
		.replace(/\/\([^/]+\)/g, '')
		.replace(/\/$/, '');
	return id === '' ? '/' : id;
}

export function assertSupportedLayouts(files: string[]): void {
	const dynamic = files
		.map((file) => toRouteId(file, '/+layout.svelte'))
		.find((id) => id !== '/' && id.includes('['));
	if (dynamic)
		throw new Error(`Admin keep-alive does not support dynamic nested layout: ${dynamic}`);
}

export function createRouteRegistry(pageModules: Modules, layoutModules: Modules) {
	const pages = pickAppGroup(pageModules);
	const layouts = pickAppGroup(layoutModules);
	assertSupportedLayouts(Object.keys(layouts));

	const pageRoutes = Object.entries(pages).map(([file, load]) => {
		const id = toRouteId(file, '/+page.svelte');
		const pattern = id.replace(/\[[^\]]+\]/g, '[^/]+');
		return {
			load,
			matcher: new RegExp(`^${pattern}$`),
			staticDepth: id.split('/').filter((segment) => segment && !segment.startsWith('[')).length
		};
	});
	pageRoutes.sort((left, right) => right.staticDepth - left.staticDepth);

	const layoutRoutes = Object.entries(layouts)
		.map(([file, load]) => ({ id: toRouteId(file, '/+layout.svelte'), load }))
		.filter((layout) => layout.id !== '/');

	function resolveChain(pathname: string): Loader[] | null {
		const page = pageRoutes.find((route) => route.matcher.test(pathname));
		if (!page) return null;
		const matchingLayouts = layoutRoutes
			.filter((layout) => pathname === layout.id || pathname.startsWith(`${layout.id}/`))
			.sort((left, right) => left.id.length - right.id.length);
		return [...matchingLayouts.map((layout) => layout.load), page.load];
	}

	const cache = new Map<string, Promise<Component[]>>();
	function loadRoute(pathname: string, _revision = 0): Promise<Component[]> {
		let promise = cache.get(pathname);
		if (!promise) {
			const chain = resolveChain(pathname);
			const loading = chain
				? Promise.all(chain.map((load) => load().then((module) => module.default)))
				: Promise.resolve([]);
			promise = loading.catch((error: unknown) => {
				if (cache.get(pathname) === promise) cache.delete(pathname);
				throw error;
			});
			cache.set(pathname, promise);
		}
		return promise;
	}

	return {
		resolveChain,
		loadRoute,
		invalidateRoute(pathname: string) {
			cache.delete(pathname);
		}
	};
}
