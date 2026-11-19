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

### 技术栈（版本以 `package.json` 为准）

| 技术            | 包名                                            | 版本                | 说明                                                        |
| --------------- | ----------------------------------------------- | ------------------- | ----------------------------------------------------------- |
| SvelteKit 2     | `@sveltejs/kit`                                 | `^2.70.2`           | 应用框架、路由、SSR                                         |
| Svelte 5        | `svelte`                                        | `^5.56.8`           | 组件框架，使用 runes（`$state`/`$derived`/`$props` 等）     |
| Tailwind CSS v4 | `tailwindcss` / `@tailwindcss/vite`             | `^4.3.3`            | 原子化 CSS，通过 Vite 插件接入（无 `tailwind.config.js`）   |
| shadcn-svelte   | （源码内置，registry: `shadcn-svelte.com`）     | —                   | UI 组件以源码形式 vendored 在 `src/lib/core/components/ui/` |
| bits-ui         | `bits-ui`                                       | `^2.18.1`           | shadcn-svelte 底层无样式原语                                |
| Lucide 图标     | `@lucide/svelte`                                | `^1.28.0`           | 图标库，按 `@lucide/svelte/icons/<kebab>` 单独导入          |
| 主题切换        | `mode-watcher`                                  | `^1.1.0`            | light/dark/system 模式管理                                  |
| Toast 通知      | `svelte-sonner`                                 | `^1.0.7`            | toast 提示                                                  |
| 图表            | `layerchart`                                    | `^2.0.0-next.48`    | 图表库（部分页面用纯 SVG + 设计 token 手绘）                |
| 表单校验        | `zod`                                           | `^4.4.3`            | schema 校验                                                 |
| 表单增强        | `sveltekit-superforms` / `formsnap`             | `^2.0.1` / `^2.0.1` | 表单状态/绑定（可选使用）                                   |
| 类名合并        | `clsx` / `tailwind-merge` / `tailwind-variants` | —                   | `cn()` 工具的底层依赖                                       |

其它：`@internationalized/date`（calendar）、`embla-carousel-svelte`（carousel）、`paneforge`（resizable）、`vaul-svelte`（drawer）、`tw-animate-css`。

TypeScript `strict: true`，并对 `.js`/`.svelte` 同样开启类型检查（`tsconfig.json` 中 `checkJs: true`）。

---

## 2. 快速开始

### 前置要求

- **Node.js**：要求 `^20.19.0 || >=22.12.0`（以项目声明及安装检查为准）。`package.json` 已声明该 `engines` 字段，且 `.npmrc` 设置了 `engine-strict=true`，因此不满足版本要求的环境会在 `npm ci` / `npm install` 时被拦截。请使用 Node 20.19+ 或 22.12+（推荐最新 LTS）。
- **包管理器**：npm（仓库提供 `package-lock.json`）。

### 安装与启动

```bash
npm ci           # 按 package-lock.json 安装；prepare 会运行 svelte-kit sync
npm run dev      # 启动开发服务器（Vite），默认 http://localhost:5173
```

打开浏览器后访问 `/`，会被重定向到 `config.app.homePath`（默认 `/dashboard`）；未登录时进一步被守卫重定向到 `/login`。

### 默认登录

登录页预填了演示凭据：

- **Email**：`admin@example.com`
- **Password**：`password`

> ⚠️ 由于鉴权是 mock（见 `src/lib/auth/auth.svelte.ts`），**任意合法邮箱 + 任意 ≥ 8 字符的密码都能登录成功**。校验规则只有两条：email 非空、password 至少 8 个字符。其中邮箱 `admin@example.com` 会被赋予 `admin` 角色，其余邮箱为 `editor` 角色（`buildUser()` 逻辑）。

---

## 3. npm scripts 说明

命令定义以 `package.json` 为准；日常任务的验证范围见 [AGENTS.md](../AGENTS.md)。

