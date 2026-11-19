import { describe, expect, it } from 'vitest';
import { demoUsers } from '#lib/data/users.ts';
import { createUsersState, type UserDraft } from './state.svelte';

const draft: UserDraft = {
	name: 'New teammate',
	email: 'new@example.com',
	role: 'editor',
	status: 'invited'
};

describe('session user directory', () => {
	it('shares create and update results between list and detail consumers', () => {
		const state = createUsersState();
		const list = () => state.records;
		const detail = (id: string) => state.find(id);
		const created = state.create(draft);
		expect(list()[0]).toEqual(created);
		expect(detail(created.id)).toMatchObject(draft);
		expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

		const updated = state.update(created.id, {
			...draft,
			name: 'Edited teammate',
			status: 'active'
		});
		expect(updated?.id).toBe(created.id);
		expect(updated?.createdAt).toBe(created.createdAt);
		expect(list()[0]?.name).toBe('Edited teammate');
		expect(detail(created.id)?.status).toBe('active');
	});

	it('removes records for every consumer and does not resurrect a deleted edit', () => {
		const state = createUsersState();
		const first = state.records[0]!;
		expect(state.remove(first.id)).toBe(true);
		expect(state.find(first.id)).toBeUndefined();
		expect(state.records.some((user) => user.id === first.id)).toBe(false);
		expect(state.update(first.id, draft)).toBeUndefined();
		expect(state.remove(first.id)).toBe(false);
		const second = state.records[0]!;
		expect(state.removeMany([second.id, second.id, 'already-removed'])).toBe(1);
	});

	it('isolates app sessions and keeps seed fixtures immutable', () => {
		const before = structuredClone(demoUsers);
		const firstSession = createUsersState();
		const secondSession = createUsersState();
		const original = firstSession.records[0]!;
		firstSession.update(original.id, draft);
		firstSession.remove(firstSession.records[1]!.id);
		firstSession.create(draft);
		expect(secondSession.records).toEqual(before);
		expect(demoUsers).toEqual(before);
		expect(firstSession.find(original.id)?.name).toBe(draft.name);
		expect(secondSession.find(original.id)?.name).toBe(original.name);
	});
});
