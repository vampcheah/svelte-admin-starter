# Svelte Admin Starter v1.1.0

## Portable core

- Adds a single-source portable tab engine, tab bar, keep-alive outlet, layout chain, and route registry under `src/lib/core/shell`.
- Makes overflow confirmation internal to every tab-creation path, so callers cannot bypass it.
- Preserves query strings as tab identity and restores the complete previous URL when overflow is cancelled.
- Moves dynamic-layout rejection and root-layout exclusion into the shared route-registry contract.
- Adds executable behavior tests for overflow handling and route matching.

## Application adapter

- The starter shell now consumes the portable core and retains only demo navigation, mock authentication, i18n, and SvelteKit wiring.

## Dependencies and migration

- No dependency changes.
- Downstream frameworks should sync the immutable portable core and replace duplicated tab implementations with thin adapters.