| 命令                                    | 作用                                       |
| --------------------------------------- | ------------------------------------------ |
| `npm run dev`                           | 启动 Vite 开发服务器                       |
| `npm run build` / `npm run preview`     | 生产构建 / 本地预览                        |
| `npm run check` / `npm run check:watch` | Svelte 与 TypeScript 检查 / 持续检查       |
| `npm run lint`                          | Prettier 与 ESLint 检查                    |
| `npm run test:e2e`                      | Chromium 真实浏览器交互回归（先 build）    |
| `npm test`                              | Vitest 测试                                |
| `npm run check:export`                  | portable-core 导出契约检查                 |
| `npm run verify`                        | PR、完整发布和 CI 共用的完整验证入口       |
| `npm run format`                        | 格式化全仓库；小改动优先仅格式化受影响文件 |

> `prepare` 是 npm 生命周期钩子，`npm ci` / `npm install` 后自动执行 `svelte-kit sync`（生成 `.svelte-kit/` 与 `$app` 类型及内置 tsconfig），通常无需手动调用。

格式化规则见 `.prettierrc`：使用 Tab 缩进、单引号、`trailingComma: none`、`printWidth: 100`，并启用 `prettier-plugin-svelte` 与 `prettier-plugin-tailwindcss`（后者会自动排序 Tailwind 类名）。

---

浏览器测试位于 `e2e/`，首次执行先运行 `npx playwright install chromium`，再运行 `npm run build && npm run test:e2e`。命令先检查浏览器测试的 TypeScript 类型，再由 Playwright 自动启动生产预览服务，使用独立的 mock 登录状态，覆盖日历跨天/键盘导航、日期弹层提交/取消与看板键盘移动后的焦点恢复。CI 在 `verify` 后执行这组测试，并保留失败截图和 trace；`npm test` 仅运行 `src/**/*.test.ts`，不会混入浏览器测试。

## 4. 目录结构

下面是带注释的 `src/` 树（UI 原语目录仅示意，未逐个列出几十个 shadcn 组件）：

```text
src/
├── app.html                 # HTML 外壳模板（theme-color、favicon、%sveltekit.*%）
├── app.css                  # 仅导入 lib/core/theme.css（Tailwind 入口 + 设计 token）
├── app.d.ts                 # SvelteKit 全局类型声明
│
├── routes/                  # 文件系统路由（见第 5 节）
│   ├── +layout.svelte       # 根布局：挂载样式、ModeWatcher、Toaster，恢复 session + locale
│   ├── +layout.ts           # 根布局配置：ssr=true, prerender=false
│   ├── +page.svelte         # 首页（仅在 redirect 前短暂闪现一个 Spinner）
│   ├── +page.ts             # load() 重定向到 config.app.homePath
│   ├── +error.svelte        # 全局错误边界：状态感知（404/403/5xx），无 shell 的品牌全屏页
│   ├── (auth)/              # 鉴权 route group：登录/注册/找回密码（无 shell）
│   │   ├── +layout.svelte   # 居中卡片画布；已登录则跳转 config.app.homePath
│   │   ├── login/+page.svelte
│   │   ├── register/+page.svelte
│   │   └── forgot-password/+page.svelte
│   └── (app)/               # 应用 route group：受 mock 守卫保护，套 AppShell
│       ├── +layout.svelte   # 客户端守卫 + 首屏骨架 + AppShell（见第 5 节）
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
└── lib/                     # 可通过 #lib 别名导入
    ├── core/                # portable export 边界，内部使用相对路径
    │   ├── components/ui/   # vendored shadcn-svelte 原语
    │   ├── components/shared/ # PageContainer / DataTable / ThemeToggle 等组合组件
    │   ├── shell/           # Tabs / TabBar / KeepAliveOutlet / TAB_ROUTE
    │   ├── hooks/           # usePagination / useLocalStorage 等 runes hooks
    │   ├── stores/          # persisted()
    │   ├── utils/           # formatters / validators / csv / local-storage
    │   ├── theme.css        # Tailwind 入口、token、明暗主题与基础样式
    │   └── utils.ts         # cn() 与 shadcn 类型工具
    ├── components/shared/   # i18n/date-time/command/confirm 等应用集成；保留兼容 barrel
    ├── shell/               # AppShell / AppSidebar / AppHeader / nav 与 SvelteKit 适配
    ├── features/            # 领域组件、状态与规则
    │   ├── users/           # app layout 共享用户状态、编辑器与本地化校验
    │   ├── orders/          # 订单抽屉、时间线、金额来源与 CSV 投影
    │   ├── inbox/           # 每个页面实例独立的邮件状态、列表与阅读视图
    │   ├── sales/           # 发票行编辑器、类型与金额预览
    │   ├── clients/         # 快速创建客户
    │   ├── cart/            # 页面独立购物车状态、金额规则与商品/汇总组件
    │   ├── kanban/          # 页面独立看板状态、列与任务卡片
    │   ├── calendar/        # 日期规则、月历网格与日程列表
    │   ├── settings/        # 全局语言选择与设置文案
    │   ├── project-form/    # 项目表单文案
    │   └── profile/         # 个人资料文案
    ├── config/              # 品牌、默认主题、首页、mock auth 配置
    ├── auth/                # mock auth store / provider / types
    ├── i18n/                # typed t()、translate 桥接与 en / zh-CN 字典
    ├── server/              # 仅服务端的数据访问接缝
    ├── hooks/  stores/  utils/ # 兼容入口及应用专用 helper
    └── data/                # dashboard / products / users 等只读 mock 种子

templates/
└── pages/                   # list/form/detail/dashboard/settings 的复制式页面骨架（不参与运行时）
```

