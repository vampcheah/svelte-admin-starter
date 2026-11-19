# Application architecture

Use this reference to understand where a page belongs and how it participates in the application. Inspect the named files because clones may have changed the available routes and features.

## Route and shell arrangement

```text
src/routes/
├── +layout.svelte             global fonts, theme, i18n initialization, toasts
├── (app)/+layout.svelte       authenticated application shell
│   └── <feature>/+page.svelte pages rendered inside the shell
└── (auth)/+layout.svelte      authentication-facing layout

templates/pages/               copy-on-create page archetypes
```

Route groups organize code and do not appear in URLs. Put authenticated product pages under `(app)` and login, registration, and account-recovery pages under `(auth)`. Use `[id]` for record detail routes and nested `+layout.svelte` files only when a section owns persistent local navigation or state.

The application shell is composed in `src/lib/shell/`. `AppShell` coordinates the sidebar, header, breadcrumbs, tabs, and page outlet. Feature pages should render their content, not recreate those shell elements. Files under `templates/pages/` are development scaffolds: copy the closest archetype into a real route, then adapt it there. Never import a template at runtime.

## Page composition

Use `PageContainer` as the normal page boundary and `PageHeader` for the title, description, and primary actions. Build the remaining sections from shared components and UI primitives. Keep layout responsive and use the semantic design tokens defined in `src/lib/core/theme.css`.

## Data flow

Keep server-only access behind this direction of dependency:

```text
+page.server.ts -> #lib/server/db.ts -> API, database, or mock data
+page.svelte    <- typed load data
```

Do not import `#lib/server/*` from a `.svelte` file. Pages with purely local demo or transient UI state do not need a server load.

## Cross-cutting systems

- Navigation: register top-level destinations in `src/lib/shell/nav.ts`; configured entries are automatically hidden if their route is deleted. Use `resolve()` from `$app/paths` for internal links and programmatic navigation.
- Home route: `config.app.homePath` is the single destination used by `/`, login, breadcrumbs, errors, sidebar branding, and tabs. Point it to an existing `(app)` route before deleting the current home page.
- Localization: call `t()` for new user-facing strings and mirror keys in `src/lib/i18n/locales/en.ts` and `zh-CN.ts`.
- Authentication: rely on the existing `(app)` layout and `#lib/auth`; do not add page-local authentication shells.
- Components: import page patterns from `#lib/components/shared` and primitives from `#lib/core/components/ui`; use props and snippets before creating variants.

## Source-of-truth files

Use `AGENTS.md` for repository contracts. Inspect only the affected source and relevant sections of `docs/DEVELOPMENT.md`, `docs/COMPONENTS.md`, or `docs/DESIGN.md`; live source and installed versions resolve stale examples.
