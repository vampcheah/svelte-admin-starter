import { untrack } from 'svelte';
import { today } from '#lib/calendar.ts';
import { millisecondsUntilTomorrow } from './navigation';

/** Refresh on tab activation, browser focus/visibility, and local midnight. */
export function useCalendarToday(isActive: () => boolean) {
	let current = $state(today());
	function refresh() {
		const next = today();
		if (next.key !== current.key) current = next;
		return next;
	}
	$effect(() => {
		if (!isActive()) return;
		let timer: ReturnType<typeof setTimeout>;
		function schedule() {
			clearTimeout(timer);
			if (document.visibilityState === 'hidden') return;
			untrack(refresh);
			timer = setTimeout(schedule, millisecondsUntilTomorrow());
		}
		schedule();
		window.addEventListener('focus', schedule);
		document.addEventListener('visibilitychange', schedule);
		return () => {
			clearTimeout(timer);
			window.removeEventListener('focus', schedule);
			document.removeEventListener('visibilitychange', schedule);
		};
	});
	return {
		get current() {
			return current;
		},
		refresh
	};
}