各层职责约定：

- **`routes/`**：页面与布局，决定 URL 结构与 SSR/守卫行为。
- **`lib/core/components/ui/`**：shadcn-svelte 原语，**以源码形式 vendored**（不是 npm 包）。可用 `npx shadcn-svelte@latest add <name>` 增量添加，或直接编辑。
- **`lib/core/components/shared/`**：portable 组合组件；**`lib/components/shared/`** 放应用专用集成。运行时代码优先直接导入所需组件文件，兼容 barrel 保留给现有消费者。
- **`lib/shell/`**：应用外壳与导航模型。新增导航项改 `nav.ts` 即可（见第 7 节）。
- **`lib/features/`**：按业务领域组织组件和规则。路由负责组合与交互入口；状态按实际共享范围创建，禁止直接修改模块级 mock 种子。Users 和通知状态在 app layout 内按会话共享，Inbox、Orders、Cart 与 Kanban 的演示交互在各页面实例内隔离。Cart 汇总复用纯金额规则；Kanban 同时支持拖放和键盘菜单移动；Calendar 按目标月份的真实天数生成月末种子日期；“今天”在标签页激活、窗口重新聚焦、页面恢复可见及本地午夜刷新，已有日程不会随刷新重新生成。月历支持方向键、Home/End、Page Up/Down 和单一 Tab 入口。领域 locale 片段汇入全局中英文字典，继续使用统一的 typed `t()`；设置语言选择直接读取全局 locale。订单列表、详情和 CSV 使用记录中的同一总额，不在详情中另行添加种子未提供的税费。
- **`lib/core/hooks/` `lib/core/stores/` `lib/core/utils/`**：portable hooks、持久化容器与纯工具；auth、i18n、mock data 与 app shell 依赖留在 core 之外。

> `#lib` 通过 `package.json` 的 Node subpath imports（`imports` 字段）映射至 `src/lib`；`$app` 类型与基础 tsconfig 由 `svelte-kit sync` 生成，`tsconfig.json` 仅 `extends "$app/tsconfig"`，不要手改生成文件。

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
	import { Toaster } from '#lib/core/components/ui/sonner';
	import { auth } from '#lib/auth';
	import { initLocale } from '#lib/i18n';
	import { config } from '#lib/config';

	let { children } = $props();

	onMount(() => {
		auth.init();
		initLocale();
	});
</script>

<ModeWatcher defaultMode={config.theme.defaultMode} />
<Toaster richColors position="top-right" />

