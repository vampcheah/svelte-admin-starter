import { describe, expect, it } from 'vitest';
import { demoEmails } from '#lib/data/inbox.ts';
import { InboxState } from './state.svelte';

describe('inbox state', () => {
	it('combines trimmed case-insensitive search and unread filtering', () => {
		const inbox = new InboxState();
		inbox.search = '  PRIYA  ';
		inbox.filter = 'unread';
		expect(inbox.visibleEmails.map((email) => email.id)).toEqual(['m1']);
		inbox.search = 'roadmap';
		expect(inbox.visibleEmails.map((email) => email.id)).toEqual(['m1']);
		inbox.search = 'before Friday';
		expect(inbox.visibleEmails.map((email) => email.id)).toEqual(['m1']);
		inbox.select('m1');
		expect(inbox.visibleEmails).toEqual([]);
		expect(inbox.selected?.id).toBe('m1');
		inbox.filter = 'all';
		expect(inbox.visibleEmails).toHaveLength(1);
	});

	it('changes selection and marks read without leaking state to other tabs or fixtures', () => {
		const before = structuredClone(demoEmails);
		const first = new InboxState();
		const second = new InboxState();
		const unread = first.unreadCount;
		first.replyText = 'Unfinished reply';
		first.select('m2');
		expect(first.selected?.read).toBe(true);
		expect(first.unreadCount).toBe(unread - 1);
		expect(first.replyText).toBe('');
		first.selected!.body.push('Local paragraph');
		first.selected!.from.name = 'Local sender';
		expect(second.emails).toEqual(before);
		expect(demoEmails).toEqual(before);
	});

	it('stars a message without selecting it, marking it read, or discarding the reply', () => {
		const inbox = new InboxState();
		inbox.replyText = 'Keep this draft';
		inbox.toggleStar('m2');
		expect(inbox.selectedId).toBe('m1');
		expect(inbox.emails.find((email) => email.id === 'm2')).toMatchObject({
			starred: true,
			read: false
		});
		expect(inbox.replyText).toBe('Keep this draft');
		inbox.toggleStar('m2');
		expect(inbox.emails.find((email) => email.id === 'm2')?.starred).toBe(false);
		inbox.select('missing');
		inbox.toggleStar('missing');
		expect(inbox.selectedId).toBe('m1');
		expect(inbox.replyText).toBe('Keep this draft');
	});

	it('supports an empty inbox', () => {
		const inbox = new InboxState([]);
		expect(inbox.selected).toBeNull();
		expect(inbox.visibleEmails).toEqual([]);
		expect(inbox.unreadCount).toBe(0);
	});
});
