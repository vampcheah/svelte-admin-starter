# 发布与下游交接

本文只描述 Svelte Admin Starter 自己拥有的发布步骤。稳定 Release 的交付物是 immutable
`vX.Y.Z` tag，以及 `svelte-admin-export.json` 选中的 `src/lib/core/**` 和 `LICENSE`。
GenesisOne 和产品集成不在本仓库处理。

## 1. 发布前检查

从已同步远端且工作树干净的 `main` 开始：

```bash
git switch main
git pull --ff-only
test -z "$(git status --porcelain)"

npm ci
npm run check
npm run lint
npm test
npm run build
npm run check:export
```

确认 GitHub CI 对准备发布的 commit 全绿。`check:export` 必须证明：

- export manifest 只选择 `src/lib/core/**` 和 `LICENSE`；
- core 的内部 import 闭合，外部 package 均已声明；
- 选中路径没有 symlink、submodule、目录逃逸或未跟踪文件。

如果变更只影响 demo、route、mock auth、navigation 或 `src/lib/shell` 应用适配器，应在
Release Notes 标明“core 无变化”；`src/lib/core/shell` 的改动属于 portable core，必须明确
交给 GenesisOne 同步。

## 2. 发布稳定版本

先准备 Release Notes，明确列出 core 的新增、修改、删除、依赖变化和迁移要求。然后发布
annotated tag：

```bash
TAG=v1.0.1
NOTES_FILE=/path/to/svelte-admin-v1.0.1.md

git tag -a "$TAG" -m "Svelte Admin $TAG"
git push origin "refs/tags/$TAG"
gh release create "$TAG" --verify-tag \
  --title "Svelte Admin Starter $TAG" \
  --notes-file "$NOTES_FILE"
```

稳定 tag 不得移动、删除或覆盖。发布后发现问题时保留原 tag，并发布新的 patch 版本。

## 3. 交给 GenesisOne

把正式 Release tag 交给 GenesisOne 维护者即可。GenesisOne 从自己的仓库运行：

```bash
make svelte-admin-sync REF=v1.0.1
```

GenesisOne 必须从 tag 的 Git tree 原样复制 export 集合。不要向 GenesisOne 或 OmniBOS
发送 branch、commit SHA、手工文件包，也不要在本仓库维护下游路径或版本。
