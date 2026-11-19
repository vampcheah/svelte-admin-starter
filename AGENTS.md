# Repository guide

## Working approach

Complete the requested outcome using current source and existing authorization. Infer routine details; ask only when the answer changes correctness or scope, and continue independent work while waiting. Explicit user instructions take precedence over skill guidelines, within session permissions. Preserve unrelated user changes.

For substantial work, track remaining steps and verification; skip formal planning for small edits. Batch independent reads, and use bounded subagents for substantial independent work when session rules allow. Stop exploring once the evidence is sufficient. Report the result, checks, and material limitations concisely in the user's language.

## Project contracts

- Use the Node range in `package.json` and npm with `package-lock.json`; use `npm ci` for a reproducible install. Preserve dependency versions unless the task requires an upgrade.
- Use TypeScript, Svelte 5 runes, and existing SvelteKit patterns. Follow `.prettierrc` and nearby naming conventions; format changed files rather than the whole repository.
- Routes live in `src/routes/(app)` and `src/routes/(auth)`. Reuse `src/lib/shell`, shared page components, and `src/lib/core/components/ui`.
- `src/lib/core` is the portable export boundary. Keep app auth, i18n, mock data, and shell integrations outside it; preserve the export contract in `svelte-admin-export.json`.
- Use semantic colors from `src/lib/core/theme.css`; theme changes belong in tokens. Preserve responsive layout, keyboard access, focus visibility, and light/dark contrast.
- Add new app strings to both locale dictionaries. Resolve internal navigation with `$app/paths`; top-level destinations belong in `src/lib/shell/nav.ts`. Keep `config.app.homePath` pointed at an existing route.
- Keep server-only access behind `#lib/server` and typed route loads. Local demo state does not require a server load.

## Task guidance

Use this `AGENTS.md` as the shared repository guide. Canonical skills live in `.agents/skills/`. Use `ui-manager` for new routes or substantial page restructuring, and `git-release` for version/tag/release work. Small styling or copy edits need no page-creation workflow. Read only references relevant to the task; inspect live source when documentation differs.

## Validation

Use the existing checks at the scale of the change:

- Documentation: Prettier on changed files; validate changed skills and their reference paths.
- Styling/components: `npm run check`, `npm run lint`, and inspect affected visual states when a browser is available.
- Behavior: focused Vitest coverage beside the subject (`*.test.ts`); add regression tests for meaningful behavior, not assertions that duplicate implementation.
- Portable core: also run `npm run check:export`. Routing, build configuration, or integration changes also need `npm run build`.
- Before a PR or full release: `npm run verify`, the same complete sequence used by CI (check, lint, test, build, export).

Once appropriate checks pass, repeat or broaden them only for new edits, failures, or unresolved concerns. Report unavailable checks honestly.

## Delivery

Use scoped Conventional Commit subjects. PRs explain behavior and validation, link relevant issues, and include screenshots for visible changes when available. Call out `src/lib/core` changes for downstream consumers. Release requests follow `docs/RELEASE.md`; a version-only request does not authorize publishing.
