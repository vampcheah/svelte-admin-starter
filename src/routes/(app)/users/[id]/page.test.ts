import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import UserDetail from './+page.svelte';
import {
	createUsersState,
	USERS_STATE,
	type UsersState
} from '#lib/features/users/state.svelte.ts';

function detail(state: UsersState, id: string): string {
	return render(UserDetail, {
		props: { params: { id } },
		context: new Map([[USERS_STATE, state]])
	}).body;
}

describe('user detail tab', () => {
	it('uses its supplied route params and sees edits from the shared list directory', () => {
		const state = createUsersState();
		const first = state.records[0]!;
		const second = state.records[1]!;
		expect(detail(state, first.id)).toContain(first.name);
		expect(detail(state, second.id)).toContain(second.name);
		state.update(first.id, {
			...first,
			name: 'Edited in another tab',
			email: 'edited@example.com'
		});
		const firstTab = detail(state, first.id);
		const duplicateTab = detail(state, first.id);
		for (const body of [firstTab, duplicateTab]) {
			expect(body).toContain('Edited in another tab');
			expect(body).toContain('edited@example.com');
			expect(body).not.toContain(first.name);
		}
		expect(detail(state, second.id)).toContain(second.name);
	});

	it('shows the removed-user fallback after deletion and supports newly created records', () => {
		const state = createUsersState();
		const user = state.create({
			name: 'Created in the list',
			email: 'created@example.com',
			role: 'viewer',
			status: 'active'
		});
		expect(detail(state, user.id)).toContain('Created in the list');
		state.remove(user.id);
		const removed = detail(state, user.id);
		expect(removed).toContain('User not found');
		expect(removed).toContain('Back to users');
		expect(removed).toContain('href="/users"');
		expect(removed).not.toContain('Created in the list');
	});
});
