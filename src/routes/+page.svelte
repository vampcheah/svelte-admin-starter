<!--
  Index page. The `load` function redirects to the configured home page, so this only
  flashes briefly (e.g. with JS-disabled SSR) — show a centered spinner.
-->
<script lang="ts">
	import Spinner from '#lib/core/components/shared/Spinner.svelte';
</script>

<div class="flex min-h-svh items-center justify-center bg-background">
	<Spinner class="size-6 text-primary" />
</div>
