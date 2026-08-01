import { describe, expect, it } from 'vitest';
import appShellSource from './AppShell.svelte?raw';
import appSidebarSource from './AppSidebar.svelte?raw';

describe('tab soft limit', () => {
	it('confirms every navigation path that can exceed the limit', () => {
		expect(appShellSource).toContain('if (tabs.open(pathname, page.data)) return;');
		expect(appShellSource).toContain('if (await tabs.confirmOverflow())');
		expect(appShellSource).toContain('tabs.open(pathname, page.data, pathname, true);');
		expect(appShellSource).toContain('replaceState: true');
		expect(appSidebarSource).toContain('if (!(await tabs.confirmOverflow())) return;');
		expect(appSidebarSource).toContain('tabs.openNew(href, undefined, href, true);');
	});
});
