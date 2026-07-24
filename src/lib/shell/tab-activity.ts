/** Reactive activity state provided to every keep-alive tab subtree. */
export const TAB_ACTIVITY = Symbol('omnibos-tab-activity');

export interface TabActivity {
	readonly active: boolean;
}
