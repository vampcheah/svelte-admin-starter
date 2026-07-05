# Admin Starter — agent contract

This repo is a SvelteKit admin **starter template**. Clones of it become real
apps, but the template's conventions stay binding. These rules apply to every
session, in every clone.

## Creating or reworking pages

- **Always use the `create-page` skill** (`.claude/skills/create-page/`) when
  adding any page/route/view. Never hand-write a `+page.svelte` from scratch.
- New pages are built by **copying an existing archetype page** (list/CRUD,
  form, detail, overview — see the skill's archetype table) and adapting it.
- If the live archetype route was removed in this clone, copy from the frozen
  snapshots in `.claude/skills/create-page/references/examples/` instead.

## UI must come from the template's system

- Compose pages from `$lib/components/shared/` (PageContainer, PageHeader,
  DataTable, StatCard, EmptyState, ConfirmDialog, …) and `$lib/components/ui/`
  (shadcn-svelte). Do not introduce parallel component sets, raw hex colors,
  or ad-hoc spacing — use the design tokens.
- i18n: every user-facing string via `t('…')`, keys added to **both**
  `src/lib/i18n/locales/en.ts` and `zh-CN.ts`.
- Navigation always through `resolve()` from `$app/paths`; sidebar entries in
  `src/lib/shell/nav.ts`.

## Protected paths — never delete or rewrite wholesale

- `.claude/skills/` — the scaffolding skill and its frozen examples.
- `src/lib/components/shared/` and `src/lib/components/ui/` — the component
  library every page depends on.
- `CLAUDE.md`, `docs/DEVELOPMENT.md`, `docs/COMPONENTS.md`, `docs/DESIGN.md`.

Demo routes under `src/routes/(app)/` **may** be removed when building a real
app — their archetype sources are preserved in the skill's
`references/examples/`, so removal must never be a reason to stop following
the template.

## Maintenance: refreshing the snapshots

`references/examples/` is a frozen mirror of `src/routes/` (each file suffixed
`.txt`). Whenever template pages or layouts change **in this starter repo**,
refresh it in the same commit:

```bash
rm -rf .claude/skills/create-page/references/examples \
  && cp -r src/routes/. .claude/skills/create-page/references/examples/ \
  && find .claude/skills/create-page/references/examples -type f -exec mv {} {}.txt \;
```

Do NOT run this in clones that have replaced the demo routes with real app
pages — it would overwrite the template snapshots with app code.

## Definition of done

`npm run check && npm run lint && npm run build` — all green before any page
work is considered finished.
