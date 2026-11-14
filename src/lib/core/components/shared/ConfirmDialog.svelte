<!--
  ConfirmDialog — a yes/no confirmation built on the AlertDialog primitive.
  `open` is bindable. `onConfirm` may be async; while it runs the confirm
  button shows a spinner and both actions are disabled. On success the dialog
  closes. The destructive variant styles the confirm button for delete flows.
-->
<script lang="ts">
	import * as AlertDialog from '../ui/alert-dialog';
	import { Button } from '../ui/button';
	import Spinner from './Spinner.svelte';
	import { cn } from '../../utils';
	import { coreI18n } from '../../i18n.svelte';

	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		/** Extra strings to highlight in the description (names/statuses/field values). Merged with the automatic highlights. */
		highlights?: string[];
		/** Extra strings to highlight in warning color (e.g. orange). */
		warningHighlights?: string[];
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
		warningHighlights = [],
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

	type HighlightKind = 'none' | 'normal' | 'warning';

	// Merge auto matches with caller-provided `highlights` and `warningHighlights`.
	function descParts(
		text: string,
		extraNormal: string[],
		extraWarning: string[]
	): { s: string; kind: HighlightKind }[] {
		if (!text) return [];
		const tags: HighlightKind[] = new Array(text.length).fill('none');

		for (const m of text.matchAll(AUTO)) {
			const start = m.index ?? 0;
			const end = start + m[0].length;
			for (let i = start; i < end; i++) tags[i] = 'normal';
		}

		for (const h of extraNormal) {
			if (!h) continue;
			let from = 0;
			for (let idx = text.indexOf(h, from); idx >= 0; idx = text.indexOf(h, from)) {
				for (let i = idx; i < idx + h.length; i++) tags[i] = 'normal';
				from = idx + h.length;
			}
		}

		for (const w of extraWarning) {
			if (!w) continue;
			let from = 0;
			for (let idx = text.indexOf(w, from); idx >= 0; idx = text.indexOf(w, from)) {
				for (let i = idx; i < idx + w.length; i++) tags[i] = 'warning';
				from = idx + w.length;
			}
		}

		const parts: { s: string; kind: HighlightKind }[] = [];
		let start = 0;
		while (start < text.length) {
			const kind = tags[start];
			let end = start + 1;
			while (end < text.length && tags[end] === kind) {
				end++;
			}
			parts.push({ s: text.slice(start, end), kind });
			start = end;
		}
		return parts;
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			{#if description}
				<AlertDialog.Description>
					{#each descParts(description, highlights, warningHighlights) as p, i (i)}
						{#if p.kind === 'warning'}
							<strong class="text-orange-600 dark:text-orange-400 font-semibold">{p.s}</strong>
						{:else if p.kind === 'normal'}
							<strong class="text-primary font-semibold">{p.s}</strong>
						{:else}
							{p.s}
						{/if}
					{/each}
				</AlertDialog.Description>
			{/if}
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<Button variant="outline" onclick={cancel} disabled={pending}>
				{cancelText ?? coreI18n.t('common.cancel')}
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
				{confirmText ?? coreI18n.t('common.confirm')}
			</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
