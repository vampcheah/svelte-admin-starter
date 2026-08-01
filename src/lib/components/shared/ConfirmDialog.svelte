<!--
  ConfirmDialog — a yes/no confirmation built on the AlertDialog primitive.
  `open` is bindable. `onConfirm` may be async; while it runs the confirm
  button shows a spinner and both actions are disabled. On success the dialog
  closes. The destructive variant styles the confirm button for delete flows.
-->
<script lang="ts">
	import * as AlertDialog from '$lib/core/components/ui/alert-dialog';
	import { Button } from '$lib/core/components/ui/button';
	import Spinner from '$lib/core/components/shared/Spinner.svelte';
	import { cn } from '$lib/core/utils';
	import { t } from '$lib/i18n';

	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		/** Extra strings to highlight in the description (names/statuses/field values). Merged with the automatic highlights. */
		highlights?: string[];
		confirmText?: string;
		cancelText?: string;
		variant?: 'default' | 'destructive';
		onConfirm: () => void | Promise<void>;
	}

	let {
		open = $bindable(false),
		title,
		description,
		highlights = [],
		confirmText,
		cancelText,
		variant = 'default',
		onConfirm
	}: Props = $props();

	let pending = $state(false);

	async function handleConfirm() {
		if (pending) return;
		try {
			pending = true;
			await onConfirm();
			open = false;
		} finally {
			pending = false;
		}
	}

	function cancel() {
		if (pending) return;
		open = false;
	}

	// Auto-highlight in the description: amounts (2 decimals, optional currency
	// prefix / thousand separators), document numbers (INV-/CN-/QUO-…), and
	// common date formats. Segments render as plain text (no {@html}) — XSS-safe.
	const AUTO =
		/[A-Z]{2,3}\s?[\d,]+\.\d{2}|\d[\d,]*\.\d{2}|[A-Z]{2,4}-\d{4}-\d{2,}|\d{4}-\d{2}-\d{2}|\d{4}\/\d{1,2}\/\d{1,2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\.\d{1,2}\.\d{4}|[A-Z][a-z]{2,8}\.?\s\d{1,2},?\s\d{4}|\d{1,2}\s[A-Z][a-z]{2,8}\.?,?\s\d{4}/g;

	// Merge auto matches with caller-provided `highlights`, dedupe overlaps, split into parts.
	function descParts(text: string, extra: string[]): { s: string; hl: boolean }[] {
		const rs: Array<[number, number]> = [];
		for (const m of text.matchAll(AUTO)) {
			const i = m.index ?? 0;
			rs.push([i, i + m[0].length]);
		}
		for (const h of extra) {
			if (!h) continue;
			let from = 0;
			for (let idx = text.indexOf(h, from); idx >= 0; idx = text.indexOf(h, from)) {
				rs.push([idx, idx + h.length]);
				from = idx + h.length;
			}
		}
		rs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
		const merged: Array<[number, number]> = [];
		for (const r of rs) {
			const last = merged[merged.length - 1];
			if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
			else merged.push([r[0], r[1]]);
		}
		const out: { s: string; hl: boolean }[] = [];
		let cur = 0;
		for (const [a, b] of merged) {
			if (a > cur) out.push({ s: text.slice(cur, a), hl: false });
			out.push({ s: text.slice(a, b), hl: true });
			cur = b;
		}
		if (cur < text.length) out.push({ s: text.slice(cur), hl: false });
		return out;
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			{#if description}
				<AlertDialog.Description
					>{#each descParts(description, highlights) as p, i (i)}{#if p.hl}<strong
								class="text-primary font-semibold">{p.s}</strong
							>{:else}{p.s}{/if}{/each}</AlertDialog.Description
				>
			{/if}
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<Button variant="outline" onclick={cancel} disabled={pending}>
				{cancelText ?? t('common.cancel')}
			</Button>
			<Button
				variant={variant === 'destructive' ? 'destructive' : 'default'}
				onclick={handleConfirm}
				disabled={pending}
				class={cn(pending && 'pointer-events-none')}
			>
				{#if pending}
					<Spinner class="size-4" />
				{/if}
				{confirmText ?? t('common.confirm')}
			</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
