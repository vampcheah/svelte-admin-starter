import { resolve } from '$app/paths';
import type { Path } from '$app/types';

export type AppPathname = `/${Path}`;

function getBasePath(): string {
	return resolve('/').replace(/\/$/, '');
}

/** Keep portable tab and navigation paths relative to the application's base. */
export function toAppPathname(pathname: string, basePath = getBasePath()): string {
	if (basePath && pathname === basePath) return '/';
	return basePath && pathname.startsWith(`${basePath}/`)
		? pathname.slice(basePath.length)
		: pathname;
}

export function toAppUrl(url: Pick<URL, 'pathname' | 'search'>, basePath = getBasePath()): string {
	return `${toAppPathname(url.pathname, basePath)}${url.search}`;
}

/** Resolve a stored app-relative tab URL, preserving its query and fragment. */
export function resolveAppUrl(url: string): string {
	const suffixAt = url.search(/[?#]/);
	const pathname = suffixAt === -1 ? url : url.slice(0, suffixAt);
	const path = pathname.replace(/^\//, '') as Path;
	// Kit's argument tuples distribute across route unions; this is a concrete
	// path, so it needs the single-argument branch rather than route params.
	const resolved = path === '' ? resolve('/') : resolve(...([path] as Parameters<typeof resolve>));
	return `${resolved}${suffixAt === -1 ? '' : url.slice(suffixAt)}`;
}