{@render children()}
```

根布局配置 `src/routes/+layout.ts`：`ssr = true`、`prerender = false`。受保护的 `(app)` 区域在 SSR 与客户端 session 初始化期间显示骨架；认证后的页面内容等到客户端守卫完成后才挂载。

### 首页重定向 `src/routes/+page.ts`

索引路由只是入口，重定向到配置的首页，并通过 `$app/paths` 应用部署 base：

```ts
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { config } from '#lib/config';

export function load(): never {
	throw redirect(307, resolve(config.app.homePath));
}
```

对应的 `+page.svelte` 只在重定向前短暂闪现一个居中 `Spinner`。

### `(auth)` 分组

`src/routes/(auth)/+layout.svelte` 提供一个居中卡片画布（顶部装饰渐变、右上角语言/主题切换、品牌标）。**已登录用户会被送回 `config.app.homePath`**：

```svelte
onMount(() => {
  auth.init();
  if (auth.isAuthenticated) goto(resolve(config.app.homePath));
});
```

包含 `login/`、`register/`、`forgot-password/` 三个页面。

### `(app)` 分组与 mock 守卫

`src/routes/(app)/+layout.svelte` 在客户端恢复 session，未登录跳转到 `resolve(config.auth.afterLogout)`，已登录才挂载 `AppShell`。SSR 和初始化期间显示带 `role="status"` 的语义色骨架，减少空白首屏。守卫逻辑摘录如下；完整骨架、确认宿主与 users context 初始化见源码：

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '#lib/auth';
	import { config } from '#lib/config';
	import { t } from '#lib/i18n';
	import AppShell from '#lib/shell/AppShell.svelte';

	let { children } = $props();
	let ready = $state(false);
	onMount(() => {
		auth.init();
		if (!auth.isAuthenticated) void goto(resolve(config.auth.afterLogout));
		else ready = true;
	});
</script>

{#if ready}
	<AppShell {children} />
{:else}
	<div role="status" aria-label={t('common.loading')}>{t('common.loading')}</div>
{/if}
```

这是 mock 客户端守卫，不执行服务端认证；真实后端接入沿用第 8 节的接缝。`AppShell` 组合 sidebar、header、TabBar 与 KeepAliveOutlet。正常 app 页的 document title 由 AppShell 使用活动 tab 标签和 `pageTitle()` 统一生成；`+error.svelte` 在错误状态下自行提供标题，普通 app 页不要另写 `<title>`。

Keep-alive 以 tab ID 保存组件实例和 `{ pathname, url, params, data, form }` 快照；进入错误页时隐藏缓存页并渲染 Kit 的错误 children，已加载页面继续挂载。动态页优先读取 LayoutChain 传入的可选 `params` prop（原生 Kit 渲染时可回退 `page.params`），或从 `#lib/core/shell/tab-route` 的 `TAB_ROUTE` context 读取该 tab 的路由状态。不要在缓存子树中直接依赖全局 `page.params` / `page.url` 来标识自己的记录。

应用边界用 `#lib/shell/paths` 的 `toAppPathname` / `toAppUrl` 去除浏览器 URL 的 base；存储的 tab 路径保持应用相对，实际导航由 `resolve` / `resolveAppUrl` 加回 base。导航与 keep-alive 注册器一致忽略 route group 目录名。

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
  	actions?: Snippet; // snippet 作为「插槽」传入
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
  import * as Card from '#lib/core/components/ui/card';
  import * as Sidebar from '#lib/core/components/ui/sidebar';
  import * as DropdownMenu from '#lib/core/components/ui/dropdown-menu';
  // 用法：<Card.Root> <Card.Header> <Card.Title> ...
  ```
  单组件原语用具名导入：`import { Button } from '#lib/core/components/ui/button';`、`import { Input } from '#lib/core/components/ui/input';`。
- **图标按需单独导入**，路径为 `@lucide/svelte/icons/<kebab-case>`：
  ```ts
  import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
  import ChartLine from '@lucide/svelte/icons/chart-line';
  ```
- **`cn()` 来自 `#lib/core/utils`**，用于合并/去重 Tailwind 类名：
  ```ts
  import { cn } from '#lib/core/utils';
  class={cn('overflow-hidden', className)}
  ```
