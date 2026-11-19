<!--
  Root layout — global, shell-agnostic. Loads the stylesheet, mounts the
  theme watcher and the toast portal, and restores session + locale on mount.
  Route groups ((auth)/(app)) layer their own chrome on top of this.
-->
<script lang="ts">
	import '../app.css';
	// Self-hosted fonts (no external CDN) — pairs with --font-sans/--font-mono in app.css.
	import '@fontsource-variable/geist';
	import '@fontsource-variable/geist-mono';
	import { onMount } from 'svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '#lib/core/components/ui/sonner/index.ts';
	import { auth } from '#lib/auth/index.ts';
	import { initLocale, i18n } from '#lib/i18n/index.ts';
	import { config } from '#lib/config/index.ts';

	let { children } = $props();

	onMount(() => {
		auth.init();
		initLocale();
	});

	$effect(() => {
		document.documentElement.lang = i18n.locale;
	});
</script>

<svelte:head>
	<meta name="description" content={config.app.description} />
</svelte:head>

<ModeWatcher defaultMode={config.theme.defaultMode} />
<Toaster richColors position="top-right" />

{@render children()}
