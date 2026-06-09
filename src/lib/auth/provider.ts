// ============================================================================
//  Auth provider — THE single seam between the app and your auth backend.
//
//  The rest of the app only ever talks to the reactive `auth` store
//  (see auth.svelte.ts). The store handles UI state, route redirects, and
//  caching the session for an instant restore; this provider does the actual
//  authentication. To go to production, implement `AuthProvider` against your
//  backend (REST/RPC call, Lucia, Auth.js, Supabase, …) and change the one
//  `authProvider` export at the bottom. No pages or components need to change.
// ============================================================================

import type { User } from './types';
import { config } from '$lib/config';

export interface AuthResult {
	ok: boolean;
	error?: string;
	/** The authenticated user — present when `ok` is true. */
	user?: User;
}

export interface AuthProvider {
	login(email: string, password: string): Promise<AuthResult>;
	register(name: string, email: string, password: string): Promise<AuthResult>;
	/** Called on sign-out — revoke the server session / clear cookies here. */
	logout(): Promise<void>;
}

// ---------------------------------------------------------------------------
//  Mock implementation (replace for production)
//  Any email + an 8+ character password is accepted; a User is derived from
//  the email. `admin@example.com` becomes an admin, everyone else an editor.
// ---------------------------------------------------------------------------

const MIN_PASSWORD_LENGTH = config.auth.minPasswordLength;
//  Base URL of your backend (empty string = mock mode). Shared with the data
//  layer ($lib/server/db.ts) — both read it from `config.api.baseUrl`.
const API_BASE_URL = config.api.baseUrl;

/** Derive a display name from the local-part of an email address. */
function nameFromEmail(email: string): string {
	const local = email.split('@')[0] ?? 'User';
	return (
		local
			.split(/[._-]+/)
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ') || 'User'
	);
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
		role: normalized === config.auth.demo.email ? 'admin' : 'editor'
	};
}

/** Simulate network latency for a more realistic mock UX. */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAuthProvider: AuthProvider = {
	async login(email, password) {
		await delay(400);
		if (!email.trim()) return { ok: false, error: 'Email is required.' };
		if (password.length < MIN_PASSWORD_LENGTH) {
			return { ok: false, error: 'Password must be at least 8 characters.' };
		}
		return { ok: true, user: buildUser(email) };
	},

	async register(name, email, password) {
		await delay(400);
		if (!name.trim()) return { ok: false, error: 'Name is required.' };
		if (!email.trim()) return { ok: false, error: 'Email is required.' };
		if (password.length < MIN_PASSWORD_LENGTH) {
			return { ok: false, error: 'Password must be at least 8 characters.' };
		}
		return { ok: true, user: buildUser(email, name) };
	},

	async logout() {
		// Mock: nothing to revoke server-side.
	}
};

// ---------------------------------------------------------------------------
//  Real backend implementation. Wired to `config.api.baseUrl`; flesh out the
//  request/response shape to match your API.
// ---------------------------------------------------------------------------

const apiAuthProvider: AuthProvider = {
	async login(email, password) {
		const res = await fetch(`${API_BASE_URL}/auth/login`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
		if (!res.ok) return { ok: false, error: 'Invalid email or password.' };
		return { ok: true, user: (await res.json()) as User };
	},

	async register(name, email, password) {
		const res = await fetch(`${API_BASE_URL}/auth/register`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name, email, password })
		});
		if (!res.ok) return { ok: false, error: 'Registration failed.' };
		return { ok: true, user: (await res.json()) as User };
	},

	async logout() {
		await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
	}
};

//  Use the real backend when one is configured; otherwise fall back to the mock.
export const authProvider: AuthProvider = API_BASE_URL ? apiAuthProvider : mockAuthProvider;
