# 设计指引 (Design Guide)

本指引描述 **Svelte Admin Starter** 的设计系统：所有颜色、圆角、间距、排版、阴影与明暗主题如何通过一套语义化 token 统一驱动。整体风格为 **「Refined neutral + indigo」（精致中性 + 靛蓝）**，灵感取自 Linear / Vercel —— 冷调近中性表面带一丝靛蓝色调（hue 269），品牌强调色为一抹自信的靛蓝，深度来自柔和的分层阴影而非厚重边框。所有数值与类名均取自真实源码（`src/app.css`、`src/app.html`、`components.json` 与共享组件），可直接复制使用。

## 目录

- [1. 设计理念](#1-设计理念)
- [2. 颜色系统](#2-颜色系统)
  - [2.1 核心语义 token](#21-核心语义-token)
  - [2.2 Sidebar token](#22-sidebar-token)
  - [2.3 Chart token](#23-chart-token)
- [3. 明暗模式](#3-明暗模式)
- [4. 圆角与间距](#4-圆角与间距)
- [5. 排版](#5-排版)
- [6. 阴影与高度（Elevation）](#6-阴影与高度elevation)
- [7. 图表配色](#7-图表配色)
- [8. 状态色约定](#8-状态色约定)
- [9. 自定义变体（Custom variants）](#9-自定义变体custom-variants)
- [10. 滚动条](#10-滚动条)
- [11. 如何自定义主题](#11-如何自定义主题)

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

token 全部以 [OKLCH](https://oklch.com/) 色彩空间定义（`oklch(L C H)` 或带 alpha 的 `oklch(L C H / α)`），相比 HSL/RGB 更感知均匀，便于成套调节明度与对比度。品牌靛蓝固定在 **hue 269**；连中性色（background / foreground / border / muted…）也带极低彩度的 269 冷色调，让整套界面在视觉上统一偏冷。

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

> `components.json` 中 `baseColor` 为 `slate`，这是 shadcn-svelte 添加新组件时生成的中性灰基色，与上方手写的「精致中性 + 靛蓝」主题协调一致。

### 2.1 核心语义 token

下表为每个 token 的用途、light/dark 的真实 OKLCH 取值（抄自 `src/app.css`），以及生成的 Tailwind 工具类。

| token | 用途 | Light (`:root`) | Dark (`.dark`) | Tailwind 类 |
|---|---|---|---|---|
| `background` | 页面整体背景（`body` 默认） | `oklch(0.99 0.003 269)` | `oklch(0.17 0.008 269)` | `bg-background` |
| `foreground` | 页面正文文字（`body` 默认） | `oklch(0.21 0.025 269)` | `oklch(0.96 0.004 269)` | `text-foreground` |
| `card` | 卡片/面板背景 | `oklch(1 0 0)` | `oklch(0.205 0.01 269)` | `bg-card` |
| `card-foreground` | 卡片内文字 | `oklch(0.21 0.025 269)` | `oklch(0.96 0.004 269)` | `text-card-foreground` |
| `popover` | 弹出层（菜单/下拉/Tooltip）背景 | `oklch(1 0 0)` | `oklch(0.205 0.01 269)` | `bg-popover` |
| `popover-foreground` | 弹出层内文字 | `oklch(0.21 0.025 269)` | `oklch(0.96 0.004 269)` | `text-popover-foreground` |
| `primary` | 主操作色（主按钮、激活态、强调） | `oklch(0.545 0.205 269)` | `oklch(0.62 0.19 269)` | `bg-primary` |
| `primary-foreground` | 主色背景上的文字 | `oklch(0.985 0.002 269)` | `oklch(0.99 0.003 269)` | `text-primary-foreground` |
| `secondary` | 次操作色（次级按钮/徽章） | `oklch(0.965 0.006 269)` | `oklch(0.26 0.012 269)` | `bg-secondary` |
| `secondary-foreground` | 次色背景上的文字 | `oklch(0.25 0.03 269)` | `oklch(0.96 0.004 269)` | `text-secondary-foreground` |
| `muted` | 弱化背景（TabsList、占位块、头像底色） | `oklch(0.967 0.005 269)` | `oklch(0.26 0.012 269)` | `bg-muted` |
| `muted-foreground` | 次要/辅助文字（描述、占位） | `oklch(0.552 0.026 269)` | `oklch(0.705 0.025 269)` | `text-muted-foreground` |
| `accent` | 悬停/选中高亮背景 | `oklch(0.95 0.015 269)` | `oklch(0.28 0.02 269)` | `bg-accent` |
| `accent-foreground` | accent 背景上的文字 | `oklch(0.42 0.16 269)` | `oklch(0.96 0.004 269)` | `text-accent-foreground` |
| `destructive` | 危险/删除操作色 | `oklch(0.585 0.22 25)` | `oklch(0.7 0.19 22)` | `bg-destructive` / `text-destructive` |
| `border` | 边框、分隔线 | `oklch(0.925 0.006 269)` | `oklch(1 0 0 / 9%)` | `border-border` |
| `input` | 输入框背景 | `oklch(1 0 0)` | `oklch(1 0 0 / 12%)` | `bg-input` |
| `ring` | 聚焦轮廓（focus ring） | `oklch(0.545 0.205 269 / 50%)` | `oklch(0.62 0.19 269 / 55%)` | `ring-ring` |
| `chart-1` | 图表系列 1（靛蓝 indigo） | `oklch(0.545 0.205 269)` | `oklch(0.66 0.18 269)` | 见[第 7 节](#7-图表配色) |
| `chart-2` | 图表系列 2（天蓝 azure） | `oklch(0.62 0.16 232)` | `oklch(0.7 0.15 232)` | — |
| `chart-3` | 图表系列 3（青色 cyan） | `oklch(0.7 0.13 195)` | `oklch(0.76 0.12 195)` | — |
| `chart-4` | 图表系列 4（紫罗兰 violet） | `oklch(0.6 0.2 305)` | `oklch(0.68 0.18 305)` | — |
| `chart-5` | 图表系列 5（粉色 pink） | `oklch(0.64 0.21 350)` | `oklch(0.7 0.19 350)` | — |

> **靛蓝品牌色（light 与 dark 不同）**：`--primary` 在亮色下为 `oklch(0.545 0.205 269)`，在暗色下**提亮**为 `oklch(0.62 0.19 269)`（L 0.545 → 0.62）——同一靛蓝 hue 269，但在深色背景上调亮以保证按钮/链接的对比度与可见度。两套取值都必须保留：暗色直接复用亮色那一档会显得发暗、缺乏存在感。

> 注意 `destructive` 的用法：在 button 组件里它常以低透明度填充 + 实色文字呈现（`bg-destructive/10 ... text-destructive`），而非纯实色背景。引用时按场景搭配透明度修饰符（如 `bg-destructive/10`、`ring-destructive/50`）。

### 2.2 Sidebar token

侧边栏拥有独立的一组 token，以便在视觉上与主内容区轻微区分：亮色下是一块略带冷调的浅灰面板（区别于纯白内容卡片），暗色下比 `background` / `card` 更深一档（`oklch(0.185 …)`），形成一个微微凹陷的导航区。

| token | 用途 | Light (`:root`) | Dark (`.dark`) | Tailwind 类 |
|---|---|---|---|---|
| `sidebar` | 侧栏背景 | `oklch(0.985 0.004 269)` | `oklch(0.185 0.009 269)` | `bg-sidebar` |
| `sidebar-foreground` | 侧栏文字 | `oklch(0.32 0.02 269)` | `oklch(0.86 0.01 269)` | `text-sidebar-foreground` |
| `sidebar-primary` | 侧栏激活项主色 | `oklch(0.545 0.205 269)` | `oklch(0.62 0.19 269)` | `bg-sidebar-primary` |
| `sidebar-primary-foreground` | 侧栏激活项文字 | `oklch(0.985 0.002 269)` | `oklch(0.99 0.003 269)` | `text-sidebar-primary-foreground` |
| `sidebar-accent` | 侧栏悬停/选中高亮 | `oklch(0.94 0.018 269)` | `oklch(0.28 0.025 269)` | `bg-sidebar-accent` |
| `sidebar-accent-foreground` | 侧栏高亮项文字 | `oklch(0.42 0.16 269)` | `oklch(0.92 0.02 269)` | `text-sidebar-accent-foreground` |
| `sidebar-border` | 侧栏边框/分隔 | `oklch(0.925 0.006 269)` | `oklch(1 0 0 / 7%)` | `border-sidebar-border` |
| `sidebar-ring` | 侧栏内 focus ring | `oklch(0.545 0.205 269 / 50%)` | `oklch(0.62 0.19 269 / 55%)` | `ring-sidebar-ring` |

### 2.3 Chart token

`chart-1` 到 `chart-5` 用于数据可视化的多系列配色，详见[第 7 节](#7-图表配色)。

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

### 字体（Typeface）

UI 字体为 **Geist**（Vercel 出品的几何无衬线字体），等宽字体为 **Geist Mono**，提供干净、现代的界面气质。两者在 `src/app.html` 通过 Google Fonts 加载（并 `preconnect` 预连接以减少加载延迟）：

```html
<!-- src/app.html -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap"
  rel="stylesheet"
/>
```

字体栈在 `src/app.css` 的 `@theme inline` 块中通过 `--font-sans` / `--font-mono` 声明（生成 `font-sans` / `font-mono` 工具类），并带完整的回退链（Geist → Inter → 系统字体）：

```css
/* src/app.css */
@theme inline {
  --font-sans: "Geist", "Inter", ui-sans-serif, system-ui, -apple-system,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas,
    monospace;
}
```

`body` 默认应用 `font-sans antialiased`（见 `@layer base` 中 `body { @apply bg-background text-foreground font-sans antialiased; }`），因此全站正文即为 Geist；需要等宽（代码、数字、token 值）时显式加 `font-mono`。

> **生产环境建议**：当前从 Google Fonts CDN 加载，开发期最省事。若要避免第三方请求、消除字体闪烁并提升隐私/可靠性，可改为通过 [`@fontsource`](https://fontsource.org/)（如 `@fontsource/geist-sans`、`@fontsource/geist-mono`）自托管字体，再在本地 `import` 即可，`--font-sans` / `--font-mono` 无需改动。

### 排版刻度

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

## 6. 阴影与高度（Elevation）

本主题的深度来自**柔和、分层的阴影**，而非厚重边框——卡片、弹出层等用阴影托起，边框只作极轻的分隔。`@theme inline` 定义了一套带冷色调（hue 269）的阴影刻度 `--shadow-2xs … --shadow-xl`（生成 `shadow-2xs`、`shadow-xs`、`shadow-sm`、`shadow-md`、`shadow-lg`、`shadow-xl` 工具类）：

```css
/* src/app.css */
@theme inline {
  --shadow-2xs: 0 1px 2px 0 oklch(0.21 0.03 269 / 0.04);
  --shadow-xs: 0 1px 2px 0 oklch(0.21 0.03 269 / 0.05);
  --shadow-sm: 0 1px 2px -1px oklch(0.21 0.03 269 / 0.08),
    0 1px 3px 0 oklch(0.21 0.03 269 / 0.05);
  --shadow-md: 0 2px 4px -2px oklch(0.21 0.03 269 / 0.07),
    0 4px 8px -2px oklch(0.21 0.03 269 / 0.06);
  --shadow-lg: 0 4px 8px -3px oklch(0.21 0.03 269 / 0.08),
    0 12px 20px -4px oklch(0.21 0.03 269 / 0.07);
  --shadow-xl: 0 8px 16px -4px oklch(0.21 0.03 269 / 0.09),
    0 20px 32px -8px oklch(0.21 0.03 269 / 0.09);
}
```

| 类 | 层级 | 典型用途 |
|---|---|---|
| `shadow-2xs` / `shadow-xs` | 极轻（单层） | 贴地元素、输入框、细微抬起 |
| `shadow-sm` | 轻（双层） | 卡片、按钮的默认抬起 |
| `shadow-md` | 中（双层） | 悬浮态、下拉触发器 |
| `shadow-lg` | 高（双层） | 弹出层、菜单、对话框 |
| `shadow-xl` | 最高（双层） | 模态、需要明显悬浮感的浮层 |

约定：

- 阴影颜色统一用品牌冷调 `oklch(0.21 0.03 269 / α)`，靠 alpha 控制强度，因此阴影本身带一丝靛蓝、与整体色系协调。
- 从 `shadow-sm` 起均为**多层叠加**（一层贴近的硬阴影 + 一层扩散的软阴影），更接近真实环境光，避免单层阴影的「贴纸感」。
- **卡片优先用阴影表达层级，而非加重边框**——边框保持极轻（亮色 `oklch(0.925 …)`、暗色 `oklch(1 0 0 / 9%)`）。

---

## 7. 图表配色

数据可视化使用 `chart-1` 到 `chart-5` 五个 token。它们不再是早期的「彩虹/暖色」杂色，而是一条**以品牌靛蓝为锚点的统一色带**：靛蓝 → 天蓝 → 青 → 紫罗兰 → 粉（indigo → azure → cyan → violet → pink）。亮、暗模式各定义一套（暗色整体提亮以适配深背景），但**色相顺序一致**，因此同一指标在明暗下读到的是同一种颜色（取值见[第 2.1 节](#21-核心语义-token)表格末尾）。

色带取值（hue 固定，明暗仅调明度/彩度）：

| token | 含义 | Light | Dark |
|---|---|---|---|
| `chart-1` | 靛蓝 indigo（品牌锚点） | `oklch(0.545 0.205 269)` | `oklch(0.66 0.18 269)` |
| `chart-2` | 天蓝 azure | `oklch(0.62 0.16 232)` | `oklch(0.7 0.15 232)` |
| `chart-3` | 青 cyan | `oklch(0.7 0.13 195)` | `oklch(0.76 0.12 195)` |
| `chart-4` | 紫罗兰 violet | `oklch(0.6 0.2 305)` | `oklch(0.68 0.18 305)` |
| `chart-5` | 粉 pink | `oklch(0.64 0.21 350)` | `oklch(0.7 0.19 350)` |

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

## 8. 状态色约定

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

## 9. 自定义变体（Custom variants）

除了 `dark`，`src/app.css` 顶部还声明了两个**方向变体**，供「方向感知」的基础组件（slider 滑块、toggle group 分段按钮组）使用：

```css
/* src/app.css */
@custom-variant data-horizontal (&[data-orientation="horizontal"]);
@custom-variant data-vertical (&[data-orientation="vertical"]);
```

它们把 `data-horizontal:` / `data-vertical:` 前缀映射到元素自身的 `[data-orientation="…"]` 属性。这类组件（如 Bits UI 的 slider）会在 DOM 上输出 `data-orientation="horizontal"`，组件内部据此用 `data-horizontal:h-1.5 data-vertical:w-1.5` 之类的类来决定轨道是横向取高度、还是纵向取宽度。

> **为什么必须有**：缺少这两个变体时，像 `data-horizontal:h-1.5` 这样的类**永远不会匹配**到带 `data-orientation` 的元素，slider 的轨道高度退化为 0（轨道不可见、滑块「悬空」）。这是纯样式声明、无运行时成本，但去掉会直接破坏这些原生方向组件。

---

## 10. 滚动条

全站滚动条经过统一美化——纤细、圆角、无箭头无轨道，颜色由 `muted-foreground` 经 `color-mix` 调出半透明，悬停时加深。它在 `@layer base` 中对**所有**滚动容器（页面、下拉、popover 等原生滚动区）生效，无需手动加类：

```css
/* src/app.css（节选） */
@layer base {
  * {
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--muted-foreground) 35%, transparent) transparent;
  }
  /* WebKit/Blink */
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background-color: transparent; }
  ::-webkit-scrollbar-thumb {
    background-color: color-mix(in srgb, var(--muted-foreground) 35%, transparent);
    border: 2px solid transparent;       /* 透明内边距 → 视觉更纤细 */
    border-radius: 9999px;
    background-clip: content-box;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: color-mix(in srgb, var(--muted-foreground) 55%, transparent);
  }
  ::-webkit-scrollbar-corner { background-color: transparent; }
}
```

因为颜色取自 `--muted-foreground`，滚动条自动随明暗主题适配，无需写 `dark:` 分支。

此外，`html` 永远预留滚动条的「沟槽」，防止在「有滚动条的长页面」与「无滚动条的短页面」之间切换时产生横向跳动（layout shift）：

```css
/* src/app.css */
@layer base {
  html {
    scrollbar-gutter: stable;
  }
}
```

> 这是全局默认行为，已取代早期需要手动添加的 `.custom-scrollbar` 工具类——现在任意滚动容器都自动获得一致的滚动条，无需额外类名。

---

## 11. 如何自定义主题

### 改 token 值（换主色/换肤）

最常见的定制是改主操作色。只需在 `src/app.css` 同时更新 `:root` 与 `.dark` 下的 `--primary`（及其 `-foreground`），全站主按钮、激活态、链接强调会一并更新——无需改任何组件：

```css
/* src/app.css */
:root {
  --primary: oklch(0.545 0.205 269);          /* 改成你的品牌色 */
  --primary-foreground: oklch(0.985 0.002 269);
}
.dark {
  --primary: oklch(0.62 0.19 269);            /* 暗色通常需提亮一档 */
  --primary-foreground: oklch(0.99 0.003 269);
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

> 滚动条已是全局默认样式（见[第 10 节](#10-滚动条)），不再需要 `.custom-scrollbar` 之类的工具类；任意滚动容器自动获得一致外观。

### 无障碍注意点（Accessibility）

- **聚焦轮廓（focus ring）**：交互元素必须保留基于 `ring` token 的 `focus-visible` 轮廓，便于键盘用户定位。button 组件已内建（`focus-visible:border-ring focus-visible:ring-ring/50 ... focus-visible:ring-3`）；自定义交互元素请参照外观页分段控件的写法：
  ```svelte
  class="… focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none …"
  ```
  不要用 `outline-none` 去掉聚焦反馈而不补回 ring。

- **对比度**：始终成对使用 `X` + `X-foreground`（如 `bg-primary text-primary-foreground`），这些配对已按对比度设计。自定义新色时，请在 light 与 dark 两种主题下验证文字对比度达标（建议正文 ≥ 4.5:1）。状态色已为暗色单独提供更亮的 `dark:text-*-400` 变体即为此目的。

- **不要仅靠颜色传达信息**：状态徽章除了颜色还带文字标签（如 `Active`/`Suspended`），图标按钮带 `aria-label`（见 `ThemeToggle` 的 `aria-label={label}`）。新增组件请沿用这一约定。

- **autofill 覆盖**：`app.css` 在 `@layer` 之外强制覆盖了浏览器自动填充的背景与文字色，且现在改用 token 变量（`-webkit-box-shadow: 0 0 0px 1000px var(--input) inset; -webkit-text-fill-color: var(--foreground);`，`caret-color: var(--foreground)`），因此**明暗主题安全**——自动填充态会跟随 `--input` / `--foreground` 自动变色，不会再在暗色下出现亮底填充。避免 Chrome 默认黄色填充破坏输入框配色。改输入框配色时无需再手动同步颜色，只要 token 正确即可。
