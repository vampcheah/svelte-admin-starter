import { getContext } from 'svelte';
import { demoUsers, type DemoUser } from '#lib/data/users.ts';

export type UserDraft = Pick<DemoUser, 'name' | 'email' | 'role' | 'status'>;

/** One directory per app layout: shared by its tabs, never by server requests. */
export const USERS_STATE = Symbol('demo-users-state');

export class UsersState {
	#records = $state<DemoUser[]>([]);

	constructor(initial: readonly DemoUser[] = demoUsers) {
		this.#records = initial.map((user) => ({ ...user }));
	}

	get records(): DemoUser[] {
		return this.#records;
	}

	find(id: string | undefined): DemoUser | undefined {
		return this.#records.find((user) => user.id === id);
	}

	create(draft: UserDraft): DemoUser {
		const user: DemoUser = {
			...draft,
			id: `usr_${crypto.randomUUID()}`,
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- One-time creation timestamp.
			createdAt: new Date().toISOString().slice(0, 10)
		};
		this.#records = [user, ...this.#records];
		return user;
	}

	update(id: string, draft: UserDraft): DemoUser | undefined {
		const current = this.find(id);
		if (!current) return undefined;
		const updated: DemoUser = {
			...current,
			name: draft.name,
			email: draft.email,
			role: draft.role,
			status: draft.status
		};
		this.#records = this.#records.map((user) => (user.id === id ? updated : user));
		return updated;
	}

	remove(id: string): boolean {
		return this.removeMany([id]) > 0;
	}

	removeMany(ids: Iterable<string | number>): number {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Transient lookup; the record array is reactive.
		const removed = new Set(ids);
		const count = this.#records.length;
		this.#records = this.#records.filter((user) => !removed.has(user.id));
		return count - this.#records.length;
	}
}

export function createUsersState(initial?: readonly DemoUser[]): UsersState {
	return new UsersState(initial);
}

/** Consume the directory created by the persistent authenticated app layout. */
export function useUsersState(): UsersState {
	const state = getContext<UsersState | undefined>(USERS_STATE);
	if (!state) throw new Error('Users state must be initialized by the app layout.');
	return state;
}