- **`page` 来自 `$app/state`**（注意是 `state` 不是已弃用的 `$app/stores`），直接读 `page.url.pathname` / `page.status`：
  ```ts
  import { page } from '$app/state';
  const pathname = $derived(page.url.pathname);
  ```
- **`goto` 来自 `$app/navigation`**：`import { goto } from '$app/navigation';`。
- **组合组件优先直接导入**：如 `import PageHeader from '#lib/core/components/shared/PageHeader.svelte';`；应用专用组件从 `src/lib/components/shared/` 导入。兼容 barrel 仍保留。

### 设计 token 优先

颜色/圆角等一律使用 `src/lib/core/theme.css` 中定义的设计 token（CSS 变量 + 对应的 Tailwind 语义类），**不要硬编码颜色**。优先用 `bg-background` / `text-foreground` / `bg-primary` / `text-muted-foreground` / `border-border` / `bg-card` / `bg-accent` 等语义类；需要原始变量时用 `var(--primary)`（如 Dashboard 里手绘 SVG 图表的描边 `stroke="var(--primary)"`）。这样可天然适配 light/dark 两套主题。

### 多实例 ID 与缓存页

同一路由可以同时打开多个独立 tab。字段、错误说明、SVG gradient、列锚点等 DOM ID 用组件级 `$props.id()` 加局部后缀，并让 `for`、ARIA 引用、`url(#...)` 和 DOM 查询共用同一值；避免固定字符串或随机 ID：

```svelte
<script lang="ts">
	const instanceId = $props.id();
</script>

<Label for={`${instanceId}-name`}>Name</Label>
<Input id={`${instanceId}-name`} />
```

### UI 文案使用英文

模板内置 UI 文案以**英文**为默认语（`en` 是 i18n 的 fallback locale）。新增界面文案时：固定 UI 字符串走 i18n 字典（见第 9 节），临时/页面级文案保持英文，与现有页面一致。

---

## 7. 常见任务 how-to

### 7.1 新增一个 `(app)` 页面

先从 `templates/pages/` 选择最接近的 `list`、`form`、`detail`、`dashboard` 或 `settings` 骨架，将其中的 `+page.svelte` 复制到 `src/routes/(app)/<name>/`，再替换占位内容和接入真实业务。生成后的页面归路由自身维护，不要从 `templates/` 运行时导入，也无需与模板保持同步。应用内的 `/templates/*` 路由用于预览这些布局；组件能力则集中在 `/components`、`/icons` 与 `/charts`。

例如，简单页面可以从 list 骨架开始，并用 `PageContainer` + `PageHeader` 保持版式一致：

