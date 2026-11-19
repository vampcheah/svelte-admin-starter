import { demoEmails, type Email } from '#lib/data/inbox.ts';

export type InboxFilter = 'all' | 'unread';

/** One inbox per mounted page, including its filters and unfinished reply. */
export class InboxState {
	emails = $state<Email[]>([]);
	selectedId = $state<string | null>(null);
	search = $state('');
	filter = $state<InboxFilter>('all');
	replyText = $state('');

	constructor(initial: readonly Email[] = demoEmails) {
		this.emails = initial.map((email) => ({
			...email,
			from: { ...email.from },
			body: [...email.body]
		}));
		this.selectedId = this.emails[0]?.id ?? null;
	}

	get unreadCount(): number {
		return this.emails.filter((email) => !email.read).length;
	}

	get visibleEmails(): Email[] {
		const query = this.search.trim().toLowerCase();
		return this.emails.filter((email) => {
			if (this.filter === 'unread' && email.read) return false;
			return (
				!query ||
				[email.from.name, email.subject, email.preview].some((value) =>
					value.toLowerCase().includes(query)
				)
			);
		});
	}

	get selected(): Email | null {
		return this.emails.find((email) => email.id === this.selectedId) ?? null;
	}

	select(id: string): void {
		const email = this.emails.find((email) => email.id === id);
		if (!email) return;
		this.selectedId = id;
		this.replyText = '';
		email.read = true;
	}

	toggleStar(id: string): void {
		const email = this.emails.find((email) => email.id === id);
		if (email) email.starred = !email.starred;
	}
}
