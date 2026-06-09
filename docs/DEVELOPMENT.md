# 开发指引（Development Guide）

> Svelte Admin Starter —— 一个基于 **SvelteKit 2 · Svelte 5 (runes) · Tailwind CSS v4 · shadcn-svelte** 的管理后台启动模板。
> 纯前端，无后端：鉴权与数据全部 mock，clone 后即可直接开发业务功能。

本文是项目的权威 onboarding 文档。所有路径均相对仓库根目录 `022_svelte_admin_starter/`。

---

## 目录（Table of Contents）

1. [项目简介 & 技术栈](#1-项目简介--技术栈)
2. [快速开始](#2-快速开始)
3. [npm scripts 说明](#3-npm-scripts-说明)
4. [目录结构](#4-目录结构)
5. [路由与 route groups](#5-路由与-route-groups)
6. [开发约定](#6-开发约定)
7. [常见任务 how-to](#7-常见任务-how-to)
8. [鉴权（Auth）](#8-鉴权auth)
9. [国际化 i18n 用法](#9-国际化-i18n-用法)
10. [构建与部署](#10-构建与部署)

---

## 1. 项目简介 & 技术栈

这是一个开箱即用的管理后台模板：包含登录/注册/找回密码页、带可折叠侧边栏的应用外壳（app shell）、面包屑、命令面板（⌘K）、通知菜单、主题切换、中英双语、状态感知的错误页，以及一组示例页面：Dashboard、Users（含 `users/[id]` 用户详情页）、Tables、Forms、Calendar、Inbox、Board（kanban）、Sales Orders、Cart、Components、Charts、Pricing、Billing、Profile、Settings。所有数据来自 `src/lib/data/`，鉴权来自 `src/lib/auth/`，均为 mock，便于直接替换为真实后端。

### 技术栈（版本取自 `package.json`）

| 技术 | 包名 | 版本 | 说明 |
| --- | --- | --- | --- |
| SvelteKit 2 | `@sveltejs/kit` | `^2.50.1` | 应用框架、路由、SSR |
| Svelte 5 | `svelte` | `^5.48.2` | 组件框架，使用 runes（`$state`/`$derived`/`$props` 等） |
| Tailwind CSS v4 | `tailwindcss` / `@tailwindcss/vite` | `^4.1.18` | 原子化 CSS，通过 Vite 插件接入（无 `tailwind.config.js`） |
| shadcn-svelte | （源码内置，registry: `shadcn-svelte.com`） | — | UI 组件以源码形式 vendored 在 `src/lib/components/ui/` |
| bits-ui | `bits-ui` | `^2.18.1` | shadcn-svelte 底层无样式原语 |
| Lucide 图标 | `@lucide/svelte` | `^1.17.0` | 图标库，按 `@lucide/svelte/icons/<kebab>` 单独导入 |
| 主题切换 | `mode-watcher` | `^1.1.0` | light/dark/system 模式管理 |
| Toast 通知 | `svelte-sonner` | `^1.0.7` | toast 提示 |
| 图表 | `layerchart` | `^2.0.0-next.48` | 图表库（部分页面用纯 SVG + 设计 token 手绘） |
| 表单校验 | `zod` | `^3.25.76` | schema 校验 |
| 表单增强 | `sveltekit-superforms` / `formsnap` | `^2.30.1` / `^2.0.1` | 表单状态/绑定（可选使用） |
| 类名合并 | `clsx` / `tailwind-merge` / `tailwind-variants` | — | `cn()` 工具的底层依赖 |

其它：`@internationalized/date`（calendar）、`embla-carousel-svelte`（carousel）、`paneforge`（resizable）、`vaul-svelte`（drawer）、`date-fns`、`tw-animate-css`。

TypeScript `strict: true`，并对 `.js`/`.svelte` 同样开启类型检查（`tsconfig.json` 中 `checkJs: true`）。

---

## 2. 快速开始

### 前置要求

- **Node.js**：要求 `^20.19.0 || >=22.12.0`（SvelteKit 2 / Vite 7 的最低版本）。`package.json` 已声明该 `engines` 字段，且 `.npmrc` 设置了 `engine-strict=true`，因此不满足版本要求的环境会在 `npm install` 时被拦截。请使用 Node 20.19+ 或 22.12+（推荐最新 LTS）。
- **包管理器**：npm（仓库提供 `package-lock.json`）。

### 安装与启动

```bash
npm install      # 安装依赖（postinstall 会自动跑 svelte-kit sync）
npm run dev      # 启动开发服务器（Vite），默认 http://localhost:5173
```

打开浏览器后访问 `/`，会被重定向到 `/dashboard`；未登录时进一步被守卫重定向到 `/login`。

### 默认登录

登录页预填了演示凭据：

- **Email**：`admin@example.com`
- **Password**：`password`

> ⚠️ 由于鉴权是 mock（见 `src/lib/auth/auth.svelte.ts`），**任意合法邮箱 + 任意 ≥ 8 字符的密码都能登录成功**。校验规则只有两条：email 非空、password 至少 8 个字符。其中邮箱 `admin@example.com` 会被赋予 `admin` 角色，其余邮箱为 `editor` 角色（`buildUser()` 逻辑）。

---

## 3. npm scripts 说明

以下命令逐字摘自 `package.json` 的 `scripts`：

```jsonc
{
  "dev": "vite dev",
  "build": "vite build",
  "preview": "vite preview",
  "prepare": "svelte-kit sync || echo ''",
  "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
  "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
  "lint": "prettier --check . && eslint .",
  "format": "prettier --write ."
}
```

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（HMR） |
| `npm run build` | 生产构建（输出由 adapter 决定，默认 `adapter-auto`） |
| `npm run preview` | 本地预览生产构建产物 |
| `npm run check` | 先 `svelte-kit sync` 生成类型，再用 `svelte-check` 做一次性类型检查 |
| `npm run check:watch` | 同上，watch 模式 |
| `npm run lint` | Prettier 检查格式 + ESLint 检查代码（不修改文件） |
| `npm run format` | Prettier 自动格式化全仓库 |

> `prepare` 是 npm 生命周期钩子，`npm install` 后自动执行 `svelte-kit sync`（生成 `.svelte-kit/` 下的类型与 `$lib`/`$app` 别名），通常无需手动调用。

格式化规则见 `.prettierrc`：使用 Tab 缩进、单引号、`trailingComma: none`、`printWidth: 100`，并启用 `prettier-plugin-svelte` 与 `prettier-plugin-tailwindcss`（后者会自动排序 Tailwind 类名）。

---

## 4. 目录结构

下面是带注释的 `src/` 树（UI 原语目录仅示意，未逐个列出几十个 shadcn 组件）：

```text
src/
├── app.html                 # HTML 外壳模板（theme-color、favicon、%sveltekit.*%）
├── app.css                  # Tailwind 入口 + 设计 token（:root / .dark 的 oklch CSS 变量）
├── app.d.ts                 # SvelteKit 全局类型声明
│
├── routes/                  # 文件系统路由（见第 5 节）
│   ├── +layout.svelte       # 根布局：挂载样式、ModeWatcher、Toaster，恢复 session + locale
│   ├── +layout.ts           # 根布局配置：ssr=true, prerender=false
│   ├── +page.svelte         # 首页（仅在 redirect 前短暂闪现一个 Spinner）
│   ├── +page.ts             # load() 重定向到 /dashboard
│   ├── +error.svelte        # 全局错误边界：状态感知（404/403/5xx），无 shell 的品牌全屏页
│   ├── (auth)/              # 鉴权 route group：登录/注册/找回密码（无 shell）
│   │   ├── +layout.svelte   # 居中卡片画布；已登录则跳转 /dashboard
│   │   ├── login/+page.svelte
│   │   ├── register/+page.svelte
│   │   └── forgot-password/+page.svelte
│   └── (app)/               # 应用 route group：受 mock 守卫保护，套 AppShell
│       ├── +layout.svelte   # 守卫 + AppShell（见第 5 节）
│       ├── +error.svelte    # shell 内错误边界（保留侧边栏 + 顶栏，见第 5 节）
│       ├── dashboard/+page.svelte
│       ├── users/
│       │   ├── +page.svelte         # 用户列表（点击姓名跳转详情）
│       │   └── [id]/                # 用户详情（tab 切换）
│       │       ├── +page.svelte
│       │       └── +page.ts         # load 返回 { breadcrumb: 用户名 }（见第 7 节）
│       ├── tables/+page.svelte
│       ├── forms/+page.svelte
│       ├── calendar/+page.svelte
│       ├── inbox/+page.svelte
│       ├── kanban/+page.svelte
│       ├── orders/+page.svelte
│       ├── cart/+page.svelte
│       ├── components/+page.svelte
│       ├── charts/+page.svelte
│       ├── pricing/+page.svelte
│       ├── billing/+page.svelte
│       ├── profile/+page.svelte
│       └── settings/        # 带嵌套 +layout 的设置区
│           ├── +layout.svelte
│           ├── +page.svelte
│           ├── appearance/+page.svelte
│           └── notifications/+page.svelte
│
└── lib/                     # 可通过 $lib 别名导入的库代码
    ├── index.ts             # $lib 根 barrel（说明各子 barrel 的入口）
    ├── utils.ts             # cn() 类名合并 + shadcn 用到的类型工具（WithElementRef 等）
    │
    ├── components/
    │   ├── ui/              # shadcn-svelte UI 原语（button/card/dialog/sidebar/... 各一个目录，
    │   │                    #   每个目录含若干 .svelte + 一个 index.ts barrel）
    │   └── shared/          # 业务侧可复用组件（在 ui 之上组合而成）
    │       ├── index.ts     #   barrel：PageHeader/PageContainer/StatCard/DataTable/
    │       │                #   EmptyState/ConfirmDialog/ThemeToggle/LanguageToggle/
    │       │                #   Spinner/SearchInput/CommandMenu
    │       └── *.svelte
    │
    ├── shell/               # 应用外壳（侧边栏 + 顶栏 + 面包屑 + 导航模型）
    │   ├── index.ts         #   barrel：AppShell/AppSidebar/AppHeader/Breadcrumbs/
    │   │                    #   NotificationsMenu + navGroups/findNavItem
    │   ├── AppShell.svelte  #   Sidebar.Provider 包裹 AppSidebar 与 inset(header + main)
    │   ├── AppSidebar.svelte#   按 navGroups 渲染侧边栏 + 用户菜单
    │   ├── AppHeader.svelte #   顶栏：trigger/面包屑/搜索(⌘K)/通知/语言/主题/用户菜单
    │   ├── Breadcrumbs.svelte
    │   ├── NotificationsMenu.svelte
    │   └── nav.ts           #   导航数据模型：NavGroup/NavItem + navGroups + findNavItem()
    │
    ├── auth/                # mock 鉴权（见第 8 节）
    │   ├── auth.svelte.ts   #   AuthStore 单例（runes，localStorage 持久化）
    │   ├── types.ts         #   User 接口
    │   └── index.ts         #   barrel：export { auth }, type { User }
    │
    ├── i18n/                # 轻量国际化（见第 9 节）
    │   ├── index.svelte.ts  #   实现：响应式 locale、t()、setLocale、initLocale
    │   ├── index.ts         #   barrel（桥接 .svelte.ts 的目录导入）
    │   └── locales/
    │       ├── en.ts        #   英文字典（嵌套对象，dot-path 查找）
    │       └── zh-CN.ts     #   简体中文字典（结构与 en.ts 完全一致）
    │
    ├── hooks/               # runes-based 复用 hooks
    │   ├── is-mobile.svelte.ts
    │   ├── use-debounce.svelte.ts
    │   ├── use-local-storage.svelte.ts
    │   ├── use-media-query.svelte.ts
    │   └── use-pagination.svelte.ts
    │
    ├── stores/              # 全局响应式状态
    │   ├── persisted.svelte.ts     # persisted<T>(key, initial)：localStorage 同步 store
    │   └── notifications.svelte.ts # 通知列表状态
    │
    ├── utils/               # 纯函数工具
    │   ├── formatters.ts    #   formatCurrency/formatNumber/initials/...（无运行时依赖）
    │   ├── validators.ts    #   zod schema（loginSchema/userSchema）+ fieldError()
    │   └── csv.ts           #   exportToCsv()
    │
    └── data/                # mock 数据（纯 .ts，不含图标）
        ├── dashboard.ts     #   stats / revenueSeries / recentActivity / trafficByChannel
        ├── products.ts
        └── users.ts
```

各层职责约定：

- **`routes/`**：页面与布局，决定 URL 结构与 SSR/守卫行为。
- **`lib/components/ui/`**：shadcn-svelte 原语，**以源码形式 vendored**（不是 npm 包）。可用 `npx shadcn-svelte@latest add <name>` 增量添加，或直接编辑。
- **`lib/components/shared/`**：在 ui 之上封装的业务可复用组件，统一从 `$lib/components/shared` 导入。
- **`lib/shell/`**：应用外壳与导航模型。新增导航项改 `nav.ts` 即可（见第 7 节）。
- **`lib/hooks/` `lib/stores/` `lib/utils/` `lib/i18n/` `lib/auth/` `lib/data/`**：分别是 runes hooks、全局状态、纯工具、国际化、鉴权、mock 数据。

> 别名（`$lib`/`$app`）由 SvelteKit 在 `svelte-kit sync` 时生成到 `.svelte-kit/tsconfig.json`；`tsconfig.json` 仅 `extends` 它。如需自定义别名，请在 `svelte.config.js` 的 `kit.alias` 中扩展（见文件内注释），不要手改生成文件。

---

## 5. 路由与 route groups

项目用两个 **route group** 区分「有外壳的应用页」与「无外壳的鉴权页」。route group 的目录名带括号（`(app)`、`(auth)`），**不会出现在 URL 里**，仅用于共享布局。

### 根布局 `src/routes/+layout.svelte`

全局、与外壳无关。导入样式，挂载主题监听与 toast 容器，并在 `onMount` 时恢复 session 与 locale：

```svelte
<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from '$lib/components/ui/sonner';
  import { auth } from '$lib/auth';
  import { initLocale } from '$lib/i18n';

  let { children } = $props();

  onMount(() => {
    auth.init();
    initLocale();
  });
</script>

<ModeWatcher />
<Toaster richColors position="top-right" />

{@render children()}
```

根布局配置 `src/routes/+layout.ts`：`ssr = true`（首屏快速渲染），`prerender = false`（因为 mock 守卫在客户端解析）。

### 首页重定向 `src/routes/+page.ts`

索引路由只是入口，直接重定向到 dashboard：

```ts
import { redirect } from '@sveltejs/kit';

export function load(): never {
  throw redirect(307, '/dashboard');
}
```

对应的 `+page.svelte` 只在重定向前短暂闪现一个居中 `Spinner`。

### `(auth)` 分组

`src/routes/(auth)/+layout.svelte` 提供一个居中卡片画布（顶部装饰渐变、右上角语言/主题切换、品牌标）。**已登录用户会被弹回 `/dashboard`**：

```svelte
onMount(() => {
  auth.init();
  if (auth.isAuthenticated) goto('/dashboard');
});
```

包含 `login/`、`register/`、`forgot-password/` 三个页面。

### `(app)` 分组与 mock 守卫

`src/routes/(app)/+layout.svelte` 是受保护区的入口：在客户端恢复 session，未登录跳 `/login`，否则把 children 套进 `AppShell`。完整源码如下：

```svelte
<!--
  (app) route-group layout — mock auth guard + admin shell.
  Restores the mock session on the client; redirects to /login when not
  authenticated, otherwise renders the children inside the AppShell.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth';
  import { AppShell } from '$lib/shell';

  let { children } = $props();
  let ready = $state(false);

  onMount(() => {
    auth.init();
    if (!auth.isAuthenticated) goto('/login');
    else ready = true;
  });
</script>

{#if ready}
  <AppShell>{@render children()}</AppShell>
{/if}
```

> 这是**纯客户端守卫**（在 `onMount` 中运行），因此 `prerender` 必须为 false。要接入真实后端时，应改为服务端守卫（见第 8 节）。

`AppShell` 的结构（`src/lib/shell/AppShell.svelte`）：

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

### 错误边界（两层）

项目用两个 `+error.svelte` 处理错误，二者都通过 `$app/state` 的响应式 `page` 读取 `page.status` / `page.error` 做状态感知文案。SvelteKit 没有单独的 404 文件——`+error.svelte` 凭 `page.status` 统一处理 404 与其它所有错误。

**根错误页 `src/routes/+error.svelte`（无 shell）**：顶层错误边界，捕获未匹配路由（404）以及逃出 app shell 的 load/渲染错误。状态感知文案：

- `404` → “Page not found”
- `403` → “Access denied”
- `>= 500` → “Something went wrong”
- 其它 → “Unexpected error”

渲染为一张干净的**品牌全屏页**（无侧边栏 / 顶栏），含大号状态码、说明文案与恢复操作（「Go to dashboard」，404 时附「Go back」、否则附「Try again」）。

**应用内错误页 `src/routes/(app)/+error.svelte`（in-shell）**：当 `(app)` 下某个路由抛错时由它接管，渲染**在 AppShell 内部**，因此侧边栏与顶栏保持可用，导航不中断。同样状态感知（404 → “Page not found”，≥500 → “Something went wrong”，其它 → “Unexpected error”），并提供「Try again」/「Back to dashboard」恢复操作。

---

## 6. 开发约定

### Svelte 5 runes

全项目使用 runes 模式，不再使用 `export let` / `$:` / Svelte stores（`writable` 等）。常用 rune：

- `$state(...)`：可变响应式状态。
  ```ts
  let email = $state('admin@example.com');
  let submitting = $state(false);
  ```
- `$derived(...)`：派生值（替代旧的 `$:`）。
  ```ts
  const firstName = $derived(auth.user?.name?.split(' ')[0] ?? 'there');
  ```
- `$props()`：声明组件 props，配合 TS `interface Props` 使用。
  ```ts
  interface Props {
    title: string;
    description?: string;
    actions?: Snippet;   // snippet 作为「插槽」传入
    class?: string;
  }
  let { title, description, actions, class: className }: Props = $props();
  ```
- `$bindable()`：声明可被父组件 `bind:` 双向绑定的 prop（多见于 ui 原语，如命令面板 `bind:open`）。
- **Snippets**（`{#snippet}` / `{@render}`）替代旧的 `<slot>`。父组件传入命名 snippet：
  ```svelte
  <PageHeader title={...}>
    {#snippet actions()}
      <Button onclick={downloadReport}>Download</Button>
    {/snippet}
  </PageHeader>
  ```
  子组件渲染：`{#if actions}{@render actions()}{/if}`。

> 含 runes 的 `.ts` 模块必须命名为 `*.svelte.ts`（如 `auth.svelte.ts`、`persisted.svelte.ts`、`i18n/index.svelte.ts`），否则编译器不会处理其中的 `$state`/`$derived`。

### 导入约定

- **UI 原语用命名空间导入**（每个原语目录是一个组件族）：
  ```ts
  import * as Card from '$lib/components/ui/card';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  // 用法：<Card.Root> <Card.Header> <Card.Title> ...
  ```
  单组件原语用具名导入：`import { Button } from '$lib/components/ui/button';`、`import { Input } from '$lib/components/ui/input';`。
- **图标按需单独导入**，路径为 `@lucide/svelte/icons/<kebab-case>`：
  ```ts
  import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
  import ChartLine from '@lucide/svelte/icons/chart-line';
  ```
- **`cn()` 来自 `$lib/utils`**，用于合并/去重 Tailwind 类名：
  ```ts
  import { cn } from '$lib/utils';
  class={cn('overflow-hidden', className)}
  ```
- **`page` 来自 `$app/state`**（注意是 `state` 不是已弃用的 `$app/stores`），直接读 `page.url.pathname` / `page.status`：
  ```ts
  import { page } from '$app/state';
  const pathname = $derived(page.url.pathname);
  ```
- **`goto` 来自 `$app/navigation`**：`import { goto } from '$app/navigation';`。
- **共享组件从 barrel 导入**：`import { PageContainer, PageHeader, StatCard } from '$lib/components/shared';`。

### 设计 token 优先

颜色/圆角等一律使用 `src/app.css` 中定义的设计 token（CSS 变量 + 对应的 Tailwind 语义类），**不要硬编码颜色**。优先用 `bg-background` / `text-foreground` / `bg-primary` / `text-muted-foreground` / `border-border` / `bg-card` / `bg-accent` 等语义类；需要原始变量时用 `var(--primary)`（如 Dashboard 里手绘 SVG 图表的描边 `stroke="var(--primary)"`）。这样可天然适配 light/dark 两套主题。

### UI 文案使用英文

模板内置 UI 文案以**英文**为默认语（`en` 是 i18n 的 fallback locale）。新增界面文案时：固定 UI 字符串走 i18n 字典（见第 9 节），临时/页面级文案保持英文，与现有页面一致。

---

## 7. 常见任务 how-to

### 7.1 新增一个 `(app)` 页面

在 `src/routes/(app)/` 下新建目录与 `+page.svelte`，自动受守卫保护并套用 AppShell。推荐用 `PageContainer` + `PageHeader` 保持版式一致：

```svelte
<!-- src/routes/(app)/reports/+page.svelte -->
<script lang="ts">
  import Download from '@lucide/svelte/icons/download';
  import { PageContainer, PageHeader } from '$lib/components/shared';
  import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
  <title>Reports · Admin Starter</title>
</svelte:head>

<PageContainer>
  <PageHeader title="Reports" description="Generated reports and exports.">
    {#snippet actions()}
      <Button>
        <Download class="size-4" aria-hidden="true" />
        Export
      </Button>
    {/snippet}
  </PageHeader>

  <!-- 页面内容 -->
</PageContainer>
```

`PageHeader` 的 props（来自 `PageHeader.svelte`）：`title: string`、`description?: string`、`actions?: Snippet`、`class?: string`。
`PageContainer` 的 props：`children: Snippet`、`class?: string`（统一 `max-w-7xl` + 响应式 padding + `space-y-6`）。

> 动态路由（如 `users/[id]`）若想让叶子面包屑显示友好标签而非原始 id 段，可加一个 `+page.ts`，让其 `load` 返回 `{ breadcrumb: '...' }`（见 7.6）。

### 7.2 在侧边栏新增导航项

导航是数据驱动的——编辑 `src/lib/shell/nav.ts`，往对应 `NavGroup` 的 `items` 里加一条 `NavItem`。`AppSidebar.svelte` 会自动按 `navGroups` 渲染并高亮当前路由。

当前 `navGroups`（顺序与条目均取自 `nav.ts`）：

| 分组 | 条目（title → href） |
| --- | --- |
| **Overview** | Dashboard → `/dashboard` |
| **Management** | Users → `/users`，Tables → `/tables`，Forms → `/forms` |
| **Apps** | Calendar → `/calendar`，Inbox → `/inbox`，Board → `/kanban` |
| **Commerce** | Sales Orders → `/orders`，Cart → `/cart` |
| **Showcase** | Components → `/components`，Charts → `/charts` |
| **Billing** | Pricing → `/pricing`，Billing → `/billing` |
| **Account** | Profile → `/profile`，Settings → `/settings` |

> `users/[id]` 没有自己的导航项——它由 Users 列表里点击姓名进入；活动态由 `findNavItem()` 按「最长 href 前缀」匹配回落到 `/users`。

类型定义（来自 `nav.ts`）：

```ts
export interface NavItem {
  title: string;
  href: string;
  icon: Component;      // 来自 @lucide/svelte/icons/*
  badge?: string | number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
```

步骤：

1. 顶部导入图标：`import FileText from '@lucide/svelte/icons/file-text';`
2. 在某个分组里追加条目，例如把 Reports 加入 `Management` 组：

```ts
{
  label: 'Management',
  items: [
    { title: 'Users', href: '/users', icon: Users },
    { title: 'Tables', href: '/tables', icon: Table },
    { title: 'Forms', href: '/forms', icon: ClipboardList },
    { title: 'Reports', href: '/reports', icon: FileText, badge: 'New' } // 新增
  ]
}
```

`badge` 可选；活动态由 `findNavItem()` / `isActive()` 按「最长 href 前缀」匹配，无需手动处理。

### 7.3 新增一个 shadcn 组件

UI 原语以源码形式存放在 `src/lib/components/ui/`。用 CLI 增量添加（配置已在 `components.json` 中就绪，registry 指向 `https://shadcn-svelte.com/registry`）：

```bash
npx shadcn-svelte@latest add <name>
# 例如：
npx shadcn-svelte@latest add data-table
```

CLI 会按 `components.json` 的别名（`ui` → `$lib/components/ui`，`utils` → `$lib/utils`，`hooks` → `$lib/hooks`）把组件源码写入项目；之后即可 `import * as <Name> from '$lib/components/ui/<name>';`。注意：基础色为 `slate`，CSS 入口为 `src/app.css`。

### 7.4 使用 toast（svelte-sonner）

`Toaster` 已在根布局挂载（`richColors`、`position="top-right"`），页面里直接从 `svelte-sonner` 导入 `toast` 调用即可：

```ts
import { toast } from 'svelte-sonner';

toast.success('Welcome back!');
toast.error('Unable to sign in. Please try again.');
toast.success(next ? 'Compact density enabled' : 'Comfortable density enabled');
```

（示例分别取自 `login/+page.svelte` 与 `settings/appearance/+page.svelte`。）

### 7.5 使用 i18n `t()` 与新增文案

在组件里导入并调用 `t()`，key 为 dot-path，支持 `{var}` 插值：

```ts
import { t } from '$lib/i18n';

t('common.search');                          // -> "Search"
t('dashboard.greeting', { name: firstName }); // -> "Welcome back, <name>"
```

新增一条文案：**同时**在 `src/lib/i18n/locales/en.ts` 和 `zh-CN.ts` 的相同 dot-path 下添加（两个字典结构必须严格一致），例如：

```ts
// en.ts
nav: { /* ... */, reports: 'Reports' }
// zh-CN.ts
nav: { /* ... */, reports: '报表' }
```

> 查找逻辑：先查当前 locale，未命中回退 `en`，再未命中则原样返回 key。所以漏翻译不会崩溃，但会显示英文或 key 本身。

### 7.6 为动态路由覆写面包屑标签

面包屑由 `src/lib/shell/Breadcrumbs.svelte` 根据当前路径 + 导航模型自动生成；动态段（如 `[id]`）默认会显示原始 id。要让叶子面包屑显示友好标签，在该路由下加一个 `+page.ts`，让其 `load` 返回 `{ breadcrumb: '...' }`：

```ts
// src/routes/(app)/users/[id]/+page.ts
import { demoUsers } from '$lib/data/users';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const user = demoUsers.find((u) => u.id === params.id);
  return { breadcrumb: user?.name };
};
```

`Breadcrumbs.svelte` 读取 `page.data.breadcrumb`：当它是非空字符串时，用它替换**最后一个**面包屑的 label（仅当 trail 长度 > 1）。于是 `/users/u_123` 的面包屑会读作「Home › Management › Users › Olivia Martin」而不是原始 id。这就是上述 `users/[id]` 的现成示例。

---

## 8. 鉴权（Auth）

### 当前实现：mock

鉴权是一个 runes 单例 `AuthStore`（`src/lib/auth/auth.svelte.ts`），导出实例 `auth`。**无后端**，session 存在 `localStorage`，key 为 `'admin-starter:session'`。

关键点：

- `auth.login(email, password)` / `auth.register(name, email, password)`：模拟 400ms 延迟，校验「email 非空」「password ≥ 8 字符」后，由邮箱**派生**出一个 `User` 并持久化。返回 `{ ok: boolean; error?: string }`。
- `auth.logout()`：清除内存与 localStorage，并 `goto('/login')`。
- `auth.init()`：从 localStorage 恢复 session（幂等，可重复调用；非浏览器环境直接跳过）。
- 响应式 getter：`auth.user`（`User | null`）、`auth.isAuthenticated`、`auth.loading`。
- 角色：`admin@example.com` → `admin`，其余 → `editor`（`User.role` 类型为 `'admin' | 'editor' | 'viewer'`，见 `auth/types.ts`）。

`User` 接口：

```ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
}
```

守卫位置：`(app)/+layout.svelte`（未登录跳 `/login`）与 `(auth)/+layout.svelte`（已登录跳 `/dashboard`），都在客户端 `onMount` 调 `auth.init()` 后判断。

### 如何接入真实后端

1. **替换 `src/lib/auth/auth.svelte.ts` 的 `login` / `register` / `logout`**：把派生 `User` 的逻辑改为 `fetch` 调用后端鉴权接口，成功后用返回的真实用户信息 `#persist(user)`。保持 `auth.user` / `auth.isAuthenticated` 等 getter 的对外契约不变，调用方（守卫、侧边栏、顶栏）无需改动。建议把 API 基址放到环境变量，例如 SvelteKit 的 `import.meta.env.PUBLIC_API_URL`（`PUBLIC_` 前缀的变量可在客户端读取；定义在 `.env` 中）。
2. **增加服务端守卫**：当前守卫是纯客户端的，会有「先渲染再跳转」的闪烁，且不安全。改为服务端校验更稳妥——在 `(app)/` 下新增 `+layout.server.ts`，在 `load` 中读取 cookie/session 并在未认证时 `throw redirect(302, '/login')`：
   ```ts
   // src/routes/(app)/+layout.server.ts （示例）
   import { redirect } from '@sveltejs/kit';
   export const load = async ({ locals }) => {
     if (!locals.user) throw redirect(302, '/login');
     return { user: locals.user };
   };
   ```
   配合 `src/hooks.server.ts` 解析 cookie 并写入 `event.locals.user`。届时可考虑把根布局 `+layout.ts` 中的 `prerender`/`ssr` 策略一并调整。
3. **环境变量约定**：用 `PUBLIC_API_URL` 之类的 `PUBLIC_` 前缀变量保存后端地址；敏感值（如服务端密钥）用不带前缀的私有变量，仅在 `*.server.ts` 中通过 `$env/static/private` 或 `$env/dynamic/private` 读取。

---

## 9. 国际化 i18n 用法

实现见 `src/lib/i18n/index.svelte.ts`（runes 模块），对外通过 `src/lib/i18n/index.ts` barrel 暴露：

```ts
export { t, setLocale, initLocale, i18n, LOCALES } from './index.svelte';
export type { Locale } from './index.svelte';
```

- `Locale` 类型：`'en' | 'zh-CN'`。
- `LOCALES`：`[{ value: 'en', label: 'English' }, { value: 'zh-CN', label: '简体中文' }]`，供语言切换 UI 遍历。
- `i18n.locale`：当前 locale 的响应式只读 getter。
- `t(key, vars?)`：翻译（dot-path + `{var}` 插值，回退 `en` → key）。
- `setLocale(l)`：切换并持久化。
- `initLocale()`：从持久化恢复（在根布局 `onMount` 调用）。

**持久化键**：locale 存在 `localStorage` 的 `'admin-starter:locale'`。

切换语言的现成入口是共享组件 `LanguageToggle`（顶栏与 auth 布局已用），其内部即调用 `setLocale`：

```svelte
import { LOCALES, setLocale, i18n, type Locale } from '$lib/i18n';
// 遍历 LOCALES 渲染下拉，点击项调用 setLocale(locale.value)，
// 并对 i18n.locale === locale.value 的项打勾。
```

### 新增一种语言（例如 `ja`）

1. 新建字典 `src/lib/i18n/locales/ja.ts`，结构与 `en.ts` 完全一致（`export default { ... } as const;`）。
2. 在 `index.svelte.ts` 中：
   - 扩展类型：`export type Locale = 'en' | 'zh-CN' | 'ja';`
   - 导入并注册到 `dictionaries`：`import ja from './locales/ja'; const dictionaries = { en, 'zh-CN': zhCN, ja };`
   - 在 `LOCALES` 数组加入 `{ value: 'ja', label: '日本語' }`。
   - 更新 `isLocale()` 的判断，把 `'ja'` 纳入。

---

## 10. 构建与部署

### 构建

```bash
npm run build     # vite build，产物在 .svelte-kit / build 目录（取决于 adapter）
npm run preview   # 本地预览生产构建
```

### Adapter

`svelte.config.js` 默认使用 `@sveltejs/adapter-auto`：

```js
import adapter from '@sveltejs/adapter-auto';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    // adapter-auto detects the deployment target. Swap for a specific
    // adapter (node, static, vercel, ...) when you know where this runs.
    adapter: adapter()
  }
};
```

`adapter-auto` 会在受支持的平台（Vercel/Netlify/Cloudflare 等）上自动选择适配器，**但不安装它们**。一旦确定部署目标，建议换成明确的 adapter：

| 目标 | adapter | 安装 |
| --- | --- | --- |
| Node 服务器 | `@sveltejs/adapter-node` | `npm i -D @sveltejs/adapter-node` |
| 纯静态站点 | `@sveltejs/adapter-static` | `npm i -D @sveltejs/adapter-static` |
| Vercel | `@sveltejs/adapter-vercel` | `npm i -D @sveltejs/adapter-vercel` |

换法（以 Node 为例）：

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-node';
// ...
kit: { adapter: adapter() }
```

> 注意：当前根布局 `+layout.ts` 设了 `ssr = true` 且鉴权守卫在客户端运行。若要用 `adapter-static` 完全静态化，需要确保没有依赖服务端的 `load`，并把整站 `prerender = true`（同时 mock 守卫的客户端跳转仍然有效，因为它在浏览器运行）。若接入真实后端的服务端守卫（第 8 节），则应使用 `adapter-node`/`adapter-vercel` 等支持 SSR 的适配器。
