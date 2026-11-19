import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { demoEmails } from '#lib/data/inbox.ts';
import MessageList from './MessageList.svelte';

describe('message list controls', () => {
	it('renders separate native selection and star buttons with independent pressed states', () => {
		const html = render(MessageList, {
			props: {
				emails: [demoEmails[1]!],
				selectedId: 'm1',
				unreadCount: 1,
				onSelect: () => {},
				onToggleStar: () => {}
			}
		}).body;
		const row = html.match(/<li\b[^>]*>([\s\S]*?)<\/li>/)?.[1] ?? '';
		const buttons = [...row.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)];
		expect(buttons).toHaveLength(2);
		expect(buttons[0]![0]).toContain('aria-pressed="false"');
		expect(buttons[1]![0]).toContain('aria-label="Star message"');
		expect(buttons[1]![0]).toContain('aria-pressed="false"');
		for (const [button] of buttons) {
			expect(button.match(/<button\b/g)).toHaveLength(1);
			expect(button).not.toContain('role="button"');
		}
	});
});
