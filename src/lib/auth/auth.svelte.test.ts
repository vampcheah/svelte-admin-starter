import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '#lib/config/index.ts';
import { t } from '#lib/i18n/index.ts';

vi.mock('$app/env', () => ({ browser: true }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({
	resolve: (path: string) => (path.startsWith('/') ? path : `/${path}`)
}));
vi.mock('#lib/shell/tabs.svelte.ts', () => ({ tabs: { reset: vi.fn() } }));
vi.mock('#lib/config/index.ts', async (importOriginal) => {
	const actual = await importOriginal<typeof import('#lib/config/index.ts')>();
	return {
		...actual,
		config: {
			...actual.config,
			api: { baseUrl: 'https://api.example.test' },
			auth: { ...actual.config.auth, minPasswordLength: 12 }
		}
	};
});

const user = {
	id: 'u_test',
	name: 'Jane Doe',
	email: 'jane@example.com',
	role: 'editor' as const
};

let storage: Map<string, string>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	vi.resetModules();
	storage = new Map();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
		removeItem: (key: string) => storage.delete(key)
	});
	fetchMock = vi.fn();
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('auth request recovery', () => {
	it.each(['login', 'register'] as const)(
		'releases %s pending state after a network failure and permits retry',
		async (operation) => {
			const { auth } = await import('./auth.svelte');
			fetchMock.mockRejectedValueOnce(new TypeError('Network unavailable'));
			const submit = () =>
				operation === 'login'
					? auth.login(user.email, 'long-password')
					: auth.register(user.name, user.email, 'long-password');

			const failed = submit();
			expect(auth.loading).toBe(true);
			await expect(failed).resolves.toEqual({
				ok: false,
				error: t('auth.errors.connectionFailed')
			});
			expect(auth.loading).toBe(false);
			expect(auth.isAuthenticated).toBe(false);

			fetchMock.mockResolvedValueOnce(Response.json(user));
			await expect(submit()).resolves.toEqual({ ok: true, user });
			expect(auth.loading).toBe(false);
			expect(auth.user).toEqual(user);
			expect(JSON.parse(storage.get(config.auth.sessionKey)!)).toEqual(user);
		}
	);

	it.each([
		['malformed JSON', 'not-json'],
		['missing user', JSON.stringify({ ok: true })],
		['unsupported role', JSON.stringify({ ...user, role: 'owner' })],
		['invalid avatar', JSON.stringify({ ...user, avatarUrl: 123 })]
	])('rejects a successful response containing %s', async (_, body) => {
		const { auth } = await import('./auth.svelte');
		fetchMock.mockResolvedValueOnce(new Response(body, { status: 200 }));

		await expect(auth.login(user.email, 'long-password')).resolves.toEqual({
			ok: false,
			error: t('auth.errors.invalidResponse')
		});
		expect(auth.loading).toBe(false);
		expect(auth.user).toBeNull();
		expect(storage.has(config.auth.sessionKey)).toBe(false);
	});

	it('surfaces failed credentials without caching a session', async () => {
		const { auth } = await import('./auth.svelte');
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
		await expect(auth.login(user.email, 'long-password')).resolves.toEqual({
			ok: false,
			error: t('auth.errors.invalidCredentials')
		});
		expect(auth.loading).toBe(false);
		expect(auth.isAuthenticated).toBe(false);
	});
});

describe('cached auth sessions', () => {
	it.each([
		null,
		{},
		[],
		{ ...user, id: '' },
		{ ...user, name: ' ' },
		{ ...user, email: 123 },
		{ ...user, role: 'owner' },
		{ ...user, avatarUrl: {} }
	])('discards an invalid cached user: %j', async (cached) => {
		storage.set(config.auth.sessionKey, JSON.stringify(cached));
		const { auth } = await import('./auth.svelte');
		auth.init();
		expect(auth.isAuthenticated).toBe(false);
		expect(storage.has(config.auth.sessionKey)).toBe(false);
	});

	it('discards malformed cached JSON', async () => {
		storage.set(config.auth.sessionKey, '{invalid');
		const { auth } = await import('./auth.svelte');
		expect(() => auth.init()).not.toThrow();
		expect(auth.user).toBeNull();
		expect(storage.has(config.auth.sessionKey)).toBe(false);
	});

	it('restores the supported user shape and cleans legacy avatar references', async () => {
		storage.set(
			config.auth.sessionKey,
			JSON.stringify({ ...user, avatarUrl: '/avatars/jane.png' })
		);
		const { auth } = await import('./auth.svelte');
		auth.init();
		expect(auth.user).toEqual(user);
		expect(auth.isAuthenticated).toBe(true);
	});
});

describe('mock auth compatibility', () => {
	it('uses configured minimum password length and keeps normalized mock users', async () => {
		vi.useFakeTimers();
		const { mockAuthProvider } = await import('./provider');
		const tooShort = mockAuthProvider.register(user.name, user.email, '12345678');
		await vi.runAllTimersAsync();
		await expect(tooShort).resolves.toEqual({
			ok: false,
			error: t('auth.errors.passwordTooShort', { min: 12 })
		});

		const registered = mockAuthProvider.register(
			'  Jane Doe  ',
			' JANE@example.com ',
			'long-password'
		);
		await vi.runAllTimersAsync();
		expect(await registered).toEqual({
			ok: true,
			user: { ...user, id: expect.any(String) }
		});
	});
});
