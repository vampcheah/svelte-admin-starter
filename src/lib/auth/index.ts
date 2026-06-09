// Public barrel for the auth module.

export { auth } from './auth.svelte';
export type { User } from './types';
// The swap point for a real backend — implement `AuthProvider` and set `authProvider`.
export { authProvider, mockAuthProvider, type AuthProvider, type AuthResult } from './provider';