```svelte
<!-- src/routes/(app)/reports/+page.svelte -->
<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import { Button } from '#lib/core/components/ui/button';
</script>

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

新增 app 页无需 `<title>`：AppShell 会使用导航标签或 `breadcrumb` 命名活动 tab。`PageHeader` 的 props（来自 `PageHeader.svelte`）：`title: string`、`description?: string`、`actions?: Snippet`、`class?: string`。
`PageContainer` 的 props：`children: Snippet`、`class?: string`（统一 `max-w-7xl` + 响应式 padding + `space-y-6`）。

> 动态路由（如 `users/[id]`）若想让叶子面包屑显示友好标签而非原始 id 段，可加一个 `+page.ts`，让其 `load` 返回 `{ breadcrumb: '...' }`（见 7.7）。

### 7.2 在侧边栏新增导航项

导航是数据驱动的——编辑 `src/lib/shell/nav.ts`，往对应 `NavGroup` 的 `items` 里加一条 `NavItem`。`AppSidebar.svelte` 会自动按 `navGroups` 渲染并高亮当前路由；若对应 `+page.svelte` 被删除，该条目及空分组会自动隐藏。

当前分组为 Overview、Applications、Component Gallery、Data Tables、Page Templates 与 Account；具体条目和顺序以 `nav.ts` 为准。

> `users/[id]` 没有自己的导航项——它由 Users 列表里点击姓名进入；活动态由 `findNavItem()` 按「最长 href 前缀」匹配回落到 `/users`。

### 7.3 安全裁剪示例页面

裁剪示例页时保留仍需使用的应用基础设施：`src/routes/+*`、`src/routes/(app)/+*`、`src/lib/core/`、`src/lib/shell/`、`src/lib/config/`，以及仍被业务引用的 auth、i18n 与共享组件。`src/routes/(app)/<feature>/` 下的示例或功能路由可按需删除，侧边栏和命令菜单会自动忽略已删除路由。

删除当前首页前，先把 `src/lib/config/index.ts` 的 `config.app.homePath` 改到另一个存在的 `(app)` 路由。`src/routes/(app)/templates/`、`src/routes/(app)/tables/` 等展示页均可删除；`templates/pages/` 只在需要复制式页面骨架时保留。裁剪后按 [AGENTS.md](../AGENTS.md) 验证路由、构建和受影响行为。

类型定义（来自 `nav.ts`）：

```ts
export interface NavItem {
	title: string;
	href: string;
	icon: Component; // 来自 @lucide/svelte/icons/*
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

### 7.4 新增一个 shadcn 组件

UI 原语以源码形式存放在 `src/lib/core/components/ui/`。用 CLI 增量添加（配置已在 `components.json` 中就绪，registry 指向 `https://shadcn-svelte.com/registry`）：

```bash
npx shadcn-svelte@latest add <name>
# 例如：
npx shadcn-svelte@latest add data-table
```

CLI 会按 `components.json` 的别名（`ui` → `#lib/core/components/ui`，`utils` → `#lib/core/utils`，`hooks` → `#lib/core/hooks`）把组件源码写入项目；之后即可 `import * as <Name> from '#lib/core/components/ui/<name>';`。注意：基础色为 `slate`，CSS 入口为 `src/lib/core/theme.css`。

### 7.5 使用 toast（svelte-sonner）

`Toaster` 已在根布局挂载（`richColors`、`position="top-right"`），页面里直接从 `svelte-sonner` 导入 `toast` 调用即可：

```ts
import { toast } from 'svelte-sonner';

toast.success('Welcome back!');
toast.error('Unable to sign in. Please try again.');
toast.success(next ? 'Compact density enabled' : 'Comfortable density enabled');
```

（示例分别取自 `login/+page.svelte` 与 `settings/appearance/+page.svelte`。）

### 7.6 使用 i18n `t()` 与新增文案

在组件里导入并调用 `t()`，key 为 dot-path，支持 `{var}` 插值：

```ts
import { t } from '#lib/i18n';

t('common.search'); // -> "Search"
t('dashboard.greeting', { name: firstName }); // -> "Welcome back, <name>"
```

新增一条文案：**同时**在 `src/lib/i18n/locales/en.ts` 和 `zh-CN.ts` 的相同 dot-path 下添加（两个字典结构必须严格一致），例如：

```ts
// en.ts
nav: { /* ... */, reports: 'Reports' }
// zh-CN.ts
nav: { /* ... */, reports: '报表' }
```

> 固定 key 由 `TranslationKey` 检查；字典通过共享 `Dictionary` 类型约束键结构。宽字符串回调使用 `translate()`，保留当前 locale → `en` → key 的运行时回退。

### 7.7 为动态路由覆写面包屑标签

面包屑由 `src/lib/shell/Breadcrumbs.svelte` 根据当前路径 + 导航模型自动生成；动态段（如 `[id]`）默认会显示原始 id。要让叶子面包屑显示友好标签，在该路由下加一个 `+page.ts`，让其 `load` 返回 `{ breadcrumb: '...' }`：

```ts
// src/routes/(app)/users/[id]/+page.ts
import { demoUsers } from '#lib/data/users';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const user = demoUsers.find((u) => u.id === params.id);
	return { breadcrumb: user?.name };
};
```

`Breadcrumbs.svelte` 和 tab title 共用 `routeLabelFor`，依次采用显式 override、`leafCrumb` 客户端标签、load 的 `breadcrumb`、导航标签或路径段。load 标签来自 `page.data.breadcrumb`：当它是非空字符串时，用它替换**最后一个**面包屑的 label（仅当 trail 长度 > 1）。于是 `/users/u_123` 的面包屑会显示用户名而不是原始 id。演示 Users 的编辑状态由 `(app)` layout context 中的 `createUsersState()` 创建，并在列表和详情之间共享；它不会写入模块级 mock 种子，也不会把一个服务端请求的修改泄漏给其它请求。

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

守卫位置：`(app)/+layout.svelte`（未登录跳 `/login`）与 `(auth)/+layout.svelte`（已登录跳 `config.app.homePath`），都在客户端 `onMount` 调 `auth.init()` 后判断。

### 如何接入真实后端

后端接入围绕**三个 seam**，互不耦合、各管一摊：

| 配置/接缝            | 文件                       | 职责                                                                            |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `config.api.baseUrl` | `src/lib/config/index.ts`  | 「后端在哪」——空字符串 = 全 mock 模式；非空时下面两个 provider 自动切到真实请求 |
| `AuthProvider`       | `src/lib/auth/provider.ts` | 「怎么认证」——login / register / logout 的实现                                  |
| `db`                 | `src/lib/server/db.ts`     | 「数据从哪来」——仅服务端，业务页面经 `+page.server.ts` 的 `load` 读取           |

> 命名上刻意把「地址」与「策略」分开：`config.api.baseUrl` 被 auth 与数据层**共用**；`config.app.homePath` 统一应用首页；`config.auth` 只放认证策略（session key、登出跳转、密码规则、demo 凭据）。

1. **配置后端地址**：把 `config.api.baseUrl` 指向你的 API。生产环境通常从环境变量取，而非硬编码——例如 `import { env } from '$env/dynamic/public'` 后 `baseUrl: env.PUBLIC_API_URL ?? ''`（`PUBLIC_` 前缀的变量可在客户端读取，定义在 `.env`）。`baseUrl` 一旦非空，`provider.ts` 与 `db.ts` 内置的分支就自动走真实 `fetch`，无须改其它代码。

2. **实现认证 `AuthProvider`**（`src/lib/auth/provider.ts`）：文件已内置 `apiAuthProvider`（打 `config.api.baseUrl` 的 `/auth/*` 端点）与 `mockAuthProvider`，底部导出 `authProvider` 按 `baseUrl` 是否配置自动二选一。把 `apiAuthProvider` 里的端点路径与请求/响应 JSON 形状改成你后端的契约即可。`auth.svelte.ts` 只消费 `authProvider`，无须改动；`auth.user` / `auth.isAuthenticated` 等对外 getter 契约不变，守卫、侧边栏、顶栏都不用动。

3. **实现数据层 `db`**（`src/lib/server/db.ts`，**仅服务端**）：在业务路由新增 `+page.server.ts`，通过 `load` 调用 `db`（如 `{ products: await db.products.list() }`；见 db.ts 顶部示例）。当前 `/tables/server` 仅模拟 DataTable 的外部分页回调，没有 server load。把每个方法体换成真实数据库/API 查询、保持签名不变，页面就不用改。`products.list` 已示范「有 `baseUrl` 就 `fetch`，否则回退 mock」的形态。此文件在 `#lib/server/`，连同它 import 的任何 DB 凭据都**不会**进浏览器包。

4. **增加服务端守卫**：当前守卫是纯客户端的，认证前仅显示骨架；真实访问控制仍需要服务端校验——在 `(app)/` 下新增 `+layout.server.ts`，在 `load` 中读取 cookie/session 并在未认证时 `throw redirect(302, '/login')`：

