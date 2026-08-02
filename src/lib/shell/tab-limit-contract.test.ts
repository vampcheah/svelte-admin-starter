import { describe, expect, it } from 'vitest';
import appShellSource from './AppShell.svelte?raw';
import appSidebarSource from './AppSidebar.svelte?raw';

describe('tab soft limit', () => {
	it('confirms every navigation path that can exceed the limit', () => {
		expect(appShellSource).toContain('await openLandedRoute(tabs, pathname, page.data, url');
		expect(appShellSource).toContain('page.url.search');
		expect(appShellSource).toContain('replaceState: true');
		expect(appSidebarSource).toContain('if (!(await tabs.openNew(href))) return;');
	});
});
