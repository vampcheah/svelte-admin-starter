<!-- Global confirm dialog host — mounted once in the (app) layout, driven by the confirm() service. -->
<script lang="ts">
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { confirmer } from '$lib/confirm.svelte';

	// When the dialog closes without confirming (cancel/Esc/outside click), settle as false.
	$effect(() => {
		if (!confirmer.open) confirmer.dismissed();
	});
</script>

<ConfirmDialog
	bind:open={confirmer.open}
	title={confirmer.opts.title}
	description={confirmer.opts.description}
	highlights={confirmer.opts.highlights}
	confirmText={confirmer.opts.confirmText}
	cancelText={confirmer.opts.cancelText}
	variant={confirmer.opts.variant ?? 'default'}
	onConfirm={() => confirmer.accept()}
/>
