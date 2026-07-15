# Creating and reworking pages

Use the current application rather than frozen page copies. Neighboring routes are references for conventions, not templates that must be duplicated.

## Classify the page

| Page shape   | Typical composition                                                      | Live references to look for          |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------ |
| List or CRUD | `PageHeader`, `DataTable`, filters, optional sheet and confirmation      | Existing list or table routes        |
| Form         | `Card`, form controls, validation, submit feedback                       | Existing create or edit forms        |
| Detail       | Back action, record heading, information cards, empty/not-found handling | Existing `[id]` routes               |
| Overview     | `StatCard`, charts, summaries, recent activity                           | Dashboard or feature overview routes |
| Settings     | Section layout, grouped form cards, save feedback                        | Existing settings routes             |

If no similar route exists, build from the architecture and component contracts instead of copying an unrelated page.

## Creation workflow

1. Read the applicable project instructions and inspect the route tree with `rg --files src/routes`.
2. Decide the URL, route group, dynamic segments, and whether the page is a top-level navigation destination.
3. Inspect one or two nearby live pages for current import, layout, state, and interaction conventions.
4. Create the smallest route surface needed: `+page.svelte`, plus `+page.server.ts`, `+page.ts`, or a nested layout only when the feature requires them.
5. Compose the page with `PageContainer`, `PageHeader`, shared patterns, and UI primitives. Keep feature-specific state and validation in the feature.
6. Put real data access in the server seam. Handle loading, empty, error, and destructive states in proportion to the feature.
7. Register top-level navigation and use `resolve()` for every internal destination.
8. Add new strings to both locales and keep their object shapes aligned.
9. Run the complete verification pipeline.

## Existing page changes

For copy, labels, examples, styling corrections, or a small component insertion, patch the target page directly. Re-run formatting and the relevant checks, but do not recreate the route or refresh a page snapshot. Use the full workflow only when changing the page's structure, data boundary, navigation role, or archetype.

## Completion checklist

- The page lives in the correct route group and uses the existing shell.
- Data does not cross the server/client boundary incorrectly.
- Navigation, localization, responsive layout, dark mode, accessibility, and empty/error states are covered.
- No complete page copy or stale snapshot was introduced.
- `npm run check`, `npm run lint`, and `npm run build` pass.
