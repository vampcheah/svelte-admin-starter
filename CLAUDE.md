# Admin Starter — agent contract

This repo is a SvelteKit admin **starter template**. Clones of it become real
apps, but the template's conventions stay binding. These rules apply to every
session, in every clone.

## Creating or reworking pages

- **Always use the `create-page` skill** (`.claude/skills/create-page/`) when
  adding a page/route/view or structurally reworking a page. Small copy,
  styling, example, or component-insertion edits can patch the target directly.
- The canonical cross-client skill lives at `.agents/skills/create-page/`;
  `.claude/skills/create-page/` is only the Claude Code discovery entry.
- Inspect current routes and components as behavioral references. Do not copy
  an unrelated page wholesale or depend on frozen page snapshots.

## UI must come from the template's system

- Compose pages from `$lib/components/shared/` (PageContainer, PageHeader,
  DataTable, StatCard, EmptyState, ConfirmDialog, …) and `$lib/core/components/ui/`
  (shadcn-svelte). Do not introduce parallel component sets, raw hex colors,
  or ad-hoc spacing — use the design tokens.
- i18n: every user-facing string via `t('…')`, keys added to **both**
  `src/lib/i18n/locales/en.ts` and `zh-CN.ts`.
- Navigation always through `resolve()` from `$app/paths`; sidebar entries in
  `src/lib/shell/nav.ts`.

## Protected paths — never delete or rewrite wholesale

- `.agents/skills/` and `.claude/skills/` — reusable agent workflows and their
  client-specific discovery entries.
- `src/lib/core/` — the portable release root every page and downstream consumer depends on.
- `src/lib/components/shared/` — starter-only component integrations.
- `CLAUDE.md`, `docs/DEVELOPMENT.md`, `docs/COMPONENTS.md`, `docs/DESIGN.md`.

Demo routes under `src/routes/(app)/` **may** be removed when building a real
app. The skill describes architecture, page creation, and component use without
depending on those demo routes remaining present.

## Definition of done

`npm run check && npm run lint && npm test && npm run build && npm run check:export` — all green before any page
work is considered finished.
