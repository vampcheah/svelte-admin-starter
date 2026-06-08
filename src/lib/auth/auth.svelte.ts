// Mock authentication singleton. No backend — sessions live in localStorage.
// Any email plus an 8+ character password is accepted. A `User` is derived
// from the email and persisted under 'admin-starter:session'.

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { User } from './types';

const SESSION_KEY = 'admin-starter:session';
const MIN_PASSWORD_LENGTH = 8;

/** Derive a display name from the local-part of an email address. */
function nameFromEmail(email: string): string {
	const local = email.split('@')[0] ?? 'User';
	return local
		.split(/[._-]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ') || 'User';
}

/** Stable-ish id derived from the email so repeat logins look consistent. */
function idFromEmail(email: string): string {
	let hash = 0;
	for (let i = 0; i < email.length; i++) {
		hash = (hash << 5) - hash + email.charCodeAt(i);
		hash |= 0;
	}
	return `u_${Math.abs(hash).toString(36)}`;
}

function buildUser(email: string, name?: string): User {
	const normalized = email.trim().toLowerCase();
	return {
		id: idFromEmail(normalized),
		name: name?.trim() || nameFromEmail(normalized),
		email: normalized,
		// First demo admin keeps the admin role; everyone else is an editor.
		role: normalized === 'admin@example.com' ? 'admin' : 'editor'
	};
}

/** Simulate network latency for a more realistic mock UX. */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

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

	/** Restore a persisted session from localStorage. Safe to call repeatedly. */
	init(): void {
		if (this.#initialized || !browser) return;
		this.#initialized = true;
		try {
			const raw = localStorage.getItem(SESSION_KEY);
			if (raw) this.#user = JSON.parse(raw) as User;
		} catch {
			this.#user = null;
		}
	}

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

	async login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
		this.#loading = true;
		try {
			await delay(400);
			if (!email.trim()) return { ok: false, error: 'Email is required.' };
			if (password.length < MIN_PASSWORD_LENGTH) {
				return { ok: false, error: 'Password must be at least 8 characters.' };
			}
			this.#persist(buildUser(email));
			return { ok: true };
		} finally {
			this.#loading = false;
		}
	}

	async register(
		name: string,
		email: string,
		password: string
	): Promise<{ ok: boolean; error?: string }> {
		this.#loading = true;
		try {
			await delay(400);
			if (!name.trim()) return { ok: false, error: 'Name is required.' };
			if (!email.trim()) return { ok: false, error: 'Email is required.' };
			if (password.length < MIN_PASSWORD_LENGTH) {
				return { ok: false, error: 'Password must be at least 8 characters.' };
			}
			this.#persist(buildUser(email, name));
			return { ok: true };
		} finally {
			this.#loading = false;
		}
	}

	/** Clear the session and return to the login screen. */
	logout(): void {
		this.#user = null;
		if (browser) {
			try {
				localStorage.removeItem(SESSION_KEY);
			} catch {
				// Ignore storage errors.
			}
		}
		void goto('/login');
	}
}

export const auth = new AuthStore();
