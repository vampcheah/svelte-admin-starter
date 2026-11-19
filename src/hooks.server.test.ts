import type { RequestEvent } from '@sveltejs/kit';
import type { ResolveOptions } from '@sveltejs/kit/hooks';
import { describe, expect, it, vi } from 'vitest';
import { handle } from './hooks.server';

vi.mock('#lib/config/index.ts', () => ({ config: { i18n: { defaultLocale: 'zh-CN' } } }));

describe('server locale', () => {
	it('renders the configured default before a client preference is available', async () => {
		const event = {} as RequestEvent;
		const resolve = vi.fn(async (_event: RequestEvent, options?: ResolveOptions) => {
			const html = await options?.transformPageChunk?.({
				html: '<html lang="%app.locale%"><body>Page</body></html>',
				done: true
			});
			return new Response(html);
		});
		const response = await handle({ event, resolve });
		expect(await response.text()).toBe('<html lang="zh-CN"><body>Page</body></html>');
	});
});
