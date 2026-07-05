// Global imperative confirm service: `if (!(await confirm({...}))) return;`.
// A single ConfirmHost renders the shared ConfirmDialog, so pages don't each
// need their own dialog open/pending state.
export interface ConfirmOpts {
	title: string;
	description?: string;
	/** Extra strings to highlight in the description (names/statuses/field values). Merged with the automatic highlights (amounts/doc numbers/dates). */
	highlights?: string[];
	confirmText?: string;
	cancelText?: string;
	variant?: 'default' | 'destructive';
}

class Confirmer {
	open = $state(false);
	opts = $state<ConfirmOpts>({ title: '' });
	#resolve: ((v: boolean) => void) | null = null;

	ask(opts: ConfirmOpts): Promise<boolean> {
		this.#settle(false); // settle any pending ask
		this.opts = opts;
		this.open = true;
		return new Promise<boolean>((res) => {
			this.#resolve = res;
		});
	}

	/** Called by the host when the user confirms. */
	accept(): void {
		this.#settle(true);
	}

	/** Called by the host when the dialog closes (cancel/Esc/outside click). */
	dismissed(): void {
		this.#settle(false);
	}

	#settle(v: boolean): void {
		this.open = false;
		if (this.#resolve) {
			this.#resolve(v);
			this.#resolve = null;
		}
	}
}

export const confirmer = new Confirmer();

/** Open the confirm dialog; resolves to the user's choice. */
export const confirm = (opts: ConfirmOpts): Promise<boolean> => confirmer.ask(opts);
