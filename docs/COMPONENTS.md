# 组件指引 (Component Guide)

本指引覆盖 `022_svelte_admin_starter` 模板的全部组件、布局外壳、hooks、stores 与工具函数。技术栈为 **SvelteKit + Svelte 5 (runes) + Tailwind v4 + shadcn-svelte**。

> 约定：文档中所有 prop 表均直接从对应文件的 `interface Props` 提取。`bindable` 一列标记该 prop 是否用 `$bindable()` 声明（可用 `bind:` 双向绑定）。所有路径均相对仓库根目录。

## 目录

- [1. 三层组件体系](#1-三层组件体系)
- [2. UI 原子组件 (shadcn-svelte)](#2-ui-原子组件-shadcn-svelte)
- [3. Shared 复用业务组件](#3-shared-复用业务组件)
  - [PageContainer](#pagecontainer)
  - [PageHeader](#pageheader)
  - [StatCard](#statcard)
  - [StatusBadge](#statusbadge)
  - [EmptyState](#emptystate)
  - [Spinner](#spinner)
  - [SearchInput](#searchinput)
  - [ConfirmDialog](#confirmdialog)
  - [ThemeToggle](#themetoggle)
  - [LanguageToggle](#languagetoggle)
  - [CommandMenu](#commandmenu)
  - [DataTable](#datatable)
- [4. Shell 布局外壳](#4-shell-布局外壳)
- [5. Hooks](#5-hooks)
- [6. Stores 与全局 helper](#6-stores-与全局-helper)
- [7. Utils 工具函数](#7-utils-工具函数)

---

## 1. 三层组件体系

模板把组件按职责分成三层，导入路径互不混淆。选层的原则是「该组件属于哪一层的职责」：

| 层 | 目录 | 导入路径 | 何时用 |
| --- | --- | --- | --- |
| **ui** — shadcn 原子 | `src/lib/components/ui/` | `import * as Card from '$lib/components/ui/card'` | 需要无业务含义的基础控件（按钮、输入框、对话框、表格原语等）。这些由 shadcn-svelte CLI 生成，可直接修改源码。 |
| **shared** — 复用业务组件 | `src/lib/components/shared/` | `import { DataTable } from '$lib/components/shared'` | 跨页面复用、带有约定样式与行为的展示组件（页头、KPI 卡片、数据表、确认弹窗等）。它们组合 ui 原子，封装出统一的产品级模式。 |
| **shell** — 布局外壳 | `src/lib/shell/` | `import { AppShell } from '$lib/shell'` | 整个 admin 后台的框架：侧边栏、顶栏、面包屑、通知菜单、导航模型。一般只在 layout 中出现一次。 |

依赖方向是单向的：`shell` 依赖 `shared` 与 `ui`，`shared` 依赖 `ui`，`ui` 不依赖上层。

---

## 2. UI 原子组件 (shadcn-svelte)

`src/lib/components/ui/` 下共 **47 个** shadcn-svelte 组件目录，每个目录都有一个 `index.ts` 导出该组件族的全部子组件。

### 全部 47 个组件

```
accordion        alert            alert-dialog     aspect-ratio
avatar           badge            breadcrumb       button
calendar         card             carousel         chart
checkbox         collapsible      command          context-menu
dialog           drawer           dropdown-menu    form
hover-card       input            input-otp        label
menubar          navigation-menu  pagination       popover
progress         radio-group      range-calendar   resizable
scroll-area      select           separator        sheet
sidebar          skeleton         slider           sonner
switch           table            tabs             textarea
toggle           toggle-group     tooltip
```

### 导入方式

多数组件族通过 `* as` 命名空间导入，子组件以点号访问：

```svelte
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import * as Table from '$lib/components/ui/table';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
</script>

<Card.Root>
  <Card.Header><Card.Title>标题</Card.Title></Card.Header>
  <Card.Content>内容</Card.Content>
</Card.Root>
```

单组件族（如 `button`、`input`、`badge`、`checkbox`、`label`、`skeleton`、`separator`）通常是具名默认导入：

```svelte
<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
</script>
```

`sonner` 族导出的是 `Toaster`（toast 的渲染入口，见 [第 6 节](#6-stores-与全局-helper)）：

```svelte
import { Toaster } from '$lib/components/ui/sonner';
```

### 用 CLI 增删组件

项目根目录的 `components.json` 已配置好别名（`ui` → `$lib/components/ui`，`utils` → `$lib/utils`，`hooks` → `$lib/hooks`），baseColor 为 `slate`，registry 指向 `https://shadcn-svelte.com/registry`。

新增一个尚未安装的组件：

```bash
npx shadcn-svelte@latest add <component>
# 例如
npx shadcn-svelte@latest add data-table
```

CLI 会把组件源码写入 `src/lib/components/ui/<component>/`。**删除**直接删掉对应目录即可（CLI 不提供 remove 命令）；删除后请检查没有页面再引用它。由于源码就在仓库内，可直接编辑这些文件来定制样式或行为。

### 文档

每个组件的完整 props/插槽/示例见 shadcn-svelte 官方文档：<https://shadcn-svelte.com/docs/components>。底层无障碍/交互由 `bits-ui` 提供。

---

## 3. Shared 复用业务组件

全部从 barrel 统一导入（`src/lib/components/shared/index.ts`）：

```svelte
import {
  PageContainer, PageHeader, StatCard, StatusBadge, DataTable, EmptyState,
  ConfirmDialog, ThemeToggle, LanguageToggle, Spinner, SearchInput, CommandMenu,
  type Column, type BadgeTone
} from '$lib/components/shared';
```

> 类型 `Column` 由 `DataTable.svelte` 导出、`BadgeTone` 由 `StatusBadge.svelte` 导出，均经 barrel 再导出。

---

### PageContainer

`src/lib/components/shared/PageContainer.svelte` — 每个页面的标准居中内容容器，提供统一的最大宽度、响应式内边距与垂直间距（`mx-auto w-full max-w-7xl p-4 sm:p-6 space-y-6`）。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `children` | `Snippet` | （必填） | 否 | 页面内容 |
| `class` | `string` | `undefined` | 否 | 追加/覆盖容器类名 |

```svelte
<PageContainer>
  <PageHeader title="Users" />
  <!-- 页面其余内容 -->
</PageContainer>
```

---

### PageHeader

`src/lib/components/shared/PageHeader.svelte` — 页面标题块，含可选描述与右侧 action 插槽（按钮、菜单等）。小屏自动堆叠。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `string` | （必填） | 否 | 主标题 |
| `description` | `string` | `undefined` | 否 | 副标题 / 描述 |
| `actions` | `Snippet` | `undefined` | 否 | 右侧操作区（如「新增」按钮） |
| `class` | `string` | `undefined` | 否 | 追加类名 |

```svelte
<PageHeader title="Users" description="Manage team members, their roles and access.">
  {#snippet actions()}
    <Button onclick={openAdd}>
      <Plus class="size-4" />
      Add user
    </Button>
  {/snippet}
</PageHeader>
```

---

### StatCard

`src/lib/components/shared/StatCard.svelte` — 基于 `Card` 原语的 KPI 磁贴。展示标题、大数值、可选前置图标，以及可选趋势（带色箭头 + 百分比）。`change` 是带符号数字（如 `12.5` → `+12.5%`），`trend` 决定颜色；若不传 `trend` 则由 `change` 的正负自动推断。

视觉细节（来自源码）：图标渲染为右上角的靛蓝**图标芯片**（`bg-primary/10 text-primary`、`rounded-lg`、`size-9`）；趋势渲染为带底色的**药丸**（`up` → 翠绿、`down` → 红色、`neutral` → 中性 `bg-muted` 底）而非松散文字；数值与趋势百分比用 `tabular-nums` 等宽数字对齐；整卡有细微的 hover 提升（`transition-shadow hover:shadow-md`）。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `string` | （必填） | 否 | 指标名称 |
| `value` | `string \| number` | （必填） | 否 | 主数值（`tabular-nums` 渲染） |
| `icon` | `Component` | `undefined` | 否 | 右上角图标组件（如 Lucide 图标），渲染为靛蓝图标芯片 |
| `change` | `number` | `undefined` | 否 | 带符号变化值，渲染为 `+12.5%` 药丸 |
| `trend` | `'up' \| 'down' \| 'neutral'` | `undefined` | 否 | 显式趋势，优先于 `change` 推断 |
| `hint` | `string` | `undefined` | 否 | 趋势后的辅助文案（如 "vs last week"） |
| `class` | `string` | `undefined` | 否 | 追加类名 |

趋势药丸配色：`up` → `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`，`down` → `bg-red-500/10 text-red-600 dark:text-red-400`，`neutral` → `bg-muted text-muted-foreground`。

```svelte
<script lang="ts">
  import { StatCard } from '$lib/components/shared';
  import DollarSign from '@lucide/svelte/icons/dollar-sign';
</script>

<StatCard
  title="Revenue"
  value="$48,200"
  icon={DollarSign}
  change={12.5}
  hint="vs last week"
/>
```

---

### StatusBadge

`src/lib/components/shared/StatusBadge.svelte` — 统一上色的状态/角色药丸（pill）。在基础 `Badge` 原语之上，按语义化的 `tone` 解析出柔和底色 + 匹配文字色，把全站「角色 / 状态」标签的配色约定收敛到**单一来源**：页面只选 `tone`，不再各自手写颜色类。Users / Tables / Orders / Billing 等页面均复用它来渲染角色与状态。

`StatusBadge` 与类型 `BadgeTone` 都从 `$lib/components/shared` barrel 导出。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `tone` | `BadgeTone` | `'neutral'` | 否 | 语义化色调，决定底色与文字色 |
| `class` | `string` | `undefined` | 否 | 追加/覆盖类名 |
| `children` | `Snippet` | （必填） | 否 | 药丸内容（标签文字） |

`BadgeTone` 取值与对应底色：

```ts
type BadgeTone = 'neutral' | 'outline' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
```

| tone | 底色 / 文字 |
| --- | --- |
| `neutral` | `bg-muted text-foreground`（透明边） |
| `outline` | `border-border text-muted-foreground`（仅描边） |
| `brand` | `bg-primary/10 text-primary` |
| `success` | `bg-emerald-500/15 text-emerald-600 dark:text-emerald-400` |
| `warning` | `bg-amber-500/15 text-amber-600 dark:text-amber-400` |
| `danger` | `bg-red-500/15 text-red-600 dark:text-red-400` |
| `info` | `bg-blue-500/15 text-blue-600 dark:text-blue-400` |

```svelte
<script lang="ts">
  import { StatusBadge, type BadgeTone } from '$lib/components/shared';

  // 页面把领域状态映射到语义 tone，配色约定仍只活在 StatusBadge 内。
  function statusTone(status: 'active' | 'invited' | 'suspended'): BadgeTone {
    return status === 'active' ? 'success' : status === 'invited' ? 'warning' : 'danger';
  }
</script>

<StatusBadge tone={statusTone(user.status)}>{statusLabel(user.status)}</StatusBadge>
```

> 这是状态/角色药丸的唯一来源；新增页面渲染状态时应复用 `StatusBadge`，而不是手写 `Badge` + 颜色类。`DataTable` 的状态单元格即用它渲染。

---

### EmptyState

`src/lib/components/shared/EmptyState.svelte` — 列表/表格/区域无内容时的居中占位。含可选图标、标题、描述与 action 插槽（如「创建」按钮）。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `icon` | `Component` | `undefined` | 否 | 顶部圆形图标 |
| `title` | `string` | （必填） | 否 | 主文案 |
| `description` | `string` | `undefined` | 否 | 辅助说明 |
| `action` | `Snippet` | `undefined` | 否 | 操作区（如按钮） |
| `class` | `string` | `undefined` | 否 | 追加类名 |

```svelte
<script lang="ts">
  import { EmptyState } from '$lib/components/shared';
  import { Button } from '$lib/components/ui/button';
  import Inbox from '@lucide/svelte/icons/inbox';
</script>

<EmptyState icon={Inbox} title="No items" description="Create your first item to get started.">
  {#snippet action()}
    <Button>Create item</Button>
  {/snippet}
</EmptyState>
```

> `DataTable` 内部在无数据时即用此组件渲染空态。

---

### Spinner

`src/lib/components/shared/Spinner.svelte` — 极简、可访问的加载指示器，包装 Lucide `loader-circle` 图标并加 `animate-spin`。尺寸/颜色通过合并到 `class` 控制（默认 `size-4 animate-spin text-muted-foreground`）。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `class` | `string` | `undefined` | 否 | 控制尺寸/颜色，如 `size-6 text-primary` |

```svelte
<Spinner class="size-6 text-primary" />
```

---

### SearchInput

`src/lib/components/shared/SearchInput.svelte` — 带前置搜索图标的文本框，以及仅在有值时出现的尾部清除（x）按钮。`value` 可绑定。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `value` | `string` | `''` | **是** | 搜索文本，`bind:value` |
| `placeholder` | `string` | `'Search...'` | 否 | 占位符（同时作为 aria-label） |
| `class` | `string` | `undefined` | 否 | 追加类名 |

```svelte
<script lang="ts">
  import { SearchInput } from '$lib/components/shared';
  let query = $state('');
</script>

<SearchInput bind:value={query} placeholder="Search users..." />
```

---

### ConfirmDialog

`src/lib/components/shared/ConfirmDialog.svelte` — 基于 `AlertDialog` 原语的「是/否」确认框。`open` 可绑定；`onConfirm` 可为 async，执行期间确认按钮显示 Spinner 且两个动作均禁用，成功后自动关闭。`destructive` 变体把确认按钮设为危险样式，适合删除流程。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | `false` | **是** | 弹窗开关，`bind:open` |
| `title` | `string` | （必填） | 否 | 标题 |
| `description` | `string` | `undefined` | 否 | 描述 |
| `confirmText` | `string` | `'Confirm'` | 否 | 确认按钮文案 |
| `cancelText` | `string` | `'Cancel'` | 否 | 取消按钮文案 |
| `variant` | `'default' \| 'destructive'` | `'default'` | 否 | 确认按钮样式 |
| `onConfirm` | `() => void \| Promise<void>` | （必填） | 否 | 确认回调，可 async |

```svelte
<script lang="ts">
  import { ConfirmDialog } from '$lib/components/shared';
  let deleteOpen = $state(false);
  function confirmDelete() { /* 删除逻辑 */ }
</script>

<ConfirmDialog
  bind:open={deleteOpen}
  variant="destructive"
  title="Delete user?"
  description="This cannot be undone."
  confirmText="Delete"
  onConfirm={confirmDelete}
/>
```

---

### ThemeToggle

`src/lib/components/shared/ThemeToggle.svelte` — ghost 图标按钮，通过 `mode-watcher` 的 `toggleMode` 切换明/暗主题。暗色显示 Sun、亮色显示 Moon，并做交叉淡入过渡。**无 props**。

```svelte
<script lang="ts">
  import { ThemeToggle } from '$lib/components/shared';
</script>

<ThemeToggle />
```

> 依赖根 layout 中挂载的 `<ModeWatcher />`（见 [第 6 节](#6-stores-与全局-helper)）。

---

### LanguageToggle

`src/lib/components/shared/LanguageToggle.svelte` — 下拉菜单，列出 i18n 的可用 locale（`LOCALES`），通过 `setLocale` 切换；当前 locale 打勾。**无 props**。

```svelte
<script lang="ts">
  import { LanguageToggle } from '$lib/components/shared';
</script>

<LanguageToggle />
```

> locale 列表与切换逻辑来自 `$lib/i18n`（见 [第 6 节](#6-stores-与全局-helper)）。

---

### CommandMenu

`src/lib/components/shared/CommandMenu.svelte` — ⌘K / Ctrl+K 命令面板。基于 `$lib/shell/nav` 的 `navGroups` 分组列出所有导航路由，选中即 `goto` 跳转。组件挂载时注册全局 `keydown`，因此任意位置可唤起；`open` 可绑定，便于父组件（如顶栏搜索按钮）也能控制。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | `false` | **是** | 面板开关，`bind:open` |

```svelte
<script lang="ts">
  import { CommandMenu } from '$lib/components/shared';
  let commandOpen = $state(false);
</script>

<Button onclick={() => (commandOpen = true)}>Search…</Button>
<CommandMenu bind:open={commandOpen} />
```

---

### DataTable

`src/lib/components/shared/DataTable.svelte` — 通用的**纯客户端**数据表（无后端）。这是 shared 层最核心的组件。

**特性（全部在客户端）：**

- 对标记 `searchable` 的列做文本搜索
- 对标记 `sortable` 的列点击排序（asc → desc → asc）
- 通过 `usePagination` hook + `ui/pagination` 原语分页
- 可选行选择（复选框列，`selected` 可绑定）
- 加载骨架态；无数据时渲染 `EmptyState`
- 自定义单元格（`cell`）、每行操作（`actions`）、工具栏（`toolbar`）三个 snippet 钩子

**视觉约定（来自源码）：**

- 列表头为**大写 + 弱化 + 字距加宽**（`text-xs font-medium tracking-wide text-muted-foreground uppercase`），表头行带 `bg-muted/50` 底。
- 行密度更舒展：单元格沿用 `table-cell` 的内边距（来自 `ui/table` 原语）。
- 底部计数文案用 `whitespace-nowrap` 防止换行；分页右对齐——`Pagination.Root` 传入 `class="mx-0 w-auto justify-end"`。
- 状态/角色单元格统一用 [`StatusBadge`](#statusbadge) 渲染（见下方真实用法）。

#### `Column<T>` 接口

从文件 `module` 块导出（经 shared barrel 再导出为类型）：

```ts
export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  class?: string;
  align?: 'left' | 'right' | 'center';
  /** 用于显示、搜索与排序的自定义取值函数。 */
  render?: (row: T) => string | number;
}
```

> 组件签名为 `generics="T extends { id: string | number }"`，即每行**必须有 `id` 字段**（用作 key 与选择标识）。
> 取值优先用 `render`，否则取 `row[column.key]`。

#### Props

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `data` | `T[]` | （必填） | 否 | 行数据数组 |
| `columns` | `Column<T>[]` | （必填） | 否 | 列定义 |
| `searchable` | `boolean` | `false` | 否 | 是否显示搜索框（仅作用于 `searchable` 列） |
| `selectable` | `boolean` | `false` | 否 | 是否显示行选择复选框列 |
| `loading` | `boolean` | `false` | 否 | 显示骨架行 |
| `pageSize` | `number` | `10` | 否 | 每页行数 |
| `emptyTitle` | `string` | `'No results'` | 否 | 空态标题 |
| `emptyDescription` | `string` | `'There is nothing to show here yet.'` | 否 | 空态描述 |
| `selected` | `(string \| number)[]` | `[]` | **是** | 已选行的 id 列表，`bind:selected` |
| `cell` | `Snippet<[T, Column<T>]>` | `undefined` | 否 | 自定义单元格渲染，接收 `(row, column)` |
| `actions` | `Snippet<[T]>` | `undefined` | 否 | 行尾操作列，接收 `(row)` |
| `toolbar` | `Snippet` | `undefined` | 否 | 工具栏额外控件（位于搜索框左侧） |

#### Snippet 钩子说明

- **`cell`** — 若提供，则每个单元格用它渲染；通过 `column.key` 分支决定每列内容。不提供时默认渲染 `valueOf(row, column)`。
- **`actions`** — 渲染在每行最右侧的操作列（默认右对齐）。
- **`toolbar`** — 渲染在表格上方工具区左侧；只要 `searchable` 或 `toolbar` 任一存在，工具区就会出现。

#### 真实用法（来自 `src/routes/(app)/users/+page.svelte`）

列定义：

```ts
const columns: Column<DemoUser>[] = [
  { key: 'name', header: 'Name', sortable: true, searchable: true },
  { key: 'email', header: 'Email', searchable: true },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
  { key: 'createdAt', header: 'Joined', sortable: true }
];
```

完整表格（搜索 + 选择 + toolbar + cell + actions）。状态/角色单元格用 `StatusBadge`，行操作是**内联图标按钮**：

```svelte
<DataTable
  data={users}
  {columns}
  searchable
  selectable
  bind:selected
  emptyTitle="No users"
  emptyDescription="Add your first user to get started."
>
  {#snippet toolbar()}
    <Button variant="outline" size="sm" onclick={exportCsv}>
      <Download class="size-4" />
      Export CSV
    </Button>
    {#if selected.length > 0}
      <Button variant="outline" size="sm" onclick={() => (bulkDeleteOpen = true)}>
        <Trash2 class="size-4 text-red-500" />
        Delete selected ({selected.length})
      </Button>
    {/if}
  {/snippet}

  {#snippet cell(row, column)}
    {#if column.key === 'name'}
      <div class="flex items-center gap-3">
        <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {initials(row.name)}
        </span>
        <a href={`/users/${row.id}`} class="hover:text-primary font-medium text-foreground hover:underline">
          {row.name}
        </a>
      </div>
    {:else if column.key === 'email'}
      <span class="text-muted-foreground">{row.email}</span>
    {:else if column.key === 'role'}
      <StatusBadge tone={roleTone(row.role)}>{roleLabel(row.role)}</StatusBadge>
    {:else if column.key === 'status'}
      <StatusBadge tone={statusTone(row.status)}>{statusLabel(row.status)}</StatusBadge>
    {:else if column.key === 'createdAt'}
      <span class="text-muted-foreground">{formatDate(row.createdAt)}</span>
    {/if}
  {/snippet}

  {#snippet actions(row)}
    <div class="flex items-center justify-end gap-0.5">
      <Button variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground size-8"
        title="View" aria-label={`View ${row.name}`} onclick={() => openView(row)}>
        <Eye class="size-4" />
      </Button>
      <Button variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground size-8"
        title="Edit" aria-label={`Edit ${row.name}`} onclick={() => openEdit(row)}>
        <Pencil class="size-4" />
      </Button>
      <Button variant="ghost" size="icon" class="text-muted-foreground hover:text-destructive size-8"
        title="Delete" aria-label={`Delete ${row.name}`} onclick={() => requestDelete(row)}>
        <Trash2 class="size-4" />
      </Button>
    </div>
  {/snippet}
</DataTable>
```

> `selected` 与 `users` 在父组件中是 `$state`，`bind:selected` 让批量删除/导出能读到当前选择。表格内部用 `usePagination` 管理分页，并随筛选/排序结果自动更新 `total` 与回到第 1 页。
>
> 注意 `columns` 现含 `role`、`status` 两列，二者都通过页面的 `roleTone()` / `statusTone()` 映射为 `BadgeTone` 后交给 `StatusBadge` 渲染（见 Users 页源码）。行操作已从下拉菜单改为内联的 View / Edit / Delete 图标按钮。

#### 推荐模式：用 Sheet 抽屉做增/改/查（来自 Users 页）

Users 页的 add / edit / view 已从居中的 `Dialog` 改为右侧 **`Sheet` 抽屉**（`$lib/components/ui/sheet`）。这是表单/详情类交互的推荐写法——更适合较长的表单，且不遮挡主内容。约定结构：

- `Sheet.Content` 传 `side="right" class="gap-0 sm:max-w-lg!"`；
- `Sheet.Header` 加 `border-b`；
- 主体可滚动（`flex-1 ... overflow-y-auto p-4`，外层 `flex min-h-0 flex-1 flex-col`）；
- `Sheet.Footer` 用 `flex-row justify-end border-t`，操作按钮右对齐。

```svelte
<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  let dialogOpen = $state(false);
</script>

<Sheet.Root bind:open={dialogOpen}>
  <Sheet.Content side="right" class="gap-0 sm:max-w-lg!">
    <Sheet.Header class="border-b">
      <Sheet.Title>{dialogTitle}</Sheet.Title>
      <Sheet.Description>Update the details for this user.</Sheet.Description>
    </Sheet.Header>

    <form class="flex min-h-0 flex-1 flex-col" onsubmit={...}>
      <div class="flex-1 space-y-4 overflow-y-auto p-4">
        <!-- 表单字段 -->
      </div>
      <Sheet.Footer class="flex-row justify-end border-t">
        <Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
        <Button type="submit">Save changes</Button>
      </Sheet.Footer>
    </form>
  </Sheet.Content>
</Sheet.Root>
```

> 配套地，`DataTable` 的行操作改为内联图标按钮（View / Edit / Delete，见上方 `actions` 片段），而不再是下拉菜单。删除仍走 [`ConfirmDialog`](#confirmdialog)。

---

## 4. Shell 布局外壳

从 barrel 导入（`src/lib/shell/index.ts`）：

```svelte
import { AppShell, AppSidebar, AppHeader, Breadcrumbs, NotificationsMenu, navGroups, findNavItem } from '$lib/shell';
import type { NavItem, NavGroup } from '$lib/shell';
```

### AppShell 组合方式

`src/lib/shell/AppShell.svelte` 是顶层后台布局：`Sidebar.Provider` 包裹 `AppSidebar` 与 `Sidebar.Inset`（内含 `AppHeader` + `<main>`）。

| prop | 类型 | 默认值 | bindable | 说明 |
| --- | --- | --- | --- | --- |
| `children` | `Snippet` | （必填） | 否 | 页面内容，渲染进 `<main>` |

```svelte
<!-- 典型用法：在 (app) 路由组的 +layout.svelte 中 -->
<script lang="ts">
  import { AppShell } from '$lib/shell';
  let { children } = $props();
</script>

<AppShell>
  {@render children()}
</AppShell>
```

结构（来自源码）：

```svelte
<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <AppHeader />
    <main class="flex flex-1 flex-col">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
```

### 配置导航 — `src/lib/shell/nav.ts`

这是改导航的唯一入口。`AppSidebar`、`CommandMenu`、`Breadcrumbs` 都消费这里的 `navGroups`，所以**改一处即全站生效**。

数据模型：

```ts
export interface NavItem {
  title: string;
  href: string;
  icon: Component;       // Lucide 图标组件
  badge?: string | number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
```

真实结构（`navGroups`）：

```ts
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }]
  },
  {
    label: 'Management',
    items: [
      { title: 'Users', href: '/users', icon: Users },
      { title: 'Tables', href: '/tables', icon: Table },
      { title: 'Forms', href: '/forms', icon: ClipboardList }
    ]
  },
  {
    label: 'Showcase',
    items: [
      { title: 'Components', href: '/components', icon: ComponentIcon },
      { title: 'Charts', href: '/charts', icon: ChartLine }
    ]
  },
  {
    label: 'Account',
    items: [
      { title: 'Profile', href: '/profile', icon: User },
      { title: 'Settings', href: '/settings', icon: Settings }
    ]
  }
];
```

**新增一个导航项**：在对应组的 `items` 里加一条，并 import 一个 Lucide 图标；侧边栏、命令面板、面包屑会自动同步。可选 `badge` 会在侧边栏渲染为 `Sidebar.MenuBadge`。

`findNavItem` — 把 `pathname` 匹配到 href 为最长前缀的导航项（用于面包屑与高亮）：

```ts
/** 返回 href 是 pathname 最长前缀的导航项及其所属组，无匹配则 undefined。 */
export function findNavItem(
  pathname: string
): { group: NavGroup; item: NavItem } | undefined
```

匹配规则为 `pathname === item.href || pathname.startsWith(item.href + '/')`，并在多个命中中取 `href` 最长者。

### 各 shell 组件职责

| 组件 | 文件 | 职责 |
| --- | --- | --- |
| **AppSidebar** | `AppSidebar.svelte` | 品牌头、按 `navGroups` 分组的导航（基于 `page.url.pathname` 高亮当前项）、底部用户下拉（Profile / Settings / Logout，调用 `auth`）。`Sidebar.Root collapsible="icon"` 支持折叠为图标条。**无 props**。 |
| **AppHeader** | `AppHeader.svelte` | 内嵌于 `Sidebar.Inset` 的 sticky 顶栏：`Sidebar.Trigger`、`Breadcrumbs`、搜索按钮（打开 `CommandMenu`，⌘K）、`NotificationsMenu`、`LanguageToggle`、`ThemeToggle`、用户头像下拉菜单。文案走 `t()` i18n。**无 props**。 |
| **Breadcrumbs** | `Breadcrumbs.svelte` | 由当前路径 + `findNavItem` 推导面包屑：`Home → 组标签 → 导航项 → 余下路径段`（路径段做 title-case）。无匹配时直接按路径段构建。**无 props**。 |
| **NotificationsMenu** | `NotificationsMenu.svelte` | 带未读角标的铃铛下拉，列出 `notifications` store 的条目；按类型（info/success/warning）配图标与颜色；支持单条 `markRead` 与 `markAllRead`。**无 props**。 |

---

## 5. Hooks

位于 `src/lib/hooks/`，均为 Svelte 5 runes 模块（`.svelte.ts`），返回带 getter 的响应式容器，只能在组件/effect 等 runes 上下文中使用。

### usePagination — `use-pagination.svelte.ts`

无头分页控制器，管理 `page`/`pageSize`/`total` 并派生分页 UI 所需的全部值，含窗口化页码列表（`-1` 表示省略号）。

```ts
export const PAGE_SIZE_OPTIONS: readonly number[]; // [10, 20, 50, 100]

export interface PaginationOptions {
  pageSize?: number;
  total?: number;
  initialPage?: number;
}

export function usePagination(opts?: PaginationOptions): Pagination;
```

返回的 `Pagination`：可写字段 `page` / `pageSize` / `total`；只读派生 `totalPages` / `start` / `end` / `hasPrev` / `hasNext` / `pages`（窗口化页码，`-1` 为省略号）；方法 `setPage(p)` / `next()` / `prev()` / `setTotal(n)` / `setPageSize(n)`。`page` 始终自动夹在 `[1, totalPages]` 内。

```ts
const pagination = usePagination({ pageSize: 20 });
pagination.setTotal(rows.length);
const slice = rows.slice(
  (pagination.page - 1) * pagination.pageSize,
  pagination.page * pagination.pageSize
);
```

> `DataTable` 内部即用它驱动分页（见 DataTable 源码）。

### useDebounce — `use-debounce.svelte.ts`

防抖一个响应式值。传入读取响应式状态的 thunk，`current` 在 `delayMs` 静默后才更新。

```ts
export function useDebounce<T>(getValue: () => T, delayMs?: number): { readonly current: T };
// delayMs 默认 300
```

```ts
let search = $state('');
const debounced = useDebounce(() => search, 300);
// 在 $derived / $effect 中读取 debounced.current
```

### useMediaQuery — `use-media-query.svelte.ts`

基于 Svelte 的响应式 `MediaQuery`，SSR 安全，匹配结果变化时自动更新。

```ts
export function useMediaQuery(query: string): { readonly matches: boolean };
```

```ts
const wide = useMediaQuery('(min-width: 1024px)');
// 在标记或 $derived 中读取 wide.matches
```

### useLocalStorage — `use-local-storage.svelte.ts`

响应式 localStorage 容器，返回 `{ current }`；客户端读取已存值、每次变更写回。SSR 安全（服务端用 `initial`，不触碰 storage）。

```ts
export function useLocalStorage<T>(key: string, initial: T): { current: T };
```

```ts
const theme = useLocalStorage('admin-starter:theme', 'system');
theme.current = 'dark'; // 同时更新响应式状态与 localStorage
```

### IsMobile — `is-mobile.svelte.ts`

`MediaQuery` 子类，断点默认 768px（即 `max-width: 767px` 命中视为移动端）。读 `.current`。

```ts
export class IsMobile extends MediaQuery {
  constructor(breakpoint?: number); // 默认 768
}
```

```ts
const isMobile = new IsMobile();
// isMobile.current === true 表示窗口 < 768px
```

---

## 6. Stores 与全局 helper

### persisted() — `src/lib/stores/persisted.svelte.ts`

可复用的 runes 持久化状态：初始化时从 localStorage 读取，`current` 变更时写回。SSR 安全（`browser` 守卫）。

```ts
export function persisted<T>(key: string, initial: T): { current: T };
```

```ts
const sidebarOpen = persisted('admin-starter:sidebar', true);
sidebarOpen.current = false; // 自动持久化
```

> 与 `useLocalStorage` 行为类似；`persisted` 是 store 层的通用单例式写法，`useLocalStorage` 是 hook 层封装。两者择一即可。

### notifications — `src/lib/stores/notifications.svelte.ts`

内存版通知 store（mock 单例），已注入若干演示条目供顶栏铃铛展示。直接 import 单例 `notifications`。

```ts
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export const notifications; // 单例
```

可用成员：`notifications.items`（只读数组）、`notifications.unread`（未读数）、`markRead(id)`、`markAllRead()`、`remove(id)`。

```ts
import { notifications } from '$lib/stores/notifications.svelte';

const unread = $derived(notifications.unread);
notifications.markAllRead();
```

> `NotificationsMenu` 即消费此 store。

### toast — `svelte-sonner`

toast 提示来自 `svelte-sonner`。渲染入口 `<Toaster />`（`$lib/components/ui/sonner`）已挂在根 layout：

```svelte
<!-- src/routes/+layout.svelte -->
<Toaster richColors position="top-right" />
```

页面里直接调用 `toast`：

```ts
import { toast } from 'svelte-sonner';

toast.success('User updated');
toast.success('User added');
toast.error('Something went wrong');
```

### theme — `mode-watcher`

主题（明/暗）由 `mode-watcher` 管理。根 layout 挂载 `<ModeWatcher />`：

```svelte
<!-- src/routes/+layout.svelte -->
<ModeWatcher />
```

切换与读取：

```ts
import { toggleMode, mode } from 'mode-watcher';

toggleMode();                          // 明 ↔ 暗
const isDark = mode.current === 'dark'; // 读取当前模式
```

> `ThemeToggle` 即封装了 `toggleMode` + `mode`。

### i18n — `$lib/i18n`

轻量自研 i18n（无外部库），响应式 `locale` + 点路径 `t()` 查找 + `{var}` 插值 + 持久化到 `localStorage` 键 `admin-starter:locale`。支持 `en` 与 `zh-CN`。

```ts
import { t, setLocale, initLocale, i18n, LOCALES, type Locale } from '$lib/i18n';
```

| 导出 | 说明 |
| --- | --- |
| `t(key, vars?)` | 按点路径翻译当前 locale 的文案；缺失时回退到 `en` 再回退到 key 本身。`vars` 用于 `{var}` 插值。 |
| `setLocale(l)` | 切换并持久化 locale |
| `initLocale()` | 从 localStorage 恢复 locale（在根 layout 的 `onMount` 调用） |
| `i18n.locale` | 只读当前 locale |
| `LOCALES` | `{ value: Locale; label: string }[]`，即 `[{ value: 'en', label: 'English' }, { value: 'zh-CN', label: '简体中文' }]` |
| `Locale` | 类型 `'en' \| 'zh-CN'` |

```svelte
<script lang="ts">
  import { t } from '$lib/i18n';
</script>

<span>{t('common.search')}</span>
```

根 layout 在 `onMount` 中调用 `initLocale()` 恢复语言（同时 `auth.init()` 恢复会话）。`LanguageToggle` 即基于 `LOCALES` / `setLocale` / `i18n.locale`。

---

## 7. Utils 工具函数

### formatters — `src/lib/utils/formatters.ts`

纯格式化 helper，无运行时依赖，服务端/客户端均可 import。

| 函数 | 签名 | 说明 |
| --- | --- | --- |
| `formatCurrency` | `(amount: number, currency = 'USD', locale = 'en-US') => string` | 本地化货币 |
| `formatNumber` | `(value: number, options?: Intl.NumberFormatOptions) => string` | 带分组的数字（locale 固定 en-US） |
| `formatDate` | `(date: Date \| string \| number \| null \| undefined, opts?: Intl.DateTimeFormatOptions) => string` | 本地化日期，默认中等格式（如 "Jun 9, 2026"）；无效输入返回 `''` |
| `formatDateTime` | `(date: Date \| string \| number \| null \| undefined) => string` | 含时间的日期（如 "Jun 9, 2026, 3:04 PM"） |
| `formatRelativeTime` | `(date: Date \| string \| number) => string` | 相对时间（如 "3 hours ago" / "in 2 days"） |
| `toISODate` | `(date: Date \| string \| number) => string` | 转 `YYYY-MM-DD`（本地时区） |
| `initials` | `(name: string) => string` | 取最多两位大写首字母（"Jane Doe" → "JD"） |

```ts
import { formatCurrency, formatDate, initials } from '$lib/utils/formatters';

formatCurrency(48200);          // "$48,200.00"
formatDate('2026-06-09');       // "Jun 9, 2026"
initials('Jane Doe');           // "JD"
```

### csv — `src/lib/utils/csv.ts`

浏览器侧文件下载与 CSV 导出。SSR 守卫（无 `document` 时为 no-op）。

| 函数 | 签名 | 说明 |
| --- | --- | --- |
| `downloadBlob` | `(content: BlobPart, filename: string, mime = 'text/plain') => void` | 触发浏览器下载 |
| `exportToCsv` | `<T extends object>(rows: T[], filename: string, columns?: { key: keyof T; header: string }[]) => void` | 导出对象数组为 CSV。传 `columns` 则只导出指定列（按序，用给定表头）；否则用首行所有键。会加 UTF-8 BOM 以便 Excel 正确识别。 |

真实用法（来自 users 页）：

```ts
import { exportToCsv } from '$lib/utils/csv';

exportToCsv(rows, 'users.csv', [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
  { key: 'createdAt', header: 'Joined' }
]);
```

### validators — `src/lib/utils/validators.ts`

可复用的 zod schema 与逐字段错误读取 helper。

| 导出 | 类型 / 签名 | 说明 |
| --- | --- | --- |
| `emailSchema` | `z.ZodString` | trim + 必填 + 合法邮箱 |
| `passwordSchema` | `z.ZodString` | 至少 8 位 |
| `loginSchema` | `z.object({ email, password })` | 登录表单 |
| `userSchema` | `z.object({ name, email, role })`，`role` 为 `'admin' \| 'editor' \| 'viewer'` | 用户表单 |
| `LoginInput` | `z.infer<typeof loginSchema>` | 类型 |
| `UserInput` | `z.infer<typeof userSchema>` | 类型 |
| `fieldError` | `(err: z.ZodError \| null, path: string) => string \| undefined` | 取某字段（点路径）的首条错误信息 |

真实用法（来自 users 页）：

```ts
import { userSchema, fieldError } from '$lib/utils/validators';
import { z } from 'zod';

let errors = $state<z.ZodError | null>(null);

function save() {
  const result = userSchema.safeParse({ name: form.name, email: form.email, role: form.role });
  if (!result.success) {
    errors = result.error;
    return;
  }
  errors = null;
  // ...使用 result.data
}
```

```svelte
{#if fieldError(errors, 'email')}
  <p class="text-xs text-red-500">{fieldError(errors, 'email')}</p>
{/if}
```

> `cn()`（合并/去重 Tailwind 类名）从 `$lib/utils` 导出，被几乎所有组件用于合并 `class` prop。
