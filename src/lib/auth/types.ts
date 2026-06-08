// Auth domain types for the mock authentication layer.

export interface User {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'editor' | 'viewer';
	avatarUrl?: string;
}
