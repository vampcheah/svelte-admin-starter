# 设计指引 (Design Guide)

本指引描述 **Svelte Admin Starter** 的设计系统：所有颜色、圆角、间距、排版与明暗主题如何通过一套语义化 token 统一驱动。所有数值与类名均取自真实源码（`src/app.css`、`components.json` 与共享组件），可直接复制使用。

## 目录

- [1. 设计理念](#1-设计理念)
- [2. 颜色系统](#2-颜色系统)
  - [2.1 核心语义 token](#21-核心语义-token)
  - [2.2 Sidebar token](#22-sidebar-token)
  - [2.3 Chart token](#23-chart-token)
- [3. 明暗模式](#3-明暗模式)
- [4. 圆角与间距](#4-圆角与间距)
- [5. 排版](#5-排版)
- [6. 图表配色](#6-图表配色)
- [7. 状态色约定](#7-状态色约定)
- [8. 如何自定义主题](#8-如何自定义主题)

---

## 1. 设计理念

本项目的设计系统建立在三条原则之上：

1. **语义化 token（Semantic tokens）**
   颜色不以「它长什么样」命名（如 `blue-500`），而是以「它的用途」命名（如 `primary`、`muted`、`destructive`）。组件只引用语义名，渲染时由 CSS 变量解析为具体 OKLCH 值。这样换肤、换主色时只改 token 定义，组件代码零改动。

2. **明暗双主题（Light / Dark）**
   每个 token 在 `:root`（亮色）与 `.dark`（暗色）下各有一套取值。组件写一次类名 `bg-card text-card-foreground`，在两种主题下自动呈现正确对比度，无需在组件里写 `dark:` 分支去切颜色。

3. **只用 token，不写死颜色**
   业务组件中**禁止**出现 `#3b82f6`、`text-blue-600` 之类的硬编码颜色。一律使用语义类（`bg-primary`、`text-muted-foreground`、`border-border`…）。
   唯一例外是少量**状态色徽章**（success/warning/danger），它们直接使用 Tailwind 调色板的固定色阶并显式提供 `dark:` 变体，详见[第 7 节](#7-状态色约定)。

token 全部以 [OKLCH](https://oklch.com/) 色彩空间定义（`oklch(L C H)` 或带 alpha 的 `oklch(L C H / α)`），相比 HSL/RGB 更感知均匀，便于成套调节明度与对比度。

---

## 2. 颜色系统

token 在 `src/app.css` 中分两步声明：

- 在 `:root` / `.dark` 中定义裸 CSS 变量（如 `--primary`）。
- 在 `@theme inline { ... }` 中把它们映射为 Tailwind 颜色（`--color-primary: var(--primary)`），从而生成 `bg-primary`、`text-primary`、`border-primary` 等工具类。

```css
/* src/app.css */
@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* …其余 token 同理 */
}
```

大多数语义色成对出现：`X`（背景/填充）+ `X-foreground`（其上文字）。`-foreground` 经过设计以保证在对应 `X` 背景上达到足够对比度——配对使用即可，例如 `bg-primary text-primary-foreground`。

> `components.json` 中 `baseColor` 为 `slate`，这是 shadcn-svelte 添加新组件时生成的中性灰基色，与上方手写的蓝灰主题协调一致。

### 2.1 核心语义 token

下表为每个 token 的用途、light/dark 的真实 OKLCH 取值（抄自 `src/app.css`），以及生成的 Tailwind 工具类。

| token | 用途 | Light (`:root`) | Dark (`.dark`) | Tailwind 类 |
|---|---|---|---|---|
| `background` | 页面整体背景（`body` 默认） | `oklch(0.99 0.005 250)` | `oklch(0.129 0.042 264.695)` | `bg-background` |
| `foreground` | 页面正文文字（`body` 默认） | `oklch(0.2 0.04 260)` | `oklch(0.984 0.003 247.858)` | `text-foreground` |
| `card` | 卡片/面板背景 | `oklch(1 0 0)` | `oklch(0.208 0.042 265.755)` | `bg-card` |
| `card-foreground` | 卡片内文字 | `oklch(0.2 0.04 260)` | `oklch(0.984 0.003 247.858)` | `text-card-foreground` |
| `popover` | 弹出层（菜单/下拉/Tooltip）背景 | `oklch(0.97 0.01 250)` | `oklch(0.208 0.042 265.755)` | `bg-popover` |
| `popover-foreground` | 弹出层内文字 | `oklch(0.2 0.04 260)` | `oklch(0.984 0.003 247.858)` | `text-popover-foreground` |
| `primary` | 主操作色（主按钮、激活态、强调） | `oklch(0.55 0.16 250)` | `oklch(0.929 0.013 255.508)` | `bg-primary` |
| `primary-foreground` | 主色背景上的文字 | `oklch(0.98 0.01 250)` | `oklch(0.208 0.042 265.755)` | `text-primary-foreground` |
| `secondary` | 次操作色（次级按钮/徽章） | `oklch(0.92 0.02 250)` | `oklch(0.279 0.041 260.031)` | `bg-secondary` |
| `secondary-foreground` | 次色背景上的文字 | `oklch(0.2 0.04 260)` | `oklch(0.984 0.003 247.858)` | `text-secondary-foreground` |
| `muted` | 弱化背景（TabsList、占位块、头像底色） | `oklch(0.92 0.02 250)` | `oklch(0.279 0.041 260.031)` | `bg-muted` |
| `muted-foreground` | 次要/辅助文字（描述、占位） | `oklch(0.5 0.04 250)` | `oklch(0.704 0.04 256.788)` | `text-muted-foreground` |
| `accent` | 悬停/选中高亮背景 | `oklch(0.88 0.03 250)` | `oklch(0.279 0.041 260.031)` | `bg-accent` |
| `accent-foreground` | accent 背景上的文字 | `oklch(0.2 0.04 260)` | `oklch(0.984 0.003 247.858)` | `text-accent-foreground` |
| `destructive` | 危险/删除操作色 | `oklch(0.6 0.2 25)` | `oklch(0.704 0.191 22.216)` | `bg-destructive` / `text-destructive` |
| `border` | 边框、分隔线 | `oklch(0.85 0.02 250)` | `oklch(1 0 0 / 35%)` | `border-border` |
| `input` | 输入框背景 | `oklch(1 0 0)` | `oklch(1 0 0 / 30%)` | `bg-input` |
| `ring` | 聚焦轮廓（focus ring） | `oklch(0.55 0.16 250 / 50%)` | `oklch(0.551 0.027 264.364)` | `ring-ring` |
| `chart-1` | 图表系列 1 | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` | 见[第 6 节](#6-图表配色) |
| `chart-2` | 图表系列 2 | `oklch(0.6 0.118 184.704)` | `oklch(0.696 0.17 162.48)` | — |
| `chart-3` | 图表系列 3 | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)` | — |
| `chart-4` | 图表系列 4 | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` | — |
| `chart-5` | 图表系列 5 | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` | — |

> 注意 `destructive` 的用法：在 button 组件里它常以低透明度填充 + 实色文字呈现（`bg-destructive/10 ... text-destructive`），而非纯实色背景。引用时按场景搭配透明度修饰符（如 `bg-destructive/10`、`ring-destructive/50`）。

### 2.2 Sidebar token

侧边栏拥有独立的一组 token，以便在视觉上与主内容区轻微区分（亮色下略深、暗色下与卡片同色）。

| token | 用途 | Light (`:root`) | Dark (`.dark`) | Tailwind 类 |
|---|---|---|---|---|
| `sidebar` | 侧栏背景 | `oklch(0.98 0.01 250)` | `oklch(0.208 0.042 265.755)` | `bg-sidebar` |
| `sidebar-foreground` | 侧栏文字 | `oklch(0.2 0.04 260)` | `oklch(0.984 0.003 247.858)` | `text-sidebar-foreground` |
| `sidebar-primary` | 侧栏激活项主色 | `oklch(0.55 0.16 250)` | `oklch(0.488 0.243 264.376)` | `bg-sidebar-primary` |
| `sidebar-primary-foreground` | 侧栏激活项文字 | `oklch(0.98 0.01 250)` | `oklch(0.984 0.003 247.858)` | `text-sidebar-primary-foreground` |
| `sidebar-accent` | 侧栏悬停/选中高亮 | `oklch(0.92 0.02 250)` | `oklch(0.279 0.041 260.031)` | `bg-sidebar-accent` |
| `sidebar-accent-foreground` | 侧栏高亮项文字 | `oklch(0.2 0.04 260)` | `oklch(0.984 0.003 247.858)` | `text-sidebar-accent-foreground` |
| `sidebar-border` | 侧栏边框/分隔 | `oklch(0.9 0.02 250)` | `oklch(1 0 0 / 10%)` | `border-sidebar-border` |
| `sidebar-ring` | 侧栏内 focus ring | `oklch(0.55 0.16 250 / 50%)` | `oklch(0.551 0.027 264.364)` | `ring-sidebar-ring` |

### 2.3 Chart token

`chart-1` 到 `chart-5` 用于数据可视化的多系列配色，详见[第 6 节](#6-图表配色)。

---

## 3. 明暗模式

### `.dark` class 机制

主题切换基于在 `<html>` 上挂载/移除 `.dark` 类。`:root` 提供亮色取值，`.dark` 覆盖为暗色取值。`app.css` 顶部声明了自定义变体：

```css
/* src/app.css */
@custom-variant dark (&:is(.dark *));
```

它告诉 Tailwind：`dark:` 前缀的工具类只在某个祖先带有 `.dark` 类时生效（即 `.dark` 下的任意后代）。因此组件可写 `dark:scale-0`、`dark:text-emerald-400` 等暗色专属样式。

### `mode-watcher`

主题状态由 [`mode-watcher`](https://github.com/svecosystem/mode-watcher) 库管理，它负责读写 `<html>` 的 `.dark` 类、监听系统偏好、并持久化用户选择。`<ModeWatcher />` 已挂在**根布局** `src/routes/+layout.svelte`：

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  // …
</script>

<ModeWatcher />
<Toaster richColors position="top-right" />

{@render children()}
```

> `ModeWatcher` 在挂载前会注入一段防闪烁脚本，避免页面首帧出现亮色再跳暗色（FOUC）。务必保持它挂在根布局，不要移除。

### 用 `ThemeToggle` 快速切换

`src/lib/components/shared/ThemeToggle.svelte` 是一个最小切换按钮，调用 `toggleMode()` 在亮/暗之间翻转，并用 `mode.current` 决定无障碍标签与图标淡入淡出：

```svelte
<!-- src/lib/components/shared/ThemeToggle.svelte -->
<script lang="ts">
  import Sun from '@lucide/svelte/icons/sun';
  import Moon from '@lucide/svelte/icons/moon';
  import { toggleMode, mode } from 'mode-watcher';
  import { Button } from '$lib/components/ui/button';

  const label = $derived(mode.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
</script>

<Button variant="ghost" size="icon" onclick={toggleMode} aria-label={label} title={label}>
  <Sun class="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" aria-hidden="true" />
  <Moon class="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" aria-hidden="true" />
</Button>
```

### 三态切换（Light / Dark / System）

外观设置页 `src/routes/(app)/settings/appearance/+page.svelte` 演示了完整的三态控制。它用 `setMode(value)` 设置 `'light' | 'dark' | 'system'`，并自行持久化「System」意图（因为 `mode.current` 只暴露解析后的 `'light' | 'dark'`）：

```svelte
<!-- settings/appearance/+page.svelte（节选） -->
<script lang="ts">
  import { setMode, mode } from 'mode-watcher';
  import { persisted } from '$lib/stores/persisted.svelte';

  type ThemeMode = 'light' | 'dark' | 'system';

  const selectedMode = persisted<ThemeMode>('admin-starter:theme-pref', 'system');

  function selectMode(value: ThemeMode): void {
    selectedMode.current = value;
    setMode(value);
  }

  // 用于驱动实时预览的解析后外观
  const resolved = $derived(mode.current ?? 'light');
</script>
```

切换 API 速查：

| API | 来自 | 作用 |
|---|---|---|
| `toggleMode()` | `mode-watcher` | 在 light / dark 间翻转 |
| `setMode('light' \| 'dark' \| 'system')` | `mode-watcher` | 显式设定模式 |
| `mode.current` | `mode-watcher` | 当前**解析后**模式（`'light'` / `'dark'`，响应式） |

---

## 4. 圆角与间距

### 圆角 `--radius`

圆角的单一真值是 `--radius`，在 `:root` 中为 `0.625rem`（即 10px）。`@theme inline` 把它派生为四档圆角刻度：

```css
/* src/app.css */
:root {
  --radius: 0.625rem;
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px); /* 6px  */
  --radius-md: calc(var(--radius) - 2px); /* 8px  */
  --radius-lg: var(--radius);             /* 10px */
  --radius-xl: calc(var(--radius) + 4px); /* 14px */
}
```

对应 Tailwind 类与典型用途：

| 类 | 解析值 | 典型用途 |
|---|---|---|
| `rounded-sm` | 6px | 小标签、嵌套元素 |
| `rounded-md` | 8px | 分段控件内的按钮、下拉项 |
| `rounded-lg` | 10px | 卡片、按钮、对话框、输入框（默认主圆角） |
| `rounded-xl` | 14px | 较大的容器/面板 |
| `rounded-full` | — | 头像、圆点徽章（如用户头像 `size-8 rounded-full`） |

调整 `--radius` 这一个值即可整体改变全站圆润度。

### 间距与容器约定

页面统一通过 `PageContainer` 提供居中、限宽与响应式留白。其真实实现：

```svelte
<!-- src/lib/components/shared/PageContainer.svelte -->
<div class={cn('mx-auto w-full max-w-7xl p-4 sm:p-6 space-y-6', className)}>
  {@render children()}
</div>
```

约定：

- **最大宽度**：`max-w-7xl`（80rem）并 `mx-auto` 水平居中。
- **响应式内边距**：移动端 `p-4`，`sm` 及以上 `sm:p-6`。
- **垂直节奏**：`space-y-6` 给直接子块（卡片、表头等）统一纵向间距。
- 卡片内部多用 `space-y-6`/`space-y-4`/`space-y-2` 形成层级化间距（见外观设置页 `Card.Content class="space-y-6"`、表单 `space-y-4`、字段组 `space-y-2`）。

页面的标准骨架：

```svelte
<PageContainer>
  <PageHeader title="Users" description="Manage team members, their roles and access." />
  <!-- 页面内容 -->
</PageContainer>
```

---

## 5. 排版

排版约定集中体现在 `PageHeader`，它定义了页面标题块的标准字号/字重：

```svelte
<!-- src/lib/components/shared/PageHeader.svelte -->
<div class="space-y-1">
  <h1 class="text-2xl font-semibold tracking-tight text-foreground">
    {title}
  </h1>
  {#if description}
    <p class="text-sm text-muted-foreground">{description}</p>
  {/if}
</div>
```

常用排版刻度：

| 场景 | 类 | 说明 |
|---|---|---|
| 页面主标题 | `text-2xl font-semibold tracking-tight text-foreground` | 见 `PageHeader` |
| 页面描述/副文案 | `text-sm text-muted-foreground` | 次要信息一律用 `text-muted-foreground` |
| 正文/默认文字 | 继承 `body` 的 `text-foreground` | 见 `app.css` 的 `body { @apply bg-background text-foreground; }` |
| 强调正文（如表格主字段） | `font-medium text-foreground` | 见 users 页姓名单元格 |
| 小标签/字段说明 | `text-xs` / `text-xs font-medium` | 如徽章、预览标签 |
| 表单内联校验错误 | `text-xs text-red-500` | 见 users 页 `fieldError` 提示 |

排版准则：

- **主文字**用 `text-foreground`（或直接继承 `body`），**次要文字**统一用 `text-muted-foreground`——这是区分信息层级最重要的一条约定。
- 字重以 `font-medium`（强调）和 `font-semibold`（标题）为主，正文默认不加字重。
- 标题配 `tracking-tight` 收紧字距。

---

## 6. 图表配色

数据可视化使用 `chart-1` 到 `chart-5` 五个 token，它们在亮/暗下各自调过明度与色相以保证在两种背景上都清晰可辨（取值见[第 2.1 节](#21-核心语义-token)表格末尾）。

图表组件通过 CSS 变量 `var(--chart-N)` 引用，而非 Tailwind 类。真实用法见 `src/routes/(app)/charts/+page.svelte`：

```svelte
<!-- charts/+page.svelte（节选） -->
<script lang="ts">
  const palette = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'
  ];

  const revenueConfig = {
    revenue: { label: 'Revenue', color: 'var(--chart-1)' }
  };
</script>

<!-- 给某条系列指定颜色 -->
<!-- series={[{ key: 'revenue', label: 'Revenue', color: 'var(--chart-1)' }]} -->
```

用途约定：

- 单系列图优先用 `var(--chart-1)`（如 Revenue、Visitors）。
- 第二系列用 `var(--chart-2)`（如 Orders）。
- 多系列（饼图/分组）按 `chart-1 … chart-5` 顺序循环取色（`palette` 数组）。

因为它们是 token，切换明暗模式时图表配色会随 `.dark` 自动重算，无需在图表代码里写主题分支。

---

## 7. 状态色约定

语义 token 覆盖中性与主操作色，但**业务状态**（成功/警告/危险）使用一套固定语义色：`emerald`（success）、`amber`（warning）、`red`（danger）。它们是本系统中**唯一**允许直接使用 Tailwind 调色板而非 token 的场景，因为状态语义需要稳定、与主题色解耦。

模式：低透明度填充（`/15`）作背景 + 实色文字，并显式提供 `dark:` 变体以保证暗色下可读。真实片段来自 users 页的 `statusClass`：

```ts
// src/routes/(app)/users/+page.svelte（节选）
function statusClass(status: Status): string {
  switch (status) {
    case 'active':
      return 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
    case 'invited':
      return 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400';
    case 'suspended':
      return 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400';
  }
}
```

| 状态 | 语义 | 背景 | 文字（light → dark） |
|---|---|---|---|
| success / active | 正常、成功 | `bg-emerald-500/15` | `text-emerald-600` → `dark:text-emerald-400` |
| warning / invited | 待处理、警告 | `bg-amber-500/15` | `text-amber-600` → `dark:text-amber-400` |
| danger / suspended | 错误、危险 | `bg-red-500/15` | `text-red-600` → `dark:text-red-400` |

> 对照：同一页面里 **角色（role）徽章**走中性/主色 token 路线，证明两套体系各司其职：
> ```ts
> function roleClass(role: Role): string {
>   switch (role) {
>     case 'admin':  return 'border-transparent bg-primary text-primary-foreground';
>     case 'editor': return 'border-transparent bg-secondary text-secondary-foreground';
>     case 'viewer': return 'text-foreground';
>   }
> }
> ```

危险操作的图标也用 red，如批量删除按钮的 `<Trash2 class="size-4 text-red-500" />`。删除类按钮/菜单项则优先使用 `destructive` token（如 `<Button variant="destructive">`、`<DropdownMenu.Item variant="destructive">`）。

---

## 8. 如何自定义主题

### 改 token 值（换主色/换肤）

最常见的定制是改主操作色。只需在 `src/app.css` 同时更新 `:root` 与 `.dark` 下的 `--primary`（及其 `-foreground`），全站主按钮、激活态、链接强调会一并更新——无需改任何组件：

```css
/* src/app.css */
:root {
  --primary: oklch(0.55 0.16 250);          /* 改成你的品牌色 */
  --primary-foreground: oklch(0.98 0.01 250);
}
.dark {
  --primary: oklch(0.929 0.013 255.508);
  --primary-foreground: oklch(0.208 0.042 265.755);
}
```

要整体微调风格，可成套调节明度/对比：例如让暗色更深，下调 `.dark` 中 `--background`/`--card` 的 L 值。改圆润度则改 `--radius` 一处（见[第 4 节](#4-圆角与间距)）。

### 换 baseColor

`components.json` 的 `baseColor` 决定 shadcn-svelte **新增组件**时生成的中性灰基色：

```json
{
  "tailwind": {
    "css": "src/app.css",
    "baseColor": "slate"
  }
}
```

可选值为 shadcn 标准基色（`slate` / `gray` / `zinc` / `neutral` / `stone`）。注意：改它**只影响之后新拉取的组件**，不会回溯改写已有 token；要让现有界面跟上，仍需手动对齐 `app.css` 里的中性 token。

### 滚动条 `.custom-scrollbar`

`app.css` 定义了一个细滚动条工具类，颜色取自 `--border`，悬停时变为 `--muted-foreground`，因此自动适配明暗主题。给任意可滚动容器加上 `class="custom-scrollbar"` 即可启用：

```css
/* src/app.css（节选） */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 20px;
  border: 1px solid transparent;
  background-clip: content-box;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: var(--muted-foreground);
  background-clip: content-box;
}
```

用法：`<div class="overflow-y-auto custom-scrollbar"> … </div>`。

### 无障碍注意点（Accessibility）

- **聚焦轮廓（focus ring）**：交互元素必须保留基于 `ring` token 的 `focus-visible` 轮廓，便于键盘用户定位。button 组件已内建（`focus-visible:border-ring focus-visible:ring-ring/50 ... focus-visible:ring-3`）；自定义交互元素请参照外观页分段控件的写法：
  ```svelte
  class="… focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none …"
  ```
  不要用 `outline-none` 去掉聚焦反馈而不补回 ring。

- **对比度**：始终成对使用 `X` + `X-foreground`（如 `bg-primary text-primary-foreground`），这些配对已按对比度设计。自定义新色时，请在 light 与 dark 两种主题下验证文字对比度达标（建议正文 ≥ 4.5:1）。状态色已为暗色单独提供更亮的 `dark:text-*-400` 变体即为此目的。

- **不要仅靠颜色传达信息**：状态徽章除了颜色还带文字标签（如 `Active`/`Suspended`），图标按钮带 `aria-label`（见 `ThemeToggle` 的 `aria-label={label}`）。新增组件请沿用这一约定。

- **autofill 覆盖**：`app.css` 在 `@layer` 之外强制覆盖了浏览器自动填充的背景与文字色（`input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px white inset; -webkit-text-fill-color: oklch(0.2 0.04 260); }`），避免 Chrome 默认黄色填充破坏输入框配色。改输入框配色时注意同步此处取值。
