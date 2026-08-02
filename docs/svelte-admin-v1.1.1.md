# Svelte Admin Starter v1.1.1

## Portable core

- Exposes the tab controller to portable UI and lifecycle helpers through a structural public type.
- Prevents TypeScript private-class identity conflicts when a workspace resolves the same core through source and package paths.

## Dependencies and migration

- No runtime behavior or dependency changes.
- GenesisOne consumers should sync this patch before adopting the portable shell core.
