---
name: create-page
description: Create or structurally rework pages in this SvelteKit admin starter and its clones while preserving the shell, routing, data, i18n, navigation, and component conventions. Use when adding a page, route, screen, view, list, form, detail page, dashboard, or substantially changing a page layout. Do not use for small copy or content-only edits.
---

# Create an admin page

Build pages from the repository's current architecture and component system. Inspect live source files before acting; do not depend on bundled copies of complete pages.

## Read the relevant guidance

- Read [references/architecture.md](references/architecture.md) when the shell, route groups, data boundary, navigation, authentication, or localization flow is relevant or unfamiliar.
- Read [references/page-creation.md](references/page-creation.md) whenever creating a route or structurally reworking a page.
- Read [references/components.md](references/components.md) when choosing, composing, or extending shared and UI components.

## Workflow

1. Inspect the current route tree, neighboring pages, shared components, UI primitives, and project instructions.
2. Classify the requested page and choose the closest live page only as a behavioral reference. Do not copy an unrelated page wholesale.
3. Create the route inside the correct route group and preserve the existing shell composition.
4. Compose the page from `$lib/components/shared` and `$lib/core/components/ui`; add a new shared component only for a genuinely reusable product pattern.
5. Keep dynamic data behind the existing server boundary. Add navigation only for top-level destinations and wrap internal navigation with `resolve()`.
6. Put every new user-facing string in both locale dictionaries.
7. Verify with `npm run check && npm run lint && npm run build`.

## Guardrails

- Treat the live repository and its docs as the source of truth.
- Do not mirror `src/routes`, store full page snapshots, or refresh unrelated examples after a page change.
- Do not introduce a parallel component system, raw color values, or ad-hoc page shells.
- Preserve user changes and avoid rewriting existing files wholesale.
- For a small edit to an existing page, inspect and patch that page directly; do not run the full page-creation workflow unless its structure changes.
