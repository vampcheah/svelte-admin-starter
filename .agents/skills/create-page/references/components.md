# Component usage

Use the narrowest existing layer that owns the required responsibility. Read `docs/COMPONENTS.md` and the live component source for complete APIs.

## Component layers

| Layer  | Import area              | Responsibility                                                  |
| ------ | ------------------------ | --------------------------------------------------------------- |
| Shell  | `$lib/shell`             | Application-wide sidebar, header, breadcrumbs, tabs, and outlet |
| Shared | `$lib/components/shared` | Reusable product patterns composed across pages                 |
| UI     | `$lib/components/ui/*`   | Low-level shadcn-svelte and Bits UI primitives                  |

Pages consume the shell but do not reconstruct it. Shared components may depend on UI primitives. UI primitives must not depend on feature pages or shared business patterns.

## Shared patterns

- Structure pages with `PageContainer` and `PageHeader`.
- Present collections with `DataTable`; use `EmptyState` when no records are available.
- Present metrics with `StatCard` and statuses with `StatusBadge`.
- Confirm destructive work with `ConfirmDialog`.
- Use `SearchInput`, `Spinner`, `ThemeToggle`, and `LanguageToggle` for their established cross-page behavior.
- Use `DatePicker`, `TimePicker`, and `DateTimePicker` for serializable date and time fields instead of rebuilding calendar popovers in each form.

## UI primitives

Use primitives such as `Button`, `Input`, `Label`, `Card`, `Select`, `Popover`, `Calendar`, `Dialog`, `Sheet`, and `Tabs` when no shared pattern already represents the interaction. Follow the import style used by the component's own `index.ts` and nearby live code.

## Common compositions

- List: page header and actions, filters, data table, row actions, confirmation.
- Form: page header, one or more cards, labels and controls, inline validation, submit feedback.
- Detail: navigation back to the collection, record summary, grouped information cards, contextual actions.
- Overview: page header, responsive stat grid, charts or summaries, activity sections.

## Extension rules

- Extend an existing shared component when the same product behavior appears across pages.
- Keep one-off domain behavior in the feature route or a feature-local component.
- Add a UI primitive only when the base component is missing; do not create a second primitive library.
- Use semantic tokens such as `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, and `bg-primary`.
- Check light and dark themes, keyboard behavior, labels, focus states, disabled states, and narrow screens.
