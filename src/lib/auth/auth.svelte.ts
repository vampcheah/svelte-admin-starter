// Reactive auth store. Holds the current user + loading state, restores a cached
// session synchronously for instant UI (and so the route guard works on first
// paint), and delegates the actual authentication to `authProvider`.
//
// The swap point for a real backend is provider.ts — not this file. This store's
// public API (`auth.user`, `auth.login`, …) stays stable, so pages never change.

import { browser } from '$app/env';
import { goto } from '$app/navigation';
import { isUser, type User } from './types';
import { authProvider, type AuthResult } from './provider';
import { config } from '#lib/config/index.ts';
import { t } from '#lib/i18n/index.ts';
import { resolveAppUrl } from '#lib/shell/paths.ts';
import { tabs } from '#lib/shell/tabs.svelte.ts';

const SESSION_KEY = config.auth.sessionKey;

class AuthStore {
	#user = $state<User | null>(null);
	#loading = $state(false);
	#initialized = false;

	get user(): User | null {
		return this.#user;
	}

	get isAuthenticated(): boolean {
		return this.#user !== null;
	}

	get loading(): boolean {
		return this.#loading;
	}

	/** Restore a cached session from localStorage. Safe to call repeatedly. */
	init(): void {
		if (this.#initialized || !browser) return;
		this.#initialized = true;
		try {
			const raw = localStorage.getItem(SESSION_KEY);
			if (raw) {
				const parsed: unknown = JSON.parse(raw);
				if (!isUser(parsed)) {
					this.#clear();
					return;
				}
				// Clean up stale or missing avatarUrl references from legacy localStorage sessions
				if (parsed.avatarUrl && parsed.avatarUrl.includes('/avatars/')) {
					delete parsed.avatarUrl;
				}
				this.#user = parsed;
			}
		} catch {
			this.#clear();
		}
	}

	/** Cache the session so `init()` can restore it instantly on the next load. */
	#persist(user: User): void {
		this.#user = user;
		if (browser) {
			try {
				localStorage.setItem(SESSION_KEY, JSON.stringify(user));
			} catch {
				// Storage may be unavailable (private mode); session stays in-memory.
			}
		}
	}

	#clear(): void {
		this.#user = null;
		if (browser) {
			try {
				localStorage.removeItem(SESSION_KEY);
			} catch {
				// Ignore storage errors.
			}
		}
	}

	async login(email: string, password: string): Promise<AuthResult> {
		this.#loading = true;
		try {
			const result = await authProvider.login(email, password);
			if (result.ok) this.#persist(result.user);
			return result;
		} catch {
			return { ok: false, error: t('auth.errors.connectionFailed') };
		} finally {
			this.#loading = false;
		}
	}

	async register(name: string, email: string, password: string): Promise<AuthResult> {
		this.#loading = true;
		try {
			const result = await authProvider.register(name, email, password);
			if (result.ok) this.#persist(result.user);
			return result;
		} catch {
			return { ok: false, error: t('auth.errors.connectionFailed') };
		} finally {
			this.#loading = false;
		}
	}

	/** Sign out (revoke via the provider), clear the cached session, return to login. */
	async logout(): Promise<void> {
		try {
			await authProvider.logout();
		} finally {
			this.#clear();
			tabs.reset();
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolveAppUrl resolves through $app/paths boundary.
			void goto(resolveAppUrl(config.auth.afterLogout));
		}
	}
}

export const auth = new AuthStore();