   ```ts
   // src/routes/(app)/+layout.server.ts （示例）
   import { redirect } from '@sveltejs/kit';
   export const load = async ({ locals }) => {
   	if (!locals.user) throw redirect(302, '/login');
   	return { user: locals.user };
   };
   ```

   配合 `src/hooks.server.ts` 解析 cookie 并写入 `event.locals.user`。届时可考虑把根布局 `+layout.ts` 中的 `prerender`/`ssr` 策略一并调整。

5. **环境变量约定**：用 `PUBLIC_API_URL` 之类的 `PUBLIC_` 前缀变量保存后端地址（供 `config.api.baseUrl` 取用）；敏感值（如服务端密钥）用不带前缀的私有变量，仅在 `*.server.ts`（如 `db.ts`）中通过 `$env/static/private` 或 `$env/dynamic/private` 读取。

---

## 9. 国际化 i18n 用法

实现见 `src/lib/i18n/index.svelte.ts`（runes 模块），对外通过 `src/lib/i18n/index.ts` barrel 暴露：

```ts
export { t, translate, setLocale, initLocale, i18n, LOCALES } from './index.svelte';
export type { Dictionary, Locale, TranslationKey, TranslationValues } from './types';
```

- `Locale` 类型：`'en' | 'zh-CN'`。
- `LOCALES`：`[{ value: 'en', label: 'English' }, { value: 'zh-CN', label: '简体中文' }]`，供语言切换 UI 遍历。
- `i18n.locale`：当前 locale 的响应式只读 getter。
- `t(key, vars?)`：接受字典导出的 `TranslationKey`，在编译期检查固定 key；运行时按当前语言 → `en` → key 回退并插值。
- `translate(key: string, vars?)`：宽字符串桥接，供 portable core 的翻译回调或动态 metadata 使用；固定 UI 文案优先使用 typed `t()`。
- `Dictionary`：由英文结构派生，要求其它 locale 提供相同的嵌套字符串键。
- `setLocale(l)`：切换并持久化。
- `initLocale()`：从持久化恢复（在根布局 `onMount` 调用）。

**持久化键**：locale 存在 `localStorage` 的 `'admin-starter:locale'`。

切换语言的现成入口是共享组件 `LanguageToggle`（顶栏与 auth 布局已用），其内部即调用 `setLocale`：

```svelte
import { LOCALES, setLocale, i18n, type Locale } from '#lib/i18n';
// 遍历 LOCALES 渲染下拉，点击项调用 setLocale(locale.value)，
// 并对 i18n.locale === locale.value 的项打勾。
```

### 新增一种语言（例如 `ja`）

1. 新建字典 `src/lib/i18n/locales/ja.ts`，结构与 `en.ts` 一致，并用 `satisfies Dictionary` 检查完整性。
2. 在 `src/lib/i18n/types.ts` 扩展 `Locale` 为 `'en' | 'zh-CN' | 'ja'`；在 `index.svelte.ts` 中：
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

`vite.config.ts` 中的 `sveltekit(...)` 插件默认使用 `@sveltejs/adapter-auto`：

```ts
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

sveltekit({
	preprocess: vitePreprocess(),
	// adapter-auto detects the deployment target. Swap for a specific
	// adapter (node, static, vercel, ...) when you know where this runs.
	adapter: adapter()
});
```

`adapter-auto` 会在受支持的平台（Vercel/Netlify/Cloudflare 等）上自动选择适配器，**但不安装它们**。一旦确定部署目标，建议换成明确的 adapter：

| 目标        | adapter                    | 安装                                |
| ----------- | -------------------------- | ----------------------------------- |
| Node 服务器 | `@sveltejs/adapter-node`   | `npm i -D @sveltejs/adapter-node`   |
| 纯静态站点  | `@sveltejs/adapter-static` | `npm i -D @sveltejs/adapter-static` |
| Vercel      | `@sveltejs/adapter-vercel` | `npm i -D @sveltejs/adapter-vercel` |

换法（以 Node 为例）：

```ts
// vite.config.ts
import adapter from '@sveltejs/adapter-node';
// ...
sveltekit({
	preprocess: vitePreprocess(),
	adapter: adapter()
});
```

> 注意：当前根布局 `+layout.ts` 设了 `ssr = true` 且鉴权守卫在客户端运行。若要用 `adapter-static` 完全静态化，需要确保没有依赖服务端的 `load`，并把整站 `prerender = true`（同时 mock 守卫的客户端跳转仍然有效，因为它在浏览器运行）。若接入真实后端的服务端守卫（第 8 节），则应使用 `adapter-node`/`adapter-vercel` 等支持 SSR 的适配器。
