import { createRouteRegistry } from '$lib/core/shell/route-registry';

const registry = createRouteRegistry(
	import.meta.glob('/src/routes/**/+page.svelte'),
	import.meta.glob(['/src/routes/**/+layout.svelte', '!/src/routes/(app)/+layout.svelte'])
);

export const { loadRoute, invalidateRoute } = registry;
export { assertSupportedLayouts, toRouteId } from '$lib/core/shell/route-registry';
