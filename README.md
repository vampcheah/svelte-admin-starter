# Svelte Admin Starter

A production-grade **admin dashboard starter template** built with **SvelteKit 2 · Svelte 5 (runes) · Tailwind CSS v4 · shadcn-svelte**.
Frontend only — no backend. Auth and data are mocked so you can clone it and start building features immediately.

> Default login: **`admin@example.com`** / **`password`** — but any email with an 8+ character password works (mock auth).

---

## ✨ Features

- **Complete shadcn-svelte component set** — all 47 UI primitives pre-installed (`src/lib/components/ui`).
- **Polished app shell** — collapsible sidebar (built on shadcn `sidebar`), sticky header with breadcrumbs, command palette (⌘K), notifications, theme & language switchers, user menu.
- **Reusable building blocks** — `PageHeader`, `PageContainer`, `StatCard`, a generic `DataTable` (search / sort / pagination / selection), `EmptyState`, `ConfirmDialog`, `SearchInput`, `CommandMenu`, `ThemeToggle`, `LanguageToggle`, `Spinner`.
- **Mock auth** — login / register / forgot-password flows with a client-side route guard, ready to swap for a real backend.
- **Light i18n** — runes-based, English + 简体中文, locale persisted to `localStorage`.
- **Dark mode** — semantic OKLCH design tokens via `mode-watcher`; no hardcoded colors.
- **Rich example pages** — Dashboard, Users (full CRUD), Tables, Forms, Charts, a Components showcase, Profile, and Settings.
- **Typed & verified** — strict TypeScript, `svelte-check` clean, production build passes.

## 🧱 Tech stack

| Area | Choice |
| --- | --- |
| Framework | SvelteKit 2 · Svelte 5 (runes) |
| Styling | Tailwind CSS v4 · `tw-animate-css` |
| Components | shadcn-svelte · bits-ui |
| Icons | `@lucide/svelte` |
| Theme | `mode-watcher` |
| Toasts | `svelte-sonner` |
| Charts | `layerchart` |
| Validation | `zod` |

## 🚀 Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Then sign in with `admin@example.com` / `password`.

### Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run preview    # preview the production build
npm run check      # type-check with svelte-check
npm run lint       # prettier --check + eslint
npm run format     # prettier --write
```

## 📂 Project structure

```
src/
├── app.css                  # design tokens (OKLCH) + dark theme
├── app.html
├── routes/
│   ├── +layout.svelte       # root: stylesheet, ModeWatcher, Toaster, session/locale init
│   ├── +page.ts             # redirects / → /dashboard
│   ├── +error.svelte        # 404 / 500
│   ├── (auth)/              # login · register · forgot-password (centered, no shell)
│   └── (app)/              # behind the mock auth guard, wrapped in <AppShell>
│       ├── dashboard/  users/  tables/  forms/  charts/
│       ├── components/      # UI kitchen-sink showcase
│       ├── profile/  settings/
└── lib/
    ├── components/
    │   ├── ui/              # 47 shadcn-svelte primitives
    │   └── shared/         # reusable composite components
    ├── shell/              # AppShell, AppSidebar, AppHeader, nav config
    ├── auth/               # mock auth store + types
    ├── i18n/               # light i18n (en, zh-CN)
    ├── hooks/  stores/  data/  utils/
    └── utils.ts            # cn() + shadcn type helpers
```

## 🧭 Where to start

- **Add a nav item:** edit `src/lib/shell/nav.ts`.
- **Add a page:** create `src/routes/(app)/<name>/+page.svelte`.
- **Add a UI component:** `npx shadcn-svelte@latest add <name>`.
- **Wire a real backend:** replace the mock logic in `src/lib/auth/auth.svelte.ts` and add a server-side guard.

## 📖 Documentation (中文指引)

Detailed guides live in [`docs/`](./docs):

- [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) — 开发指引 · project setup, conventions, common tasks, backend integration.
- [`docs/COMPONENTS.md`](./docs/COMPONENTS.md) — 组件指引 · the three-layer component system, props & usage examples.
- [`docs/DESIGN.md`](./docs/DESIGN.md) — 设计指引 · design tokens, color system, dark mode, theming.

## 📝 License

MIT — use it freely as the base for your own admin app.
