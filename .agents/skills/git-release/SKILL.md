---
name: git-release
description: Bump the version, commit, tag, push, and publish a GitHub release for this SvelteKit admin starter. Use when asked to release a new version, bump the version, cut a tag, or publish a release. Do not use for ordinary code changes or commits.
---

# Release a new version

Create a release by bumping the version, tagging, pushing, and publishing the
GitHub release. Follow the repository's existing release history exactly.

## Version determination

- Read the current version from the top-level `"version"` field in
  `package.json` (mirrored in `package-lock.json`).
- Bump the patch version (`X.Y.Z` -> `X.Y.(Z+1)`) unless the user specifies a
  different target. Never invent a version the user did not ask for.

## Workflow

1. Confirm the working tree is clean: `git status --short` shows no changes
   beyond what is being released. Commit or stash unrelated work first.
2. Update the `"version"` field in **both** `package.json` and
   `package-lock.json` (the lockfile has two spots: the root and the `""`
   package entry).
3. Commit the version bump with the exact message `chore: bump version to
   X.Y.Z` (matching prior history — e.g. `chore: bump version to 1.2.0`).
4. Create an **annotated** tag (prior tags are annotated, e.g.
   `git cat-file -t v1.2.0` -> `tag`):
   `git tag -a vX.Y.Z -m "vX.Y.Z"`.
5. Push the branch and the tag together:
   `git push origin <branch> && git push origin vX.Y.Z`.
6. Publish the GitHub release with `gh`:
   - Title: `Svelte Admin Starter vX.Y.Z`
   - Tag: `vX.Y.Z`
   - Notes: summarize the changes since the last release, derived from
     `git log` between the previous tag and the new one. Match prior release
     note tone, and add a `**Core Status**: core 无变化 (No changes to
     src/lib/core).` line unless `src/lib/core/` actually changed.
   - Example command:
     `gh release create vX.Y.Z --title "Svelte Admin Starter vX.Y.Z" --notes "..."`
7. Ensure the new release is marked `Latest`:
   `gh release edit vX.Y.Z --latest=true`, then confirm with
   `gh release list`.

## Guardrails

- Only commit the version bump; do not fold unrelated changes into the release
  commit.
- Never push, tag, or create a release without an explicit request from the
  user.
- Never overwrite or delete an existing tag or release.
- Verify the tag exists and the release is live before reporting completion
  (`git tag` and `gh release list`).
